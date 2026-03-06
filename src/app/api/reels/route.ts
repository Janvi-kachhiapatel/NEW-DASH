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
    const trending = searchParams.get('trending') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('business_reels')
      .select(`
        *,
        business:businesses (
          id,
          name,
          slug,
          logo_url,
          is_verified,
          rating,
          category,
          follower_count
        ),
        music_track:music_tracks (
          id,
          title,
          artist
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add filters
    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    if (category) {
      query = query.eq('business.category', category);
    }

    if (trending) {
      query = query
        .eq('is_trending', true)
        .order('trending_rank', { ascending: true });
    }

    // Add location filter if provided
    if (location) {
      const [lat, lng] = location.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        const latRange = 0.1; // Approximate 10km range
        const lngRange = 0.1;
        
        query = query
          .gte('location_lat', lat - latRange)
          .lte('location_lat', lat + latRange)
          .gte('location_lng', lng - lngRange)
          .lte('location_lng', lng + lngRange);
      }
    }

    const { data: reels, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reels' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reels: reels || [],
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
      video_url,
      thumbnail_url,
      caption,
      duration_seconds,
      music_track_id,
      hashtags,
      location_lat,
      location_lng,
      location_name,
      creator_id
    } = body;

    // Validate required fields
    if (!business_id || !video_url || !caption) {
      return NextResponse.json(
        { error: 'business_id, video_url, and caption are required' },
        { status: 400 }
      );
    }

    // Create the reel
    const { data: reel, error } = await supabase
      .from('business_reels')
      .insert({
        business_id,
        video_url,
        thumbnail_url,
        caption,
        duration_seconds,
        music_track_id,
        hashtags: hashtags || [],
        location_lat,
        location_lng,
        location_name,
        creator_id
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create reel' },
        { status: 500 }
      );
    }

    // Update business analytics
    await supabase.rpc('increment_business_stat', {
      business_id_param: business_id,
      stat_name: 'reel_count'
    });

    return NextResponse.json({
      success: true,
      reel
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
