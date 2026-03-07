"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Video } from 'lucide-react';
import BusinessProfile from '@/components/business/BusinessProfile';
import OffersDisplay from '@/components/offers/OffersDisplay';
import ReelCreation from '@/components/reels/ReelCreation';
import ReviewWithImages from '@/components/reviews/ReviewWithImages';
import ShopVerification from '@/components/verification/ShopVerification';
import NotificationSystem from '@/components/notifications/NotificationSystem';
import { dataStorage } from '@/lib/dataStorage';

// Mock business data - in real app, this would come from API
const mockBusinesses = [
  {
    id: '1',
    name: 'Neon Gaming Zone',
    slug: 'neon-gaming-zone',
    category: 'Entertainment',
    subcategory: 'Gaming Arcade',
    description: 'Premium gaming experience with latest consoles and VR headsets. We offer the ultimate gaming destination with cutting-edge technology and comfortable gaming environment.',
    logo_url: '/api/placeholder/200/200',
    cover_image_url: '/api/placeholder/400/200',
    rating: 4.8,
    review_count: 234,
    price_range: '$$',
    distance: 1.2,
    address: '123 Gaming Street, Ahmedabad, Gujarat 380001',
    phone: '+91 98765 43210',
    website: 'https://neongaming.example.com',
    email: 'info@neongaming.example.com',
    is_verified: true,
    is_featured: true,
    location_lat: 23.0225,
    location_lng: 72.5714,
    operating_hours: {
      monday: { open: '10:00', close: '22:00', is_open: true },
      tuesday: { open: '10:00', close: '22:00', is_open: true },
      wednesday: { open: '10:00', close: '22:00', is_open: true },
      thursday: { open: '10:00', close: '22:00', is_open: true },
      friday: { open: '10:00', close: '23:00', is_open: true },
      saturday: { open: '10:00', close: '23:00', is_open: true },
      sunday: { open: '10:00', close: '22:00', is_open: true }
    },
    social_links: {
      instagram: 'https://instagram.com/neongaming',
      facebook: 'https://facebook.com/neongaming',
      twitter: 'https://twitter.com/neongaming',
      website: 'https://neongaming.example.com'
    },
    services: [
      {
        id: '1',
        name: 'VR Gaming Session',
        description: '30-minute virtual reality gaming experience with latest VR headsets',
        price: 299,
        duration_minutes: 30,
        category: 'Gaming'
      },
      {
        id: '2',
        name: 'Console Gaming',
        description: '1-hour gaming session on PlayStation 5 or Xbox Series X',
        price: 199,
        duration_minutes: 60,
        category: 'Gaming'
      },
      {
        id: '3',
        name: 'Gaming Tournament',
        description: 'Participate in weekly gaming tournaments with prizes',
        price: 99,
        duration_minutes: 120,
        category: 'Events'
      }
    ],
    offers: [
      {
        id: '1',
        title: 'Weekend Gaming Special',
        description: 'Get 25% off on all gaming sessions during weekends',
        discount_percent: 25,
        valid_until: '2024-12-31',
        terms: 'Valid on weekends only. Cannot be combined with other offers.'
      }
    ],
    gallery: [
      '/api/placeholder/400/300',
      '/api/placeholder/400/300',
      '/api/placeholder/400/300',
      '/api/placeholder/400/300',
      '/api/placeholder/400/300',
      '/api/placeholder/400/300'
    ],
    reels: [
      {
        id: '1',
        business_id: '1',
        business_name: 'Neon Gaming Zone',
        video_url: '/api/placeholder/video',
        thumbnail_url: '/api/placeholder/400/700',
        caption: 'Check out our latest VR gaming experience! 🎮',
        duration_seconds: 30,
        likes_count: 234,
        comments_count: 45,
        views_count: 1200
      }
    ],
    reviews: [
      {
        id: '1',
        user_name: 'Rahul Sharma',
        rating: 5,
        comment: 'Amazing gaming experience! The VR setup is top-notch and the staff is very helpful. Highly recommend for gaming enthusiasts.',
        created_at: '2024-01-15T10:30:00Z',
        helpful_count: 12,
        images: ['/api/placeholder/200/200']
      },
      {
        id: '2',
        user_name: 'Priya Patel',
        rating: 4,
        comment: 'Great place for gaming with friends. The consoles are well-maintained and the atmosphere is perfect for gaming.',
        created_at: '2024-01-10T15:45:00Z',
        helpful_count: 8
      }
    ]
  },
  {
    id: '2',
    name: 'Cafe Bliss',
    slug: 'cafe-bliss',
    category: 'Restaurant',
    subcategory: 'Coffee Shop',
    description: 'Cozy cafe with artisanal coffee and fresh baked goods. Your perfect neighborhood spot for coffee conversations and delicious treats.',
    logo_url: '/api/placeholder/200/200',
    cover_image_url: '/api/placeholder/400/200',
    rating: 4.6,
    review_count: 189,
    price_range: '$',
    distance: 0.8,
    address: '456 Coffee Lane, Ahmedabad, Gujarat 380002',
    phone: '+91 98765 43211',
    website: 'https://cafebliss.example.com',
    email: 'hello@cafebliss.example.com',
    is_verified: true,
    is_featured: false,
    location_lat: 23.0320,
    location_lng: 72.5800,
    operating_hours: {
      monday: { open: '07:00', close: '21:00', is_open: true },
      tuesday: { open: '07:00', close: '21:00', is_open: true },
      wednesday: { open: '07:00', close: '21:00', is_open: true },
      thursday: { open: '07:00', close: '21:00', is_open: true },
      friday: { open: '07:00', close: '22:00', is_open: true },
      saturday: { open: '08:00', close: '22:00', is_open: true },
      sunday: { open: '08:00', close: '20:00', is_open: true }
    },
    social_links: {
      instagram: 'https://instagram.com/cafebliss',
      facebook: 'https://facebook.com/cafebliss'
    },
    services: [
      {
        id: '1',
        name: 'Coffee Tasting',
        description: 'Sample our artisanal coffee collection',
        price: 149,
        duration_minutes: 30,
        category: 'Beverage'
      }
    ],
    offers: [],
    gallery: ['/api/placeholder/400/300'],
    reels: [],
    reviews: []
  },
  {
    id: '3',
    name: 'Style Studio',
    slug: 'style-studio',
    category: 'Beauty',
    subcategory: 'Salon',
    description: 'Unisex salon with modern styling and beauty treatments. Professional services for all your beauty needs.',
    logo_url: '/api/placeholder/200/200',
    cover_image_url: '/api/placeholder/400/200',
    rating: 4.7,
    review_count: 156,
    price_range: '$$$',
    distance: 2.1,
    address: '789 Style Avenue, Ahmedabad, Gujarat 380003',
    phone: '+91 98765 43212',
    website: 'https://stylestudio.example.com',
    email: 'book@stylestudio.example.com',
    is_verified: true,
    is_featured: true,
    location_lat: 23.0250,
    location_lng: 72.5750,
    operating_hours: {
      monday: { open: '09:00', close: '20:00', is_open: true },
      tuesday: { open: '09:00', close: '20:00', is_open: true },
      wednesday: { open: '09:00', close: '20:00', is_open: true },
      thursday: { open: '09:00', close: '20:00', is_open: true },
      friday: { open: '09:00', close: '21:00', is_open: true },
      saturday: { open: '09:00', close: '21:00', is_open: true },
      sunday: { open: '10:00', close: '19:00', is_open: true }
    },
    social_links: {
      instagram: 'https://instagram.com/stylestudio'
    },
    services: [
      {
        id: '1',
        name: 'Haircut & Styling',
        description: 'Professional haircut and styling service',
        price: 399,
        duration_minutes: 45,
        category: 'Hair'
      }
    ],
    offers: [
      {
        id: '2',
        title: 'First Time Customer Discount',
        description: 'Get 20% off on your first visit',
        discount_percent: 20,
        valid_until: '2024-12-31',
        terms: 'Valid for first-time customers only.'
      }
    ],
    gallery: ['/api/placeholder/400/300'],
    reels: [],
    reviews: []
  }
];

