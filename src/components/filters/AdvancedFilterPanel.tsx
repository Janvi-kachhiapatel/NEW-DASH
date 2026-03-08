"use client";
import { useState, useEffect } from 'react';
import { Filter, X, Star, MapPin, DollarSign, Clock, Check } from 'lucide-react';

interface AdvancedFilterPanelProps {
  onFilterChange: (filters: any) => void;
  businesses: any[];
}

export default function AdvancedFilterPanel({ onFilterChange, businesses }: AdvancedFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    rating: 0,
    priceRange: 'all',
    distance: 'all',
    verified: false,
    offers: false,
    openNow: false
  });

  // Get unique categories from businesses
  const categories = ['all', ...Array.from(new Set(businesses.map(b => b.category)))];
  
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '$', label: 'Budget ($)' },
    { value: '$$', label: 'Moderate ($$)' },
    { value: '$$$', label: 'Expensive ($$$)' },
    { value: '$$$$', label: 'Premium ($$$$)' }
  ];

  const distances = [
    { value: 'all', label: 'Any Distance' },
    { value: '1', label: 'Within 1 km' },
    { value: '5', label: 'Within 5 km' },
    { value: '10', label: 'Within 10 km' },
    { value: '20', label: 'Within 20 km' }
  ];

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      rating: 0,
      priceRange: 'all',
      distance: 'all',
      verified: false,
      offers: false,
      openNow: false
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.rating > 0) count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.distance !== 'all') count++;
    if (filters.verified) count++;
    if (filters.offers) count++;
    if (filters.openNow) count++;
    return count;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-gray-600 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">Advanced Filters</span>
          {getActiveFiltersCount() > 0 && (
            <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs rounded-full">
              {getActiveFiltersCount()} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            >
              Clear all
            </span>
          )}
          <X 
            size={18} 
            className={`text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Rating
              </label>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.rating}
                  onChange={(e) => updateFilter('rating', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[3rem]">
                  {filters.rating > 0 ? filters.rating : 'Any'}
                </span>
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => updateFilter('priceRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Distance
              </label>
              <select
                value={filters.distance}
                onChange={(e) => updateFilter('distance', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {distances.map(distance => (
                  <option key={distance.value} value={distance.value}>
                    {distance.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Filters */}
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Filters
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter('verified', !filters.verified)}
                  className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    filters.verified
                      ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Check size={14} className={filters.verified ? 'text-green-600 dark:text-green-400' : 'text-gray-400'} />
                  Verified Only
                </button>
                
                <button
                  onClick={() => updateFilter('offers', !filters.offers)}
                  className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    filters.offers
                      ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <DollarSign size={14} className={filters.offers ? 'text-red-600 dark:text-red-400' : 'text-gray-400'} />
                  Has Offers
                </button>
                
                <button
                  onClick={() => updateFilter('openNow', !filters.openNow)}
                  className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    filters.openNow
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Clock size={14} className={filters.openNow ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'} />
                  Open Now
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {getActiveFiltersCount() > 0 && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied
                </span>
                <button
                  onClick={clearFilters}
                  className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
