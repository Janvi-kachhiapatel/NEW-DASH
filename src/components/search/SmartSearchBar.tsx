"use client";
import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, TrendingUp, Clock, MapPin, Star, ChevronRight } from 'lucide-react';
import { dataStorage, Business } from '@/lib/dataStorage';

export default function SmartSearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      generateSuggestions(query);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const generateSuggestions = (searchQuery: string) => {
    setIsSearching(true);
    
    // Get all businesses
    const businesses = dataStorage.getBusinesses();
    
    // AI-powered suggestions based on keywords
    const aiSuggestions = [
      // Category-based suggestions
      ...businesses
        .filter(b => b.category.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(business => ({
          type: 'category',
          text: `${business.category} services`,
          subtext: `Find ${business.category} near you`,
          icon: <MapPin size={16} />,
          action: () => {
            window.location.href = `/?category=${business.category}`;
          }
        })),

      // Trending businesses
      ...businesses
        .filter(b => b.rating >= 4.5)
        .slice(0, 3)
        .map(business => ({
          type: 'trending',
          text: business.name,
          subtext: `${business.rating}⭐ • ${business.category}`,
          icon: <TrendingUp size={16} />,
          action: () => {
            window.location.href = `/business/${business.slug}`;
          }
        })),

      // Recent searches (mock data)
      {
        type: 'recent',
        text: 'restaurants near me',
        subtext: 'Recent search',
        icon: <Clock size={16} />,
        action: () => {
          setQuery('restaurants');
          window.location.href = '/?search=restaurants';
        }
      },

      // Popular suggestions based on query
      ...(searchQuery.toLowerCase().includes('food') || searchQuery.toLowerCase().includes('restaurant')) ? [
        {
          type: 'popular',
          text: 'best restaurants in city',
          subtext: 'Popular search',
          icon: <Sparkles size={16} />,
          action: () => {
            window.location.href = '/offers?category=Restaurants';
          }
        }
      ] : [],

      ...(searchQuery.toLowerCase().includes('service') || searchQuery.toLowerCase().includes('spa')) ? [
        {
          type: 'popular',
          text: 'spa and wellness services',
          subtext: 'Popular search',
          icon: <Sparkles size={16} />,
          action: () => {
            window.location.href = '/bookings?category=Spa';
          }
        }
      ] : []
    ];

    // Remove duplicates and limit to 6 suggestions
    const uniqueSuggestions = aiSuggestions
      .filter((suggestion, index, self) => 
        self.findIndex(s => s.text === suggestion.text) === index
      )
      .slice(0, 6);

    setSuggestions(uniqueSuggestions);
    setShowSuggestions(true);
    setIsSearching(false);
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search businesses, services, or keywords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyPress}
          className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        )}
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* AI Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-2">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
              <Sparkles size={12} />
              <span>AI Suggestions</span>
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  suggestion.action();
                  setShowSuggestions(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center text-violet-600 dark:text-violet-400">
                  {suggestion.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {suggestion.text}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {suggestion.subtext}
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-400 group-hover:text-violet-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
