"use client";
import { useState, useEffect } from 'react';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import DiscoveryFeed from '@/components/feed/DiscoveryFeed';
import AIRecommendations from '@/components/ai/AIRecommendations';
import BusinessMap from '@/components/maps/BusinessMap';
import { Search, Map, TrendingUp, Sparkles } from 'lucide-react';

// Mock data for demonstration
const mockBusinesses = [
  {
    id: '1',
    name: 'Neon Gaming Zone',
    slug: 'neon-gaming-zone',
    category: 'Entertainment',
    description: 'Premium gaming experience with latest consoles and VR headsets',
    logo_url: '/api/placeholder/200/200',
    cover_image_url: '/api/placeholder/400/200',
    rating: 4.8,
    review_count: 234,
    price_range: '$$',
    distance: 1.2,
    address: '123 Gaming Street, Ahmedabad',
    phone: '+91 98765 43210',
    is_verified: true,
    is_featured: true,
    location_lat: 23.0225,
    location_lng: 72.5714,
    offers: [
      {
        id: '1',
        title: 'Weekend Gaming Special',
        discount_percent: 25
      }
    ]
  },
  {
    id: '2',
    name: 'Cafe Bliss',
    slug: 'cafe-bliss',
    category: 'Restaurant',
    description: 'Cozy cafe with artisanal coffee and fresh baked goods',
    logo_url: '/api/placeholder/200/200',
    cover_image_url: '/api/placeholder/400/200',
    rating: 4.6,
    review_count: 189,
    price_range: '$',
    distance: 0.8,
    address: '456 Coffee Lane, Ahmedabad',
    phone: '+91 98765 43211',
    is_verified: true,
    is_featured: false,
    location_lat: 23.0320,
    location_lng: 72.5800,
    offers: []
  },
  {
    id: '3',
    name: 'Style Studio',
    slug: 'style-studio',
    category: 'Beauty',
    description: 'Unisex salon with modern styling and beauty treatments',
    logo_url: '/api/placeholder/200/200',
    cover_image_url: '/api/placeholder/400/200',
    rating: 4.7,
    review_count: 156,
    price_range: '$$$',
    distance: 2.1,
    address: '789 Style Avenue, Ahmedabad',
    phone: '+91 98765 43212',
    is_verified: true,
    is_featured: true,
    location_lat: 23.0250,
    location_lng: 72.5750,
    offers: [
      {
        id: '2',
        title: 'First Time Customer Discount',
        discount_percent: 20
      }
    ]
  }
];

const mockReels = [
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
    views_count: 1200,
    business: mockBusinesses[0]
  },
  {
    id: '2',
    business_id: '2',
    business_name: 'Cafe Bliss',
    video_url: '/api/placeholder/video',
    thumbnail_url: '/api/placeholder/400/700',
    caption: 'Freshly baked pastries every morning! 🥐☕',
    duration_seconds: 25,
    likes_count: 189,
    comments_count: 32,
    views_count: 890,
    business: mockBusinesses[1]
  }
];

const categories = [
  'Restaurant', 'Shopping', 'Healthcare', 'Beauty', 'Fitness', 
  'Education', 'Entertainment', 'Automotive', 'Professional', 'Home', 'Other'
];

export default function HomePage() {
  const [activeView, setActiveView] = useState<'feed' | 'map' | 'search'>('feed');
  const [searchFilters, setSearchFilters] = useState({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user location
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
    setActiveView('search');
  };

  const handleBusinessClick = (business: any) => {
    // Navigate to business profile
    window.location.href = `/business/${business.slug}`;
  };

  const handleReelClick = (reel: any) => {
    // Open reel viewer or navigate to business
    window.location.href = `/business/${reel.business.slug}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Discover Amazing Local Businesses
            </h1>
            <p className="text-lg md:text-xl text-violet-100 max-w-2xl mx-auto">
              Find the best shops, restaurants, and services near you with AI-powered recommendations and instant booking
            </p>
          </div>

          {/* Advanced Search Component */}
          <div className="max-w-4xl mx-auto">
            <AdvancedSearch
              onSearch={handleSearch}
              categories={categories}
              suggestions={[
                { id: '1', text: 'gaming zones near me', type: 'query' },
                { id: '2', text: 'cafes with wifi', type: 'category' },
                { id: '3', text: 'Neon Gaming Zone', type: 'business', business: mockBusinesses[0] }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-violet-600 dark:text-violet-400">
                10,000+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Businesses</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                50,000+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Happy Customers</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                4.8
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">
                24/7
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveView('feed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeView === 'feed'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Sparkles size={18} />
              Discovery Feed
            </button>
            <button
              onClick={() => setActiveView('map')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeView === 'map'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Map size={18} />
              Map View
            </button>
            <button
              onClick={() => setActiveView('search')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeView === 'search'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Search size={18} />
              Search Results
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <TrendingUp size={18} />
              Trending
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* AI Recommendations */}
        <div className="mb-8">
          <AIRecommendations
            userLocation={userLocation}
            userPreferences={{
              categories: ['Entertainment', 'Restaurant'],
              priceRange: '$$',
              preferredDistance: 5
            }}
            onBusinessClick={handleBusinessClick}
          />
        </div>

        {/* Dynamic Content Based on Active View */}
        {activeView === 'feed' && (
          <DiscoveryFeed
            businesses={mockBusinesses}
            reels={mockReels}
            onBusinessClick={handleBusinessClick}
            onReelClick={handleReelClick}
          />
        )}

        {activeView === 'map' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <BusinessMap
              businesses={mockBusinesses}
              userLocation={userLocation}
              onBusinessSelect={handleBusinessClick}
              height="600px"
            />
          </div>
        )}

        {activeView === 'search' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Search Results
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Showing {mockBusinesses.length} businesses based on your search
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockBusinesses.map((business) => (
                <div
                  key={business.id}
                  onClick={() => handleBusinessClick(business)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-600 dark:text-gray-400">
                        {business.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {business.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>{business.category}</span>
                        <span>•</span>
                        <span>{business.price_range}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {business.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{business.rating}</span>
                      <span className="text-gray-500">({business.review_count})</span>
                    </div>
                    {business.distance && (
                      <span className="text-sm text-gray-500">
                        {business.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
