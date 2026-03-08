"use client";
import { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, Phone, Globe, Heart, ExternalLink, Clock, Tag, TrendingUp, Flame } from 'lucide-react';
import { dataStorage, Business } from '@/lib/dataStorage';

export default function OffersPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('discount');
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchBusinesses();
    loadSavedItems();
  }, []);

  useEffect(() => {
    filterAndSortBusinesses();
  }, [businesses, searchQuery, selectedCategory, sortBy]);

  const fetchBusinesses = () => {
    const allBusinesses = dataStorage.getBusinesses();
    // Only show businesses with offers
    const businessesWithOffers = allBusinesses.filter(b => 
      b.offers && b.offers.length > 0
    );
    setBusinesses(businessesWithOffers);
  };

  const loadSavedItems = () => {
    const saved = localStorage.getItem('savedItems');
    if (saved) {
      setSavedItems(new Set(JSON.parse(saved)));
    }
  };

  const filterAndSortBusinesses = () => {
    let filtered = businesses;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(b => b.category === selectedCategory);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'discount':
          const maxDiscountA = Math.max(...(a.offers?.map(o => o.discount_percent) || [0]));
          const maxDiscountB = Math.max(...(b.offers?.map(o => o.discount_percent) || [0]));
          return maxDiscountB - maxDiscountA;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredBusinesses(filtered);
  };

  const toggleSave = (businessId: string) => {
    const newSavedItems = new Set(savedItems);
    if (newSavedItems.has(businessId)) {
      newSavedItems.delete(businessId);
    } else {
      newSavedItems.add(businessId);
    }
    setSavedItems(newSavedItems);
    localStorage.setItem('savedItems', JSON.stringify([...newSavedItems]));
  };

  const categories = ['all', ...Array.from(new Set(businesses.map(b => b.category)))];

  const getMaxDiscount = (business: Business) => {
    if (!business.offers || business.offers.length === 0) return 0;
    return Math.max(...business.offers.map(o => o.discount_percent));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Flame size={32} className="text-yellow-300" />
            <h1 className="text-3xl font-bold">Hot Offers & Deals</h1>
          </div>
          <p className="text-red-100 text-lg">
            Discover amazing discounts and special offers from local businesses
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search offers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
            >
              <option value="discount">Highest Discount</option>
              <option value="rating">Best Rating</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {filteredBusinesses.length} Businesses with Offers
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <TrendingUp size={16} />
            <span>Updated hourly</span>
          </div>
        </div>

        {/* Business Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map(business => (
            <div key={business.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Header with Best Offer Badge */}
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold">
                        {business.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{business.name}</h3>
                  </div>
                </div>
                
                {/* Discount Badge */}
                <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-bold text-sm">
                  {getMaxDiscount(business)}% OFF
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                    {business.category}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span>{business.rating}</span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {business.description}
                </p>

                {/* Offers List */}
                <div className="space-y-2 mb-4">
                  {business.offers?.slice(0, 2).map((offer, index) => (
                    <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                            {offer.title}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {offer.discount_percent}% OFF
                          </p>
                        </div>
                        <Tag size={16} className="text-red-600" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleSave(business.id)}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                      savedItems.has(business.id)
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Heart size={16} className={savedItems.has(business.id) ? 'fill-current' : ''} />
                  </button>
                  <button
                    onClick={() => window.location.href = `/business/${business.slug}`}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    View Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <Flame size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No offers found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
