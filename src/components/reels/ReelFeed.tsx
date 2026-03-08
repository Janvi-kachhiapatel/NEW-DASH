"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MapPin, Star, Clock, ChevronLeft, ChevronRight, X, Play, Pause, Volume2, VolumeX, Music, TrendingUp, Eye } from 'lucide-react';

interface Reel {
  id: string;
  business_id: string;
  video_url: string;
  thumbnail_url: string;
  caption: string;
  duration_seconds: number;
  music_track?: {
    title: string;
    artist: string;
  };
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
  offers?: Array<{
    id: string;
    title: string;
    discount_percent: number;
    expiry_time: string;
  }>;
}

interface ReelFeedProps {
  reels: Reel[];
  onClose?: () => void;
  initialIndex?: number;
  showUI?: boolean;
  autoplay?: boolean;
}

export default function ReelFeed({ 
  reels, 
  onClose, 
  initialIndex = 0, 
  showUI = true, 
  autoplay = true 
}: ReelFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [interactions, setInteractions] = useState({
    liked: false,
    saved: false,
    shared: false
  });
  const [showComments, setShowComments] = useState(false);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const currentReel = reels[currentIndex];

  // Handle video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', updateProgress);
    };
  }, [currentIndex]);

  // Auto-play video when reel changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && autoplay) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }

    // Reset interactions when changing reel
    setInteractions({ liked: false, saved: false, shared: false });
    setProgress(0);
  }, [currentIndex, isPlaying, autoplay]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          handlePrevious();
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          setIsMuted(!isMuted);
          break;
        case 'Escape':
          onClose?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isMuted, onClose]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance < -50;
    const isDownSwipe = distance > 50;

    if (isUpSwipe && currentIndex < reels.length - 1) {
      handleNext();
    }
    if (isDownSwipe && currentIndex > 0) {
      handlePrevious();
    }
  };

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, reels.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  // Interaction handlers
  const handleLike = async () => {
    setInteractions(prev => ({ ...prev, liked: !prev.liked }));
    // TODO: API call to like/unlike reel
  };

  const handleSave = async () => {
    setInteractions(prev => ({ ...prev, saved: !prev.saved }));
    // TODO: API call to save/unsave reel
  };

  const handleShare = async () => {
    setInteractions(prev => ({ ...prev, shared: true }));
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentReel.business.name} - ${currentReel.caption}`,
          text: `Check out this amazing ${currentReel.business.category}!`,
          url: `${window.location.origin}/reel/${currentReel.id}`
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/reel/${currentReel.id}`);
    }
    // TODO: API call to track share
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    const rect = videoRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const isLeftSide = x < rect.width / 3;
    const isRightSide = x > (rect.width * 2) / 3;

    if (isLeftSide) {
      handlePrevious();
    } else if (isRightSide) {
      handleNext();
    } else {
      togglePlay();
    }
  };

  if (!currentReel) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X size={24} />
        </button>
      )}

      {/* Main Reel Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Video/Background */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            src={currentReel.video_url}
            poster={currentReel.thumbnail_url}
            className="w-full h-full object-cover"
            loop
            playsInline
            muted={isMuted}
            onClick={handleVideoClick}
            onEnded={() => {
              // Auto-play next reel when current ends
              if (currentIndex < reels.length - 1) {
                handleNext();
              }
            }}
          />
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
        </div>

        {/* Progress Bar */}
        <div className="absolute top-4 left-4 right-4 z-40 flex gap-1">
          {reels.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1 rounded-full overflow-hidden ${
                index === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            >
              {index === currentIndex && (
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Left Side - Business Info & Actions */}
        {showUI && (
          <div className="absolute left-4 bottom-20 right-20 z-30 text-white">
            {/* Business Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                {currentReel.business.logo_url ? (
                  <img
                    src={currentReel.business.logo_url}
                    alt={currentReel.business.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {currentReel.business.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{currentReel.business.name}</h3>
                  {currentReel.business.is_verified && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Star size={12} className="fill-white text-white" />
                    </div>
                  )}
                  {currentReel.is_trending && (
                    <TrendingUp size={16} className="text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <MapPin size={14} />
                  <span>{currentReel.location_name || 'Local Business'}</span>
                  <span>•</span>
                  <span>{currentReel.business.category}</span>
                </div>
              </div>
              <button className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/30 transition-colors">
                Follow
              </button>
            </div>

            {/* Caption */}
            <p className="mb-3 text-sm leading-relaxed">
              {currentReel.caption}
            </p>

            {/* Hashtags */}
            {currentReel.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {currentReel.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-blue-300 text-sm hover:text-blue-200 cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Music Track */}
            {currentReel.music_track && (
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Music size={14} className="animate-pulse" />
                <span>{currentReel.music_track.title} - {currentReel.music_track.artist}</span>
              </div>
            )}

            {/* Live Offers */}
            {currentReel.offers && currentReel.offers.length > 0 && (
              <div className="mt-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-3">
                <h4 className="font-bold text-sm mb-2">🔥 Limited Time Offers</h4>
                {currentReel.offers.slice(0, 2).map((offer) => (
                  <div key={offer.id} className="bg-white/20 rounded-lg p-2 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs">{offer.title}</span>
                      <span className="bg-white/30 px-2 py-1 rounded text-xs">
                        {offer.discount_percent}% OFF
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Side - Action Buttons */}
        {showUI && (
          <div className="absolute right-4 bottom-20 z-30 flex flex-col gap-4">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`p-3 rounded-full transition-all transform hover:scale-110 ${
                interactions.liked ? 'bg-red-500/20' : 'bg-black/30'
              }`}
            >
              <Heart
                size={24}
                className={interactions.liked ? 'fill-red-500 text-red-500' : 'text-white'}
              />
            </button>
            <span className="text-white text-xs text-center">
              {currentReel.likes_count + (interactions.liked ? 1 : 0)}
            </span>

            {/* Comment */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="p-3 rounded-full bg-black/30 hover:bg-black/50 transition-all transform hover:scale-110"
            >
              <MessageCircle size={24} className="text-white" />
            </button>
            <span className="text-white text-xs text-center">
              {currentReel.comments_count}
            </span>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-black/30 hover:bg-black/50 transition-all transform hover:scale-110"
            >
              <Share2 size={24} className="text-white" />
            </button>
            <span className="text-white text-xs text-center">
              {currentReel.shares_count + (interactions.shared ? 1 : 0)}
            </span>

            {/* Save */}
            <button
              onClick={handleSave}
              className={`p-3 rounded-full transition-all transform hover:scale-110 ${
                interactions.saved ? 'bg-yellow-500/20' : 'bg-black/30'
              }`}
            >
              <Bookmark
                size={24}
                className={interactions.saved ? 'fill-yellow-500 text-yellow-500' : 'text-white'}
              />
            </button>
            <span className="text-white text-xs text-center">
              {currentReel.saves_count + (interactions.saved ? 1 : 0)}
            </span>

            {/* Views */}
            <div className="text-center">
              <div className="p-3 rounded-full bg-black/30">
                <Eye size={24} className="text-white" />
              </div>
              <span className="text-white text-xs">
                {currentReel.views_count.toLocaleString()}
              </span>
            </div>

            {/* Mute/Unmute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 rounded-full bg-black/30 hover:bg-black/50 transition-all transform hover:scale-110"
            >
              {isMuted ? (
                <VolumeX size={24} className="text-white" />
              ) : (
                <Volume2 size={24} className="text-white" />
              )}
            </button>
          </div>
        )}

        {/* Navigation Hints */}
        {showUI && (
          <>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">
              <ChevronLeft size={20} />
              <span className="block mt-1">Previous</span>
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">
              <ChevronRight size={20} />
              <span className="block mt-1">Next</span>
            </div>
          </>
        )}

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play size={40} className="text-white ml-2" />
            </div>
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Comments</h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No comments yet. Be the first to comment!
              </div>
              {/* TODO: Add comment list and input */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
