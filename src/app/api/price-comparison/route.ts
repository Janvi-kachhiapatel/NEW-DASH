import { NextRequest, NextResponse } from 'next/server';

// Mock price comparison data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const service = searchParams.get('service');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // Mock price comparison data
    const priceComparisons = {
      'Restaurant': {
        service: 'Table Reservation',
        businesses: [
          {
            id: '1',
            name: 'Cafe Bliss',
            slug: 'cafe-bliss',
            price: 0,
            rating: 4.6,
            distance: 0.8,
            price_position: 'Free',
            value_score: 92
          },
          {
            id: '2',
            name: 'Pizza Palace',
            slug: 'pizza-palace',
            price: 100,
            rating: 4.5,
            distance: 0.5,
            price_position: 'Average',
            value_score: 85
          },
          {
            id: '3',
            name: 'Burger House',
            slug: 'burger-house',
            price: 150,
            rating: 4.3,
            distance: 1.2,
            price_position: 'Above Average',
            value_score: 78
          }
        ],
        market_insights: {
          average_price: 83,
          price_range: '₹0 - ₹150',
          best_value: 'Cafe Bliss',
          most_popular: 'Pizza Palace'
        }
      },
      'Entertainment': {
        service: 'Gaming Session',
        businesses: [
          {
            id: '1',
            name: 'Neon Gaming Zone',
            slug: 'neon-gaming-zone',
            price: 299,
            rating: 4.8,
            distance: 1.2,
            price_position: 'Competitive',
            value_score: 95
          },
          {
            id: '2',
            name: 'Game Hub',
            slug: 'game-hub',
            price: 349,
            rating: 4.5,
            distance: 2.1,
            price_position: 'Premium',
            value_score: 82
          },
          {
            id: '3',
            name: 'Play Zone',
            slug: 'play-zone',
            price: 199,
            rating: 4.2,
            distance: 3.5,
            price_position: 'Budget',
            value_score: 75
          }
        ],
        market_insights: {
          average_price: 282,
          price_range: '₹199 - ₹349',
          best_value: 'Neon Gaming Zone',
          most_popular: 'Neon Gaming Zone'
        }
      },
      'Beauty': {
        service: 'Hair Styling',
        businesses: [
          {
            id: '1',
            name: 'Style Studio',
            slug: 'style-studio',
            price: 399,
            rating: 4.7,
            distance: 2.1,
            price_position: 'Value for Money',
            value_score: 88
          },
          {
            id: '2',
            name: 'Glamour Salon',
            slug: 'glamour-salon',
            price: 599,
            rating: 4.9,
            distance: 1.8,
            price_position: 'Premium',
            value_score: 85
          },
          {
            id: '3',
            name: 'Quick Cuts',
            slug: 'quick-cuts',
            price: 299,
            rating: 4.1,
            distance: 0.9,
            price_position: 'Budget',
            value_score: 72
          }
        ],
        market_insights: {
          average_price: 432,
          price_range: '₹299 - ₹599',
          best_value: 'Style Studio',
          most_popular: 'Style Studio'
        }
      }
    };

    let comparisonData = priceComparisons[category as keyof typeof priceComparisons];

    if (!comparisonData) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Sort by value score (rating vs price ratio)
    comparisonData.businesses.sort((a, b) => b.value_score - a.value_score);

    return NextResponse.json({
      success: true,
      data: comparisonData,
      meta: {
        category,
        service: comparisonData.service,
        total_businesses: comparisonData.businesses.length,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price comparison' },
      { status: 500 }
    );
  }
}
