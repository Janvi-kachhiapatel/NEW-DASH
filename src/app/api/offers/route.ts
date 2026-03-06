import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const featured = searchParams.get('featured') === 'true';
    const active = searchParams.get('active') !== 'false'; // Default to true
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('offers')
      .select(`
        *,
        business:businesses (
          id,
          name,
          slug,
          logo_url,
          rating,
          category,
          address,
          location_lat,
          location_lng
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add filters
    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    if (category) {
      query = query.eq('business.category', category);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    if (active) {
      query = query
        .eq('status', 'active')
        .gt('expiry_time', new Date().toISOString());
    }

    // Add location filter if provided
    if (location) {
      const [lat, lng] = location.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        const latRange = 0.1; // Approximate 10km range
        const lngRange = 0.1;
        
        query = query
          .gte('business.location_lat', lat - latRange)
          .lte('business.location_lat', lat + latRange)
          .gte('business.location_lng', lng - lngRange)
          .lte('business.location_lng', lng + lngRange);
      }
    }

    const { data: offers, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch offers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      offers: offers || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      business_id,
      title,
      description,
      discount_percent,
      discount_amount,
      original_price,
      offer_price,
      offer_type,
      quantity_available,
      expiry_time,
      is_flash_sale,
      is_featured,
      terms_conditions,
      image_url
    } = body;

    // Validate required fields
    if (!business_id || !title || !expiry_time) {
      return NextResponse.json(
        { error: 'business_id, title, and expiry_time are required' },
        { status: 400 }
      );
    }

    // Validate offer type and discount
    if (offer_type === 'percentage' && (!discount_percent || discount_percent < 0 || discount_percent > 100)) {
      return NextResponse.json(
        { error: 'Valid discount_percent (0-100) is required for percentage offers' },
        { status: 400 }
      );
    }

    if (offer_type === 'fixed' && (!discount_amount || discount_amount <= 0)) {
      return NextResponse.json(
        { error: 'Valid discount_amount is required for fixed amount offers' },
        { status: 400 }
      );
    }

    // Check if expiry time is in the future
    const expiryDate = new Date(expiry_time);
    if (expiryDate <= new Date()) {
      return NextResponse.json(
        { error: 'Expiry time must be in the future' },
        { status: 400 }
      );
    }

    // Create the offer
    const { data: offer, error } = await supabase
      .from('offers')
      .insert({
        business_id,
        title,
        description,
        discount_percent,
        discount_amount,
        original_price,
        offer_price,
        offer_type,
        quantity_available,
        expiry_time,
        is_flash_sale: is_flash_sale || false,
        is_featured: is_featured || false,
        terms_conditions,
        image_url
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create offer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      offer
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
