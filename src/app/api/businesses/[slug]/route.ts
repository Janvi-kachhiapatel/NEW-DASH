import { NextRequest, NextResponse } from 'next/server';

// Mock business data
const mockBusinesses = [
  {
    id: '1',
    name: 'Neon Gaming Zone',
    slug: 'neon-gaming-zone',
    category: 'Entertainment',
    subcategory: 'Gaming Arcade',
    description: 'Premium gaming experience with latest consoles and VR headsets',
    logo_url: '/api/placeholder/200/200',
    cover_image_url: '/api/placeholder/400/200',
    rating: 4.8,
    review_count: 234,
    price_range: '$$',
    location_lat: 23.0225,
    location_lng: 72.5714,
    address: '123 Gaming Street, Ahmedabad, Gujarat 380001',
    phone: '+91 98765 43210',
    website: 'https://neongaming.example.com',
    email: 'info@neongaming.example.com',
    is_verified: true,
    is_featured: true,
    owner_id: 'user1',
    custom_website_url: 'https://neon-gaming.business.com',
    operating_hours: {
      monday: { open: '10:00', close: '22:00', is_open: true },
      tuesday: { open: '10:00', close: '22:00', is_open: true },
      wednesday: { open: '10:00', close: '22:00', is_open: true },
      thursday: { open: '10:00', close: '22:00', is_open: true },
      friday: { open: '10:00', close: '23:00', is_open: true },
      saturday: { open: '10:00', close: '23:00', is_open: true },
      sunday: { open: '10:00', close: '22:00', is_open: true }
    },
    services: [
      {
        id: '1',
        name: 'VR Gaming Session',
        description: '30-minute virtual reality gaming experience',
        price: 299,
        duration_minutes: 30,
        category: 'Gaming',
        is_bookable: true
      },
      {
        id: '2',
        name: 'Console Gaming',
        description: '1-hour gaming session on PS5/Xbox',
        price: 199,
        duration_minutes: 60,
        category: 'Gaming',
        is_bookable: true
      }
    ],
    offers: [
      {
        id: '1',
        title: 'Weekend Gaming Special',
        description: 'Get 25% off on all gaming sessions',
        discount_percent: 25,
        valid_until: '2024-12-31'
      }
    ],
    reviews: [
      {
        id: '1',
        user_name: 'Rahul Sharma',
        rating: 5,
        comment: 'Amazing gaming experience! The VR setup is top-notch.',
        created_at: '2024-01-15T10:30:00Z',
        helpful_count: 12
      },
      {
        id: '2',
        user_name: 'Priya Patel',
        rating: 4,
        comment: 'Great place for gaming with friends.',
        created_at: '2024-01-10T15:45:00Z',
        helpful_count: 8
      }
    ]
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const business = mockBusinesses.find(b => b.slug === slug);
    
    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: business
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    
    const businessIndex = mockBusinesses.findIndex(b => b.slug === slug);
    
    if (businessIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    // Update business
    mockBusinesses[businessIndex] = { ...mockBusinesses[businessIndex], ...body };

    return NextResponse.json({
      success: true,
      data: mockBusinesses[businessIndex],
      message: 'Business updated successfully'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update business' },
      { status: 500 }
    );
  }
}
