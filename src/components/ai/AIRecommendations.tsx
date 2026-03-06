"use client";
import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, MapPin, Star, Clock, ArrowRight, Brain, Target, Zap } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo_url?: string;
  rating: number;
  review_count: number;
  price_range: string;
  distance?: number;
  is_verified: boolean;
  is_featured: boolean;
  trust_score: number;
  tags: string[];
}

interface Recommendation {
  business: Business;
  score: number;
  reason: string;
  type: 'personalized' | 'trending' | 'nearby' | 'similar' | 'new';
}

interface AIRecommendationsProps {
  userLocation?: { lat: number; lng: number };
  userPreferences?: {
    categories: string[];
    priceRange: string;
    preferredDistance: number;
  };
  recentViews?: string[];
  onBusinessClick?: (business: Business) => void;
}

export default function AIRecommendations({
  userLocation,
  userPreferences,
  recentViews = [],
  onBusinessClick
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'personalized' | 'trending' | 'nearby' | 'new'>('all');

  // Simulate AI recommendation generation
  useEffect(() => {
    const generateRecommendations = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock recommendation data
      const mockRecommendations: Recommendation[] = [
        {
          business: {
            id: '1',
            name: 'Neon Gaming Zone',
            slug: 'neon-gaming-zone',
            category: 'Entertainment',
            description: 'Premium gaming experience with latest consoles and VR',
            rating: 4.8,
            review_count: 234,
            price_range: '$$',
            distance: 1.2,
            is_verified: true,
            is_featured: true,
            trust_score: 92,
            tags: ['gaming', 'vr', 'esports']
          },
          score: 95,
          reason: 'Based on your interest in gaming and entertainment',
          type: 'personalized'
        },
        {
          business: {
            id: '2',
            name: 'Cafe Bliss',
            slug: 'cafe-bliss',
            category: 'Restaurant',
            description: 'Cozy cafe with artisanal coffee and fresh baked goods',
            rating: 4.6,
            review_count: 189,
            price_range: '$',
            distance: 0.8,
            is_verified: true,
            is_featured: false,
            trust_score: 88,
            tags: ['coffee', 'bakery', 'wifi']
          },
          score: 88,
          reason: 'Trending in your area - 45% more visits this week',
          type: 'trending'
        },
        {
          business: {
            id: '3',
            name: 'Style Studio',
            slug: 'style-studio',
            category: 'Beauty',
            description: 'Unisex salon with modern styling and beauty treatments',
            rating: 4.7,
            review_count: 156,
            price_range: '$$$',
            distance: 2.1,
            is_verified: true,
            is_featured: true,
            trust_score: 90,
            tags: ['salon', 'beauty', 'styling']
          },
          score: 82,
          reason: 'Highly rated and near your location',
          type: 'nearby'
        },
        {
          business: {
            id: '4',
            name: 'FitZone Gym',
            slug: 'fitzone-gym',
            category: 'Fitness',
            description: 'Modern fitness center with personal training',
            rating: 4.5,
            review_count: 98,
            price_range: '$$',
            distance: 1.5,
            is_verified: false,
            is_featured: false,
            trust_score: 75,
            tags: ['gym', 'fitness', 'training']
          },
          score: 78,
          reason: 'Similar to businesses you\'ve viewed',
          type: 'similar'
        },
        {
          business: {
            id: '5',
            name: 'TechHub Store',
            slug: 'techhub-store',
            category: 'Shopping',
            description: 'Latest gadgets and electronics at best prices',
            rating: 4.4,
            review_count: 67,
            price_range: '$$',
            distance: 3.2,
            is_verified: true,
            is_featured: false,
            trust_score: 82,
            tags: ['electronics', 'gadgets', 'tech']
          },
          score: 75,
          reason: 'New business with great reviews',
          type: 'new'
        }
      ];

      setRecommendations(mockRecommendations);
      setLoading(false);
    };

    generateRecommendations();
  }, [userLocation, userPreferences, recentViews]);

  const filteredRecommendations = activeFilter === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.type === activeFilter);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'personalized':
        return <Brain size={16} className="text-violet-500" />;
      case 'trending':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'nearby':
        return <MapPin size={16} className="text-blue-500" />;
      case 'new':
        return <Sparkles size={16} className="text-yellow-500" />;
      default:
        return <Target size={16} className="text-gray-500" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'personalized':
        return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800';
      case 'trending':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'nearby':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'new':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (score >= 80) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
            <Brain size={20} className="text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Recommendations</h3>
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Recommendations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Personalized suggestions based on your preferences
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Powered by AI
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {[
          { id: 'all', label: 'All Recommendations', count: recommendations.length },
          { id: 'personalized', label: 'For You', count: recommendations.filter(r => r.type === 'personalized').length },
          { id: 'trending', label: 'Trending', count: recommendations.filter(r => r.type === 'trending').length },
          { id: 'nearby', label: 'Nearby', count: recommendations.filter(r => r.type === 'nearby').length },
          { id: 'new', label: 'New', count: recommendations.filter(r => r.type === 'new').length }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeFilter === filter.id
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filter.label}
            {filter.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeFilter === filter.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'
              }`}>
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target size={24} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recommendations yet
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start exploring businesses to get personalized recommendations.
            </p>
          </div>
        ) : (
          filteredRecommendations.map((recommendation) => (
            <div
              key={recommendation.business.id}
              className="group relative bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-violet-200 dark:hover:border-violet-800"
              onClick={() => onBusinessClick?.(recommendation.business)}
            >
              {/* AI Badge */}
              <div className="absolute top-3 right-3">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRecommendationColor(recommendation.type)}`}>
                  {getRecommendationIcon(recommendation.type)}
                  <span className="capitalize">{recommendation.type}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                {/* Business Logo */}
                <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  {recommendation.business.logo_url ? (
                    <img
                      src={recommendation.business.logo_url}
                      alt={recommendation.business.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                      {recommendation.business.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Business Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {recommendation.business.name}
                    </h4>
                    {recommendation.business.is_verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    {recommendation.business.is_featured && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        Featured
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                    {recommendation.business.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span>{recommendation.business.rating}</span>
                      <span>({recommendation.business.review_count})</span>
                    </div>
                    <span>•</span>
                    <span>{recommendation.business.price_range}</span>
                    <span>•</span>
                    <span>{recommendation.business.category}</span>
                    {recommendation.business.distance && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span>{recommendation.business.distance.toFixed(1)} km</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* AI Reason */}
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={12} className="text-violet-500" />
                    <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                      {recommendation.reason}
                    </span>
                  </div>

                  {/* Tags */}
                  {recommendation.business.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {recommendation.business.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {recommendation.business.tags.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{recommendation.business.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Score and Action */}
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(recommendation.score)}`}>
                    {recommendation.score}% match
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBusinessClick?.(recommendation.business);
                    }}
                    className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredRecommendations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Brain size={16} className="text-violet-500" />
              <span>Recommendations updated based on your activity</span>
            </div>
            <button className="text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium">
              Refresh Suggestions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
