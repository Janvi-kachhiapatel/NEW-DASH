"use client";
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Heart, MessageCircle, Share2, Bookmark, MapPin, Star, Phone, ChevronRight, TrendingUp, Clock, Sparkles, Search } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo_url?: string;
  cover_image_url?: string;
  rating: number;
  review_count: number;
  price_range: string;
  distance?: number;
  address: string;
  phone?: string;
  is_verified: boolean;
  is_featured: boolean;
  offers?: Array<{
    id: string;
    title: string;
    discount_percent: number;
  }>;
}

interface Reel {
  id: string;
  business_id: string;
  business_name: string;
  video_url: string;
  thumbnail_url: string;
  caption: string;
  duration_seconds: number;
  likes_count: number;
  comments_count: number;
  views_count: number;
  business: Business;
}

interface DiscoveryFeedProps {
  businesses?: Business[];
  reels?: Reel[];
  onBusinessClick?: (business: Business) => void;
  onReelClick?: (reel: Reel) => void;
}

export default function DiscoveryFeed({ 
  businesses = [], 
  reels = [], 
  onBusinessClick,
  onReelClick 
}: DiscoveryFeedProps) {
  const [activeTab, setActiveTab] = useState<'for_you' | 'trending' | 'nearby' | 'offers'>('for_you');
  const [playingReel, setPlayingReel] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

  // Mix content for feed with unique items
  type FeedItem = 
    | { type: 'header'; content: 'trending' | 'popular' | 'offers'; id: string }
    | { type: 'reel'; content: Reel; id: string }
    | { type: 'business'; content: Business; id: string };

  const feedContent: FeedItem[] = [
    // Trending section header
    { type: 'header', content: 'trending', id: 'header-trending' },
    // Add some reels with unique IDs
    ...reels.slice(0, 3).map((reel, index) => ({ 
      type: 'reel' as const, 
      content: reel, 
      id: `reel-${reel.id}-${index}` 
    })),
    // Businesses header
    { type: 'header', content: 'popular', id: 'header-popular' },
    // Add some businesses with unique IDs
    ...businesses.slice(0, 4).map((business, index) => ({ 
      type: 'business' as const, 
      content: business, 
      id: `business-${business.id}-${index}` 
    })),
    // Offers header
    { type: 'header', content: 'offers', id: 'header-offers' },
    // Businesses with offers (different businesses to avoid duplicates)
    ...businesses.filter(b => b.offers && b.offers.length > 0).slice(0, 2).map((business, index) => ({ 
      type: 'business' as const, 
      content: business, 
      id: `offer-business-${business.id}-${index}` 
    })),
  ];

  const handleLike = (itemId: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSave = (itemId: string) => {
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const ReelCard = ({ reel }: { reel: Reel }) => {
    const isPlaying = playingReel === reel.id;
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    }, [isPlaying]);

    return (
      <div className="relative bg-black rounded-2xl overflow-hidden mb-4">
        {/* Video/Thumbnail */}
        <div 
          className="relative aspect-[9/16] bg-gray-900 cursor-pointer"
          onClick={() => setPlayingReel(isPlaying ? null : reel.id)}
        >
          {reel.video_url ? (
            <video
              ref={videoRef}
              src={reel.video_url}
              poster={reel.thumbnail_url}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={reel.thumbnail_url || '/api/placeholder/400/700'}
              alt={reel.caption}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className={`w-16 h-16 rounded-full bg-white/80 flex items-center justify-center transition-transform ${isPlaying ? 'scale-0' : 'scale-100'}`}>
              <Play size={32} className="text-gray-900 ml-1" />
            </div>
          </div>

          {/* Reel Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {reel.business_name.charAt(0)}
                </span>
              </div>
              <span className="text-white font-medium text-sm">{reel.business_name}</span>
              {reel.business.is_verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-white text-sm mb-2 line-clamp-2">{reel.caption}</p>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(`reel-${reel.id}`);
                  }}
                  className="flex items-center gap-1 text-white"
                >
                  <Heart 
                    size={20} 
                    className={likedItems.has(`reel-${reel.id}`) ? 'fill-red-500 text-red-500' : ''} 
                  />
                  <span className="text-xs">{reel.likes_count + (likedItems.has(`reel-${reel.id}`) ? 1 : 0)}</span>
                </button>
                <button className="flex items-center gap-1 text-white">
                  <MessageCircle size={20} />
                  <span className="text-xs">{reel.comments_count}</span>
                </button>
                <button className="flex items-center gap-1 text-white">
                  <Share2 size={20} />
                </button>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(`reel-${reel.id}`);
                }}
                className="text-white"
              >
                <Bookmark 
                  size={20} 
                  className={savedItems.has(`reel-${reel.id}`) ? 'fill-white' : ''} 
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BusinessCard = ({ business }: { business: Business }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-4">
        {/* Cover Image */}
        <div className="relative h-32 bg-gradient-to-br from-violet-500 to-indigo-600">
          {business.cover_image_url && (
            <img
              src={business.cover_image_url}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Business Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {business.is_featured && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <Sparkles size={12} />
                Featured
              </span>
            )}
            {business.is_verified && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Verified
              </span>
            )}
          </div>

          {/* Offer Badge */}
          {business.offers && business.offers.length > 0 && (
            <div className="absolute top-3 right-3">
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                🔥 {business.offers[0].discount_percent}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Business Info */}
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <span className="text-gray-600 dark:text-gray-400 font-bold text-lg">
                  {business.name.charAt(0)}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {business.name}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{business.rating}</span>
                  <span className="text-xs">({business.review_count})</span>
                </div>
                <span className="text-gray-400">•</span>
                <span>{business.price_range}</span>
                <span className="text-gray-400">•</span>
                <span>{business.category}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {business.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mb-3">
            <MapPin size={14} />
            <span>{business.distance ? `${business.distance.toFixed(1)} km away` : business.address}</span>
          </div>

          {/* Offer Details */}
          {business.offers && business.offers.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-red-600 dark:text-red-400 font-medium text-sm">
                  🔥 Limited Time Offer
                </span>
              </div>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                {business.offers[0].title}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onBusinessClick?.(business)}
              className="flex-1 bg-violet-600 text-white py-2 px-4 rounded-xl hover:bg-violet-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              View Details
              <ChevronRight size={16} />
            </button>
            {business.phone && (
              <button
                onClick={() => window.open(`tel:${business.phone}`)}
                className="bg-green-600 text-white p-2 rounded-xl hover:bg-green-700 transition-colors"
              >
                <Phone size={16} />
              </button>
            )}
            <button
              onClick={() => handleSave(`business-${business.id}`)}
              className={`p-2 rounded-xl transition-colors ${
                savedItems.has(`business-${business.id}`)
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Bookmark size={16} className={savedItems.has(`business-${business.id}`) ? 'fill-current' : ''} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SectionHeader = ({ type }: { type: string }) => {
    const headers = {
      trending: {
        icon: <TrendingUp size={20} />,
        title: 'Trending Now',
        subtitle: 'Hot businesses in your area'
      },
      popular: {
        icon: <Star size={20} />,
        title: 'Popular Businesses',
        subtitle: 'Top rated places near you'
      },
      offers: {
        icon: <Sparkles size={20} />,
        title: 'Special Offers',
        subtitle: 'Deals you don\'t want to miss'
      }
    };

    const header = headers[type as keyof typeof headers];
    if (!header) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center text-violet-600 dark:text-violet-400">
            {header.icon}
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{header.title}</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{header.subtitle}</p>
      </div>
    );
  };

  return (
    <div className="pb-20">
      {/* Tab Navigation */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 z-30 border-b border-gray-200 dark:border-gray-800">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { id: 'for_you', label: 'For You' },
            { id: 'trending', label: 'Trending' },
            { id: 'nearby', label: 'Nearby' },
            { id: 'offers', label: 'Offers' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Content */}
      <div className="p-4">
        {feedContent.map((item) => {
          if (item.type === 'header') {
            return <SectionHeader key={item.id} type={item.content} />;
          } else if (item.type === 'reel') {
            return <ReelCard key={item.id} reel={item.content} />;
          } else if (item.type === 'business') {
            return <BusinessCard key={item.id} business={item.content} />;
          }
          return null;
        })}

        {/* Empty State */}
        {feedContent.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No content yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start exploring to see businesses and reels in your area.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
