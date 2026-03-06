"use client";
import { useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Play, Eye, TrendingUp, MapPin, Star } from 'lucide-react';

interface Reel {
  id: string;
  business_id: string;
  video_url: string;
  thumbnail_url: string;
  caption: string;
  duration_seconds: number;
  hashtags: string[];
  location_name?: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  is_trending: boolean;
  business: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    is_verified: boolean;
    follower_count: number;
    rating: number;
    category: string;
  };
}

interface ReelCardProps {
  reel: Reel;
  onPlay?: (reel: Reel) => void;
  size?: 'small' | 'medium' | 'large';
  showStats?: boolean;
  showBusinessInfo?: boolean;
  className?: string;
}

export default function ReelCard({
  reel,
  onPlay,
  size = 'medium',
  showStats = true,
  showBusinessInfo = true,
  className = ''
}: ReelCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Size configurations
  const sizeConfig = {
    small: {
      width: 'w-48',
      height: 'h-64',
      textSize: 'text-xs',
      iconSize: 14
    },
    medium: {
      width: 'w-56',
      height: 'h-80',
      textSize: 'text-sm',
      iconSize: 16
    },
    large: {
      width: 'w-72',
      height: 'h-96',
      textSize: 'text-base',
      iconSize: 20
    }
  };

  const config = sizeConfig[size];

  // Handle video preview on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    // TODO: API call to like/unlike reel
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    // TODO: API call to save/unsave reel
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `${reel.business.name} - ${reel.caption}`,
        text: `Check out this amazing ${reel.business.category}!`,
        url: `${window.location.origin}/reel/${reel.id}`
      });
    }
    // TODO: API call to track share
  };

  const handlePlay = () => {
    onPlay?.(reel);
  };

  return (
    <div
      className={`${config.width} ${config.height} relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-900 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handlePlay}
    >
      {/* Video/Thumbnail */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          src={reel.video_url}
          poster={reel.thumbnail_url}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform transition-all duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}>
            <Play size={20} className="text-white ml-1" />
          </div>
        </div>

        {/* Trending badge */}
        {reel.is_trending && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold">
            <TrendingUp size={12} />
            Trending
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
          {Math.floor(reel.duration_seconds / 60)}:{(reel.duration_seconds % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Content overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        {/* Business info */}
        {showBusinessInfo && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              {reel.business.logo_url ? (
                <img
                  src={reel.business.logo_url}
                  alt={reel.business.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xs">
                  {reel.business.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className={`font-semibold ${config.textSize} truncate`}>
                  {reel.business.name}
                </span>
                {reel.business.is_verified && (
                  <Star size={10} className="fill-blue-500 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 opacity-80">
                <MapPin size={10} />
                <span className={`truncate ${config.textSize}`}>
                  {reel.location_name || 'Local Business'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Caption */}
        <p className={`${config.textSize} line-clamp-2 mb-2`}>
          {reel.caption}
        </p>

        {/* Hashtags */}
        {reel.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {reel.hashtags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`${config.textSize} text-blue-300 hover:text-blue-200`}
              >
                #{tag}
              </span>
            ))}
            {reel.hashtags.length > 3 && (
              <span className={`${config.textSize} text-blue-300`}>
                +{reel.hashtags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        {showStats && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className="flex items-center gap-1 hover:text-red-400 transition-colors"
              >
                <Heart
                  size={config.iconSize}
                  className={isLiked ? 'fill-red-500 text-red-500' : ''}
                />
                <span className={config.textSize}>
                  {reel.likes_count + (isLiked ? 1 : 0)}
                </span>
              </button>
              <div className="flex items-center gap-1">
                <MessageCircle size={config.iconSize} />
                <span className={config.textSize}>{reel.comments_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={config.iconSize} />
                <span className={config.textSize}>
                  {reel.views_count > 1000 
                    ? `${(reel.views_count / 1000).toFixed(1)}K` 
                    : reel.views_count.toString()
                  }
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="hover:text-yellow-400 transition-colors"
              >
                <Bookmark
                  size={config.iconSize}
                  className={isSaved ? 'fill-yellow-500 text-yellow-500' : ''}
                />
              </button>
              <button
                onClick={handleShare}
                className="hover:text-blue-400 transition-colors"
              >
                <Share2 size={config.iconSize} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hover effect border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-2xl transition-colors duration-300 pointer-events-none" />
    </div>
  );
}
