"use client";
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Star, MapPin, Phone, ExternalLink, Filter, ChevronDown } from 'lucide-react';

interface PriceComparisonProps {
  category: string;
  service?: string;
}

interface BusinessComparison {
  id: string;
  name: string;
  slug: string;
  price: number;
  rating: number;
  distance: number;
  price_position: string;
  value_score: number;
  phone?: string;
}

interface MarketInsights {
  average_price: number;
  price_range: string;
  best_value: string;
  most_popular: string;
}

export default function PriceComparison({ category, service }: PriceComparisonProps) {
  const [comparisons, setComparisons] = useState<BusinessComparison[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'value'>('value');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPriceComparison();
  }, [category, service]);

  const fetchPriceComparison = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/price-comparison?category=${encodeURIComponent(category)}${service ? `&service=${encodeURIComponent(service)}` : ''}`);
      const result = await response.json();

      if (result.success) {
        setComparisons(result.data.businesses);
        setMarketInsights(result.data.market_insights);
      }
    } catch (error) {
      console.error('Failed to fetch price comparison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortComparisons = (data: BusinessComparison[]) => {
    const sorted = [...data];
    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'value':
        return sorted.sort((a, b) => b.value_score - a.value_score);
      default:
        return sorted;
    }
  };

  const getPriceTrend = (price: number, average: number) => {
    if (price < average * 0.9) return { icon: TrendingDown, color: 'green', label: 'Below Average' };
    if (price > average * 1.1) return { icon: TrendingUp, color: 'red', label: 'Above Average' };
    return { icon: TrendingUp, color: 'blue', label: 'Average' };
  };

  const handleBusinessClick = (slug: string) => {
    window.location.href = `/business/${slug}`;
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sortedComparisons = sortComparisons(comparisons);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Price Comparison</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {category} • {service || 'All Services'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          >
            <option value="value">Best Value</option>
            <option value="price">Lowest Price</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Market Insights */}
      {marketInsights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              ₹{marketInsights.average_price}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Average Price</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {marketInsights.price_range}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Price Range</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {marketInsights.best_value}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Best Value</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {marketInsights.most_popular}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Most Popular</div>
          </div>
        </div>
      )}

      {/* Comparison List */}
      <div className="space-y-3">
        {sortedComparisons.map((business, index) => {
          const trend = getPriceTrend(business.price, marketInsights?.average_price || 0);
          const TrendIcon = trend.icon;

          return (
            <div
              key={business.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-violet-600 dark:text-violet-400 font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 
                        className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-violet-600 dark:hover:text-violet-400"
                        onClick={() => handleBusinessClick(business.slug)}
                      >
                        {business.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span>{business.rating}</span>
                        <span>•</span>
                        <span>{business.distance.toFixed(1)} km</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{business.price}
                      </span>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        trend.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        trend.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        <TrendIcon size={12} />
                        {trend.label}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Value:</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < Math.floor(business.value_score / 20)
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {business.value_score}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {business.phone && (
                    <button
                      onClick={() => handleCall(business.phone!)}
                      className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <Phone size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleBusinessClick(business.slug)}
                    className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          💡 <strong>Tip:</strong> Value score is calculated based on price, rating, and customer reviews. 
          Higher value means better quality for the price.
        </p>
      </div>
    </div>
  );
}
