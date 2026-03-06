import { NextRequest, NextResponse } from 'next/server';

// Mock AI trending analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // Mock trending businesses based on AI analysis
    const trendingBusinesses = [
      {
        id: '1',
        name: 'Neon Gaming Zone',
        slug: 'neon-gaming-zone',
        category: 'Entertainment',
        rating: 4.8,
        review_count: 234,
        trending_score: 95,
        trend_reason: 'High engagement on social media + recent positive reviews',
        price_comparison: {
          avg_price: 250,
          competitor_prices: [299, 199, 349],
          price_position: 'Competitive'
        }
      },
      {
        id: '2',
        name: 'Cafe Bliss',
        slug: 'cafe-bliss',
        category: 'Restaurant',
        rating: 4.6,
        review_count: 189,
        trending_score: 88,
        trend_reason: 'Increasing bookings + Instagram popularity',
        price_comparison: {
          avg_price: 150,
          competitor_prices: [180, 120, 200],
          price_position: 'Below Average'
        }
      },
      {
        id: '3',
        name: 'Style Studio',
        slug: 'style-studio',
        category: 'Beauty',
        rating: 4.7,
        review_count: 156,
        trending_score: 82,
        trend_reason: 'Seasonal demand + positive word-of-mouth',
        price_comparison: {
          avg_price: 400,
          competitor_prices: [450, 350, 500],
          price_position: 'Value for Money'
        }
      }
    ];

    // Filter by category if specified
    let filteredTrending = trendingBusinesses;
    if (category && category !== 'all') {
      filteredTrending = trendingBusinesses.filter(b => b.category === category);
    }

    // AI Insights
    const insights = {
      top_categories: [
        { category: 'Restaurant', growth: '+25%', reason: 'Weekend dining trends' },
        { category: 'Entertainment', growth: '+18%', reason: 'Gaming popularity surge' },
        { category: 'Beauty', growth: '+15%', reason: 'Festive season demand' }
      ],
      price_trends: {
        average_price_increase: '+8%',
        most_affordable_category: 'Shopping',
        most_premium_category: 'Healthcare'
      },
      user_behavior: {
        peak_booking_hours: ['18:00', '19:00', '20:00'],
        popular_services: ['Table Reservation', 'VR Gaming', 'Hair Styling'],
        conversion_rate: '12.5%'
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        trending_businesses: filteredTrending,
        insights,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending data' },
      { status: 500 }
    );
  }
}
