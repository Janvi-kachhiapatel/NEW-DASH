import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '5'); // Default 5km
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Query for nearby businesses using PostGIS
    let query = supabase
      .from('businesses')
      .select(`
        *,
        services (
          id,
          name,
          price,
          duration_minutes
        ),
        offers (
          id,
          title,
          discount_percent,
          expiry_time,
          is_featured
        )
      `)
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .limit(limit);

    // Add category filter if specified
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    // Add location filter using PostGIS distance calculation
    // This is a simplified version - in production you'd use ST_DWithin
    const latRange = radius / 111; // Approximate km to degrees
    const lngRange = radius / (111 * Math.cos(lat * Math.PI / 180));

    query = query
      .gte('location_lat', lat - latRange)
      .lte('location_lat', lat + latRange)
      .gte('location_lng', lng - lngRange)
      .lte('location_lng', lng + lngRange);

    const { data: businesses, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch businesses' },
        { status: 500 }
      );
    }

    // Calculate actual distance for each business
    const businessesWithDistance = businesses?.map(business => {
      const distance = calculateDistance(lat, lng, business.location_lat, business.location_lng);
      return {
        ...business,
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
      };
    }) || [];

    // Sort by distance
    businessesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    // Filter out businesses outside the actual radius (more precise filtering)
    const nearbyBusinesses = businessesWithDistance.filter(
      business => (business.distance || 0) <= radius
    );

    return NextResponse.json({
      businesses: nearbyBusinesses,
      total: nearbyBusinesses.length,
      center: { lat, lng },
      radius
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
