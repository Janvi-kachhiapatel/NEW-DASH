"use client";
import { useState, useEffect } from 'react';
import { Search, Map, Home, TrendingUp, User, Plus, Filter, Star, Phone, MapPin, Heart, Bookmark, Calendar, BarChart3, MessageCircle, X, LogIn, UserPlus, Eye, Settings, Store, CheckCircle } from 'lucide-react';
import DirectBooking from '@/components/booking/DirectBooking';
import PriceComparison from '@/components/comparison/PriceComparison';
import AdvancedFilterPanel from '@/components/filters/AdvancedFilterPanel';
import SmartSearchBar from '@/components/search/SmartSearchBar';
import dynamic from 'next/dynamic';

// Lazy load map component for better performance
const BusinessMap = dynamic(() => import('@/components/maps/BusinessMap'), {
  loading: () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
    </div>
  ),
  ssr: false
});

interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description: string;
  logo_url?: string;
  cover_image_url?: string;
  rating: number;
  review_count: number;
  price_range: string;
  distance?: number;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  is_verified: boolean;
  is_featured: boolean;
  location_lat: number;
  location_lng: number;
  custom_website_url?: string;
  offers?: Array<{
    id: string;
    title: string;
    discount_percent: number;
  }>;
  services?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    category: string;
    is_bookable: boolean;
  }>;
}

interface TrendingBusiness extends Business {
  trending_score: number;
  trend_reason: string;
  price_comparison: {
    avg_price: number;
    competitor_prices: number[];
    price_position: string;
  };
}