export default function BusinessPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReelCreation, setShowReelCreation] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchBusiness();
  }, [slug]);

  const fetchBusiness = async () => {
    setLoading(true);
    
    try {
      // Get business from persistent storage
      const foundBusiness = dataStorage.getBusiness(slug);
      
      if (foundBusiness) {
        setBusiness(foundBusiness);
        
        // Get reviews for this business
        const businessReviews = dataStorage.getReviewsForBusiness(foundBusiness.id);
        setReviews(businessReviews);
        
        // Check if current user is the owner (mock check)
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser && foundBusiness.owner_id === currentUser) {
          setIsOwner(true);
        }
      } else {
        setBusiness(null);
      }
    } catch (error) {
      console.error('Failed to fetch business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = (review: any) => {
    // Add review to storage
    dataStorage.addReview(review);
    // Refresh reviews
    if (business) {
      const updatedReviews = dataStorage.getReviewsForBusiness(business.id);
      setReviews(updatedReviews);
    }
  };

  const handleReelCreated = (reel: any) => {
    console.log('Reel created:', reel);
    // Refresh business data to show new reel
    fetchBusiness();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The business you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BusinessProfile business={business} />
      
      {/* Reviews with Images */}
      <div className="container mx-auto px-4 py-6">
        <ReviewWithImages 
          businessId={business.id}
          businessName={business.name}
          onReviewSubmitted={handleReviewSubmitted}
          existingReviews={reviews}
        />
      </div>
      
      {/* Offers Section */}
      <div className="container mx-auto px-4 py-6">
        <OffersDisplay 
          businessId={business.id}
          businessOwnerId={business.owner_id}
          isOwner={isOwner}
        />
      </div>

      {/* Shop Verification for Owners */}
      {isOwner && (
        <div className="container mx-auto px-4 py-6">
          <ShopVerification
            businessId={business.id}
            businessName={business.name}
            onVerificationComplete={(status) => {
              console.log('Verification completed:', status);
              // Refresh business data
              fetchBusiness();
            }}
          />
        </div>
      )}

      {/* Reel Creation Button for Owners */}
      {isOwner && (
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => setShowReelCreation(true)}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
          >
            <Video size={20} />
            Create Reel
          </button>
        </div>
      )}

      {/* Reel Creation Modal */}
      {showReelCreation && (
        <ReelCreation
          businessId={business.id}
          businessName={business.name}
          onReelCreated={handleReelCreated}
          onClose={() => setShowReelCreation(false)}
        />
      )}
    </div>
  );
}
