import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/dataStorage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      business_id,
      user_name,
      user_email,
      rating,
      comment,
      images
    } = body;

    // Validate required fields
    if (!business_id || !user_name || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create new review with persistent storage
    const newReview = dataStorage.addReview({
      business_id,
      user_name,
      user_email,
      rating,
      comment,
      images: images || [],
      helpful_count: 0
    });

    return NextResponse.json({
      success: true,
      data: newReview,
      message: 'Review submitted successfully'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const business_id = searchParams.get('business_id');

    let reviews = dataStorage.getReviews();

    if (business_id) {
      reviews = reviews.filter(r => r.business_id === business_id);
    }

    // Sort by most recent
    reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      data: reviews,
      total: reviews.length
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
