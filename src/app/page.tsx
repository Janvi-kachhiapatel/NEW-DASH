"use client";
import { useState, useEffect } from 'react';
import { Search, Map, Home, TrendingUp, User, Plus, Filter, Star, Phone, MapPin, Heart, Bookmark, Calendar, BarChart3, MessageCircle } from 'lucide-react';
import DirectBooking from '@/components/booking/DirectBooking';
import PriceComparison from '@/components/comparison/PriceComparison';
import AdvancedFilterPanel from '@/components/filters/AdvancedFilterPanel';
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
  const [showComparison, setShowComparison] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viralVideos, setViralVideos] = useState<any[]>([]);

  // Add comparison view handler
  const handleComparisonView = () => {
    setActiveView('comparison');
    setShowComparison(true);
  };

  // Add viral videos view handler
  const handleViralVideosView = () => {
    setActiveView('viral');
    fetchViralVideos();
  };

  const fetchViralVideos = async () => {
    try {
      // Mock viral videos data
      const mockVideos = [
        {
          id: '1',
          title: 'Amazing Street Food in Ahmedabad',
          thumbnail: '/api/placeholder/300/200',
          views: '1.2M',
          likes: '45K',
          description: 'Must try street food places in the city',
          category: 'Food',
          duration: '2:45'
        },
        {
          id: '2',
          title: 'Best Shopping Deals This Week',
          thumbnail: '/api/placeholder/300/200',
          views: '890K',
          likes: '32K',
          description: 'Incredible shopping discounts you need to know',
          category: 'Shopping',
          duration: '3:12'
        },
        {
          id: '3',
          title: 'Top Rated Salons Near You',
          thumbnail: '/api/placeholder/300/200',
          views: '567K',
          likes: '28K',
          description: 'Most popular beauty salons in your area',
          category: 'Beauty',
          duration: '1:58'
        }
      ];
      setViralVideos(mockVideos);
    } catch (error) {
      console.error('Failed to fetch viral videos:', error);
    }
  };

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
    setIsLoading(true);
    try {
      // Check if data is cached in localStorage
      const cachedData = localStorage.getItem('businesses_cache');
      const cacheTime = localStorage.getItem('businesses_cache_time');
      const now = new Date().getTime();
      
      // Use cache if it's less than 5 minutes old
      if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 300000) {
        const businesses = JSON.parse(cachedData);
        setBusinesses(businesses);
        setFilteredBusinesses(businesses);
        setIsLoading(false);
        return;
      }
      
      const params = new URLSearchParams();
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
      }
      
      const response = await fetch(`/api/businesses?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setBusinesses(result.data);
        setFilteredBusinesses(result.data);
      } else {
        console.error('API Error:', result.error);
        // Fallback to empty array
        setBusinesses([]);
        setFilteredBusinesses([]);
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
      // Fallback to empty array
      setBusinesses([]);
      setFilteredBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredBusinesses = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
      }
      
      const response = await fetch(`/api/businesses?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setBusinesses(data.data);
        setFilteredBusinesses(data.data);
      } else {
        console.error('API Error:', data.error);
        // Fallback to empty array
        setBusinesses([]);
        setFilteredBusinesses([]);
      }
    } catch (error) {
      console.error('Failed to fetch filtered businesses:', error);
      // Fallback to empty array
      setBusinesses([]);
      setFilteredBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingBusinesses = async () => {
    try {
      const response = await fetch('/api/ai/trending');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setTrendingBusinesses(data.data.trending_businesses);
      } else {
        console.error('Trending API Error:', data.error);
        setTrendingBusinesses([]);
      }
    } catch (error) {
      console.error('Failed to fetch trending businesses:', error);
      setTrendingBusinesses([]);
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

  const handleFilterChange = (filters: any) => {
    let filtered = [...businesses];
    
    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(b => b.category === filters.category);
    }
    
    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(b => b.rating >= filters.rating);
    }
    
    // Apply price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(b => b.price_range === filters.priceRange);
    }
    
    // Apply verified filter
    if (filters.verified) {
      filtered = filtered.filter(b => b.is_verified);
    }
    
    // Apply offers filter
    if (filters.offers) {
      filtered = filtered.filter(b => b.offers && b.offers.length > 0);
    }
    
    // Apply open now filter
    if (filters.openNow) {
      const now = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = days[now.getDay()];
      const currentTime = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
      
      filtered = filtered.filter(b => {
        if ('operating_hours' in b && b.operating_hours && b.operating_hours[currentDay]) {
          return b.operating_hours[currentDay].is_open;
        }
        return true;
      });
    }
    
    setFilteredBusinesses(filtered);
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
    const hasBookableServices = 'services' in business && business.services?.some((s: any) => s.is_bookable);

    return (
      <div 
        onClick={() => handleBusinessClick(business)}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative"
      >
        {/* Trending Badge */}
        {isTrending && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={12} />
              Trending
            </div>
          </div>
        )}

        {/* Verified Badge */}
        {business.is_verified && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle size={12} />
              Verified
            </div>
          </div>
        )}

        {/* Image */}
        <div className="h-32 bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/20 dark:to-pink-900/20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {business.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
              {business.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
              {business.category}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">{business.rating}</span>
            <span className="text-xs text-gray-500">({business.review_count})</span>
          </div>

          {/* Price Range */}
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {business.price_range}
          </div>

          {/* Location */}
          {business.distance && (
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
              <MapPin size={10} />
              {business.distance.toFixed(1)} km
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-1 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSave(business.id);
              }}
              className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                savedItems.has(business.id)
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Heart size={12} className={savedItems.has(business.id) ? 'fill-current' : ''} />
            </button>
            
            {hasBookableServices && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBusiness(business);
                  setShowBooking(true);
                }}
                className="flex-1 px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded text-xs hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
              >
                Book
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/business/${business.slug}`;
              }}
              className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              View
            </button>
          </div>

          {/* Offers Section */}
          {business.offers && business.offers.length > 0 && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-600 dark:text-red-400">🔥</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-800 dark:text-red-200">
                    {business.offers[0].title}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {business.offers[0].discount_percent}% OFF
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* WhatsApp Button */}
          {business.phone && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const formattedPhone = business.phone.replace(/[^\d]/g, '');
                const message = encodeURIComponent(`Hello! I found your business ${business.name} on BizGallery and would like to know more.`);
                window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
              }}
              className="flex-1 bg-green-500 text-white py-1.5 px-2 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
              disabled={!business.phone}
            >
              <MessageCircle size={10} className="inline mr-1" />
              WhatsApp
            </button>
          )}
        </div>
      </div>
    );
  };

  // Add missing CheckCircle import
  const CheckCircle = ({ size, className }: any) => (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    </div>
  );

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
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Advanced Filters"
              >
                <Filter size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'}
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

      {/* Advanced Filter Panel */}
      <div className="container mx-auto px-4 py-4">
        <AdvancedFilterPanel 
          onFilterChange={handleFilterChange}
          businesses={businesses}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        {/* Comparison View */}
        {activeView === 'comparison' && (
          <div className="mb-8">
            <PriceComparison 
              businesses={businesses}
              onClose={() => {
                setActiveView('feed');
                setShowComparison(false);
              }}
            />
          </div>
        )}

        {/* Viral Videos View */}
        {activeView === 'viral' && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">📹</span>
                    Viral Videos
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Trending business videos in your area
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {viralVideos.map((video) => (
                  <div key={video.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                        <h3 className="text-white font-semibold text-sm line-clamp-2">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-white text-xs">👁 {video.views}</span>
                          <span className="text-white text-xs">❤️ {video.likes}</span>
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            {video.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feed View */}
        {activeView !== 'comparison' && (
          <>
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
          </>
        )}

        {/* Trending Businesses */}
        {trendingBusinesses.length > 0 && (
          <div className="mb-6" data-trending="true">
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
              {filteredBusinesses.length} results
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
              {filteredBusinesses.map((business) => (
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
              onClick={() => {
                setActiveView('home');
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeView === 'home'
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Home size={20} />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => {
                setActiveView('search');
                // Focus search input
                const searchInput = document.querySelector('input[placeholder="Search businesses..."]') as HTMLInputElement;
                if (searchInput) {
                  searchInput.focus();
                }
              }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeView === 'search'
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Search size={20} />
              <span className="text-xs">Search</span>
            </button>
            <button
              onClick={handleComparisonView}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeView === 'comparison'
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <BarChart3 size={20} />
              <span className="text-xs">Compare</span>
            </button>
            <button
              onClick={handleViralVideosView}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeView === 'viral'
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="text-lg">📹</span>
              <span className="text-xs">Videos</span>
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeView === 'add'
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
              onClick={() => {
                setActiveView('map');
                // Navigate to map view
                window.location.href = '/map';
              }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeView === 'map'
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Map size={20} />
              <span className="text-xs">Map</span>
            </button>
            <button
              onClick={() => {
                setActiveView('trending');
                // Scroll to trending section
                const trendingSection = document.querySelector('[data-trending="true"]');
                if (trendingSection) {
                  trendingSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeView === 'trending'
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