export default function ConnectedHomePage() {
  // ALL hooks must be called before any early returns
  const categories = [
    { id: '1', name: 'Restaurant', icon: '🍽️', color: 'bg-orange-500' },
    { id: '2', name: 'Shopping', icon: '🛍️', color: 'bg-blue-500' },
    { id: '3', name: 'Healthcare', icon: '🏥', color: 'bg-red-500' },
    { id: '4', name: 'Beauty', icon: '💄', color: 'bg-pink-500' },
    { id: '5', name: 'Fitness', icon: '💪', color: 'bg-green-500' },
    { id: '6', name: 'Entertainment', icon: '🎮', color: 'bg-purple-500' },
    { id: '7', name: 'Education', icon: '📚', color: 'bg-indigo-500' },
    { id: '8', name: 'Automotive', icon: '🚗', color: 'bg-gray-500' }
  ];

  const [activeView, setActiveView] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [trendingBusinesses, setTrendingBusinesses] = useState<TrendingBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viralVideos, setViralVideos] = useState<any[]>([]);

  // Load sample business data
  useEffect(() => {
    const sampleBusinesses: Business[] = [
      {
        id: '1',
        name: 'Neon Gaming Lounge',
        slug: 'neon-gaming-lounge',
        category: 'Entertainment',
        subcategory: 'Gaming Zone',
        description: 'Ultimate gaming experience with VR setups, gaming PCs, and console gaming.',
        logo_url: '',
        cover_image_url: '',
        rating: 4.8,
        review_count: 156,
        price_range: '$$',
        address: '123 Gaming Street, Ahmedabad, Gujarat 380001',
        phone: '+91 98765 43210',
        website: 'https://neongaming.example.com',
        email: 'info@neongaming.example.com',
        is_verified: true,
        is_featured: true,
        location_lat: 23.0225,
        location_lng: 72.5714,
        services: [
          {
            id: '1',
            name: 'VR Gaming Session',
            description: '1 hour VR gaming session',
            price: 299,
            duration_minutes: 60,
            category: 'Gaming',
            is_bookable: true
          },
          {
            id: '2',
            name: 'PC Gaming',
            description: '2 hours PC gaming',
            price: 199,
            duration_minutes: 120,
            category: 'Gaming',
            is_bookable: true
          }
        ]
      },
      {
        id: '2',
        name: 'Cafe Bliss',
        slug: 'cafe-bliss',
        category: 'Food & Beverage',
        subcategory: 'Cafe',
        description: 'Cozy cafe with premium coffee, snacks, and comfortable workspace.',
        logo_url: '',
        cover_image_url: '',
        rating: 4.6,
        review_count: 89,
        price_range: '$',
        address: '456 Coffee Lane, Ahmedabad, Gujarat 380002',
        phone: '+91 98765 43211',
        website: 'https://cafebliss.example.com',
        email: 'hello@cafebliss.example.com',
        is_verified: true,
        is_featured: false,
        location_lat: 23.0395,
        location_lng: 72.5616,
        services: [
          {
            id: '3',
            name: 'Coffee Tasting',
            description: 'Sample our premium coffee collection',
            price: 149,
            duration_minutes: 30,
            category: 'Beverage',
            is_bookable: true
          }
        ]
      },
      {
        id: '3',
        name: 'FitZone Gym',
        slug: 'fitzone-gym',
        category: 'Fitness',
        subcategory: 'Gym',
        description: 'Modern fitness center with state-of-the-art equipment and personal trainers.',
        logo_url: '',
        cover_image_url: '',
        rating: 4.7,
        review_count: 234,
        price_range: '$$$',
        address: '789 Fitness Road, Ahmedabad, Gujarat 380003',
        phone: '+91 98765 43212',
        website: 'https://fitzone.example.com',
        email: 'info@fitzone.example.com',
        is_verified: true,
        is_featured: true,
        location_lat: 23.0587,
        location_lng: 72.5827,
        services: [
          {
            id: '4',
            name: 'Personal Training',
            description: '1 hour personal training session',
            price: 599,
            duration_minutes: 60,
            category: 'Fitness',
            is_bookable: true
          }
        ]
      }
    ];

    setBusinesses(sampleBusinesses);
    setFilteredBusinesses(sampleBusinesses);
  }, []);

  // Add comparison view handler
  const handleComparisonView = () => {
    setActiveView('comparison');
    setShowComparison(true);
  };

  // Add offers view handler
  const handleOffersView = () => {
    setActiveView('offers');
    window.location.href = '/offers';
  };

  // Add filter change handler
  const handleFilterChange = (filters: any) => {
    // Apply filters to businesses
    let filtered = businesses;
    
    if (filters.priceRange) {
      filtered = filtered.filter(b => {
        const price = b.price_range.length;
        return filters.priceRange.includes(price);
      });
    }
    
    if (filters.rating) {
      filtered = filtered.filter(b => b.rating >= filters.rating);
    }
    
    if (filters.category) {
      filtered = filtered.filter(b => b.category === filters.category);
    }
    
    setFilteredBusinesses(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Compact Top Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">BizGallery</span>
            </div>

            {/* Search Bar with AI Suggestions */}
            <div className="flex-1 max-w-md mx-4">
              <SmartSearchBar />
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.href = '/bookings'}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Calendar size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setShowAccountModal(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <User size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveView('feed')}
                className={`font-medium transition-colors ${
                  activeView === 'feed' ? 'text-violet-600' : 'text-gray-600 dark:text-gray-400 hover:text-violet-600'
                }`}
              >
                Feed
              </button>
              <button
                onClick={() => setActiveView('map')}
                className={`font-medium transition-colors ${
                  activeView === 'map' ? 'text-violet-600' : 'text-gray-600 dark:text-gray-400 hover:text-violet-600'
                }`}
              >
                Map
              </button>
              <button
                onClick={handleComparisonView}
                className={`font-medium transition-colors ${
                  activeView === 'comparison' ? 'text-violet-600' : 'text-gray-600 dark:text-gray-400 hover:text-violet-600'
                }`}
              >
                Compare
              </button>
              <button
                onClick={handleOffersView}
                className={`font-medium transition-colors ${
                  activeView === 'offers' ? 'text-violet-600' : 'text-gray-600 dark:text-gray-400 hover:text-violet-600'
                }`}
              >
                Offers
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter size={16} />
                <span className="text-sm">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <div className="container mx-auto px-4 py-4">
        <AdvancedFilterPanel 
          onFilterChange={handleFilterChange}
          businesses={businesses}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {activeView === 'feed' && (
          <>
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-8 mb-8 text-white">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-bold mb-4">Welcome to BizGallery!</h1>
                <p className="text-lg mb-6">Discover amazing local businesses with AI-powered recommendations, book services, and find the best deals near you.</p>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-white text-violet-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Plus size={20} />
                    List Your Business
                  </button>
                  <button
                    onClick={() => window.location.href = '/owner'}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30"
                  >
                    Business Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Businesses */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Featured Businesses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Business Cards */}
                {filteredBusinesses.map(business => (
              <div key={business.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header */}
                <div className="h-48 bg-gradient-to-br from-violet-500 to-purple-600 relative">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-3xl font-bold">{business.name.charAt(0)}</span>
                      </div>
                      <h3 className="font-bold text-xl">{business.name}</h3>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      business.is_verified 
                        ? 'bg-green-500 text-white' 
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {business.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      {business.category}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      <span>{business.rating}</span>
                      <span className="text-xs">({business.review_count || 0})</span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {business.description}
                  </p>

                  {/* Services */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Available Services:</h4>
                    <div className="space-y-1">
                      {business.services?.slice(0, 2).map(service => (
                        <div key={service.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{service.name}</span>
                          <span className="font-medium text-violet-600">₹{service.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <MapPin size={14} />
                    <span>{business.address}</span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => window.location.href = `/business/${business.slug}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBusiness(business);
                        setShowBooking(true);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    >
                      <Calendar size={14} />
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}

        {activeView === 'map' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Business Map</h2>
            <div className="h-[600px]">
              <BusinessMap
                businesses={filteredBusinesses.filter(b => b.location_lat && b.location_lng)}
                userLocation={userLocation}
                onBusinessSelect={(biz) => setSelectedBusiness(biz)}
                height="100%"
              />
            </div>
          </div>
        )}

        {activeView === 'comparison' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Price Comparison</h2>
            <PriceComparison businesses={filteredBusinesses.slice(0, 3)} />
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && selectedBusiness && (
        <DirectBooking
          business={selectedBusiness}
          onBookingComplete={() => {
            setShowBooking(false);
            setSelectedBusiness(null);
          }}
        />
      )}

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sign In Required
              </h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="text-center py-8">
              <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Sign In Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please sign in or create an account to access all features
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                <Store size={20} />
                <span>Create Business</span>
              </button>
              <button
                onClick={() => window.location.href = '/owner'}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Settings size={20} />
                <span>Manage Business</span>
              </button>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Need to book services? Create a business account?</p>
              <div className="flex gap-4 justify-center mt-2">
                <button
                  onClick={() => {
                    setShowAccountModal(false);
                    window.location.href = '/bookings';
                  }}
                  className="text-violet-600 hover:text-violet-700 font-medium"
                >
                  Book Services
                </button>
                <button
                  onClick={() => {
                    setShowAccountModal(false);
                    window.location.href = '/owner';
                  }}
                  className="text-violet-600 hover:text-violet-700 font-medium"
                >
                  Business Owner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => window.location.href = '/'}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                activeView === 'home' ? 'text-violet-600' : 'text-gray-600 dark:text-gray-400 hover:text-violet-600'
              }`}
            >
              <Home size={20} />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => window.location.href = '/bookings'}
              className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-violet-600"
            >
              <Calendar size={20} />
              <span className="text-xs">Bookings</span>
            </button>
            <button
              onClick={() => window.location.href = '/videos'}
              className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-violet-600"
            >
              <TrendingUp size={20} />
              <span className="text-xs">Videos</span>
            </button>
            <button
              onClick={() => window.location.href = '/account'}
              className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-violet-600"
            >
              <User size={20} />
              <span className="text-xs">Account</span>
            </button>
            <button
              onClick={() => setShowAccountModal(true)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-violet-600"
            >
              <Settings size={20} />
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
