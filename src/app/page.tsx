"use client";
import { useState, useEffect } from 'react';
import { Search, Map, Home, TrendingUp, User, Plus, Filter, Star, Phone, MapPin, Heart, Bookmark, Calendar, BarChart3 } from 'lucide-react';
import DirectBooking from '@/components/booking/DirectBooking';
import PriceComparison from '@/components/comparison/PriceComparison';

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

const categories = [
  { id: '1', name: 'Restaurant', icon: '🍔', color: 'bg-orange-500' },
  { id: '2', name: 'Shopping', icon: '🛍️', color: 'bg-blue-500' },
  { id: '3', name: 'Healthcare', icon: '🏥', color: 'bg-red-500' },
  { id: '4', name: 'Beauty', icon: '💄', color: 'bg-pink-500' },
  { id: '5', name: 'Fitness', icon: '💪', color: 'bg-green-500' },
  { id: '6', name: 'Entertainment', icon: '🎮', color: 'bg-purple-500' },
  { id: '7', name: 'Education', icon: '📚', color: 'bg-indigo-500' },
  { id: '8', name: 'Automotive', icon: '🚗', color: 'bg-gray-500' }
];

export default function ConnectedHomePage() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedItems, setSavedItems] = useState(new Set());
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [trendingBusinesses, setTrendingBusinesses] = useState<TrendingBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
    fetchTrendingBusinesses();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (searchQuery || selectedCategory !== 'all') {
      fetchFilteredBusinesses();
    } else {
      fetchBusinesses();
    }
  }, [searchQuery, selectedCategory]);

  const getUserLocation = () => {
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
  };

  const fetchBusinesses = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
      }
      
      const response = await fetch(`/api/businesses?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setBusinesses(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredBusinesses = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
      }
      
      const response = await fetch(`/api/businesses?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setBusinesses(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch filtered businesses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingBusinesses = async () => {
    try {
      const response = await fetch('/api/ai/trending');
      const result = await response.json();
      
      if (result.success) {
        setTrendingBusinesses(result.data.trending_businesses);
      }
    } catch (error) {
      console.error('Failed to fetch trending businesses:', error);
    }
  };

  const handleBusinessClick = (business: Business) => {
    setSelectedBusiness(business);
    if (business.category === 'Restaurant') {
      setShowBooking(true);
    } else {
      window.location.href = `/business/${business.slug}`;
    }
  };

  const toggleSave = (businessId: string) => {
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(businessId)) {
        newSet.delete(businessId);
      } else {
        newSet.add(businessId);
      }
      return newSet;
    });
  };

  const BusinessGridCard = ({ business, showTrending = false }: { business: Business | TrendingBusiness; showTrending?: boolean }) => {
    const isTrending = 'trending_score' in business;
    const trendingBusiness = business as TrendingBusiness;

    return (
      <div 
        onClick={() => handleBusinessClick(business)}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative"
      >
        {/* Trending Badge */}
        {isTrending && (
          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingUp size={10} />
            Trending
          </div>
        )}

        {/* Header Image */}
        <div className="h-24 bg-gradient-to-br from-violet-500 to-indigo-600 relative">
          {business.is_featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              ⭐ Featured
            </div>
          )}
          {business.is_verified && (
            <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              ✓ Verified
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">
                {business.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {business.category}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1">
                {business.description}
              </p>
            </div>
          </div>

          {/* Rating and Price */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-medium">{business.rating}</span>
              <span className="text-xs text-gray-500">({business.review_count})</span>
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {business.price_range}
            </span>
          </div>

          {/* Distance and Location */}
          {business.distance && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={10} />
                <span>{business.distance.toFixed(1)} km</span>
              </div>
            </div>
          )}

          {/* Trending Score */}
          {isTrending && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Trending:</span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  {trendingBusiness.trending_score}%
                </span>
              </div>
            </div>
          )}

          {/* Offer Badge */}
          {business.offers && business.offers.length > 0 && (
            <div className="mb-2">
              <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded">
                🔥 {business.offers[0].discount_percent}% OFF
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (business.phone) {
                  window.open(`tel:${business.phone}`);
                }
              }}
              className="flex-1 bg-green-500 text-white py-1.5 px-2 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
              disabled={!business.phone}
            >
              <Phone size={10} className="inline mr-1" />
              Call
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSave(business.id);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                savedItems.has(business.id)
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Bookmark size={12} className={savedItems.has(business.id) ? 'fill-current' : ''} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Compact Top Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">BizGallery</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowComparison(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Price Comparison"
              >
                <BarChart3 size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Filter size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard/business-owner'}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <User size={18} className="text-gray-600 dark:text-gray-400" />
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
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  selectedCategory === category.name
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-violet-600 dark:text-violet-400">10K+</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Businesses</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">50K+</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Users</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">4.8</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Rating</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">24/7</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Support</div>
          </div>
        </div>

        {/* Trending Businesses */}
        {trendingBusinesses.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-purple-600" />
                AI Trending Businesses
              </h2>
              <button className="text-violet-600 dark:text-violet-400 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {trendingBusinesses.slice(0, 4).map((business) => (
                <BusinessGridCard key={business.id} business={business} showTrending={true} />
              ))}
            </div>
          </div>
        )}

        {/* All Businesses Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedCategory === 'all' ? 'All Businesses' : `${selectedCategory} Businesses`}
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {businesses.length} results
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {businesses.map((business) => (
                <BusinessGridCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'home'
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Home size={20} />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'search'
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Search size={20} />
              <span className="text-xs">Search</span>
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/business-owner'}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'add'
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center">
                <Plus size={20} className="text-white" />
              </div>
              <span className="text-xs">Business</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'map'
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Map size={20} />
              <span className="text-xs">Map</span>
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'trending'
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <TrendingUp size={20} />
              <span className="text-xs">Trending</span>
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && selectedBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Book at {selectedBusiness.name}
                </h2>
                <button
                  onClick={() => setShowBooking(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              <DirectBooking 
                business={selectedBusiness} 
                onBookingComplete={() => setShowBooking(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Price Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Price Comparison
                </h2>
                <button
                  onClick={() => setShowComparison(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              <PriceComparison 
                category={selectedCategory === 'all' ? 'Restaurant' : selectedCategory}
              />
            </div>
          </div>
        </div>
      )}

      {/* Padding for bottom nav */}
      <div className="h-20"></div>
    </div>
  );
}
