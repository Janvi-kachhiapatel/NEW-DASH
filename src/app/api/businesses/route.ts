import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/dataStorage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const featured = searchParams.get('featured');

    // Get businesses from persistent storage
    let businesses = dataStorage.getBusinesses();

    // Filter by category
    if (category && category !== 'all') {
      businesses = businesses.filter(b => b.category === category);
    }

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      businesses = businesses.filter(b => 
        b.name.toLowerCase().includes(searchLower) ||
        b.description.toLowerCase().includes(searchLower) ||
        b.category.toLowerCase().includes(searchLower)
      );
    }

    // Filter featured businesses
    if (featured === 'true') {
      businesses = businesses.filter(b => b.is_featured);
    }

    // Calculate distances if lat/lng provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      businesses = businesses.map(business => ({
        ...business,
        distance: calculateDistance(userLat, userLng, business.location_lat, business.location_lng)
      }));
    }

    return NextResponse.json({
      success: true,
      data: businesses,
      total: businesses.length
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create new business with persistent storage
    const newBusiness = dataStorage.addBusiness({
      ...body,
      is_verified: false,
      is_featured: false,
      rating: 0,
      review_count: 0
    });

    return NextResponse.json({
      success: true,
      data: newBusiness,
      message: 'Business created successfully'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create business' },
      { status: 500 }
    );
  }
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}
