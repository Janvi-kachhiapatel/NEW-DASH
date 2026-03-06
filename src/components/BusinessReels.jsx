"use client";
import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MapPin, Star, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function BusinessReels({ businesses, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const videoRef = useRef(null);

  const currentBusiness = businesses[currentIndex];

  // Swipe handlers for mobile
  const handleTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < businesses.length - 1) {
      handleNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      handlePrevious();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && currentIndex < businesses.length - 1) {
        handleNext();
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handlePrevious();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, businesses.length, onClose]);

  useEffect(() => {
    // Reset states when changing business
    setIsLiked(false);
    setIsBookmarked(false);
    setShowComments(false);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < businesses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentBusiness.name,
        text: `Check out ${currentBusiness.name} - ${currentBusiness.description}`,
        url: window.location.href + '/' + currentBusiness.slug
      });
    }
  };

  // Sample content data for each business
  const sampleContent = {
    offers: [
      { id: 1, title: "50% OFF on First Order", description: "Valid until end of month", image: "/api/placeholder/400/600" },
      { id: 2, title: "Buy 2 Get 1 Free", description: "On selected items", image: "/api/placeholder/400/600" }
    ],
    menu: [
      { id: 1, title: "Signature Dish", description: "Our special recipe", price: "$12.99", image: "/api/placeholder/400/600" },
      { id: 2, title: "Chef's Special", description: "Limited time offer", price: "$15.99", image: "/api/placeholder/400/600" }
    ],
    gallery: [
      { id: 1, title: "Shop Interior", description: "Beautiful ambiance", image: "/api/placeholder/400/600" },
      { id: 2, title: "Our Team", description: "Friendly staff", image: "/api/placeholder/400/600" }
    ]
  };

  if (!currentBusiness) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={handleNext}
        disabled={currentIndex === businesses.length - 1}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={24} />
      </button>

      {/* Main Content */}
      <div className="w-full h-full flex items-center justify-center">
        <div 
          className="relative w-full h-full max-w-md mx-auto"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background Image/Video */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60">
            <img
              src={currentBusiness.image_url || "/api/placeholder/400/800"}
              alt={currentBusiness.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
            {/* Top Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {currentBusiness.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{currentBusiness.name}</h3>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <MapPin size={14} />
                    <span>{currentBusiness.location}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked ? 'bg-white/20' : 'bg-black/30'
                }`}
              >
                <Bookmark
                  size={20}
                  className={isBookmarked ? 'fill-white' : ''}
                />
              </button>
            </div>

            {/* Middle Section - Content Tabs */}
            <div className="flex-1 flex items-center justify-center">
              <div className="space-y-4 w-full">
                {/* Offers Section */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4">
                  <h4 className="font-bold text-lg mb-3 text-yellow-400">🔥 Special Offers</h4>
                  <div className="space-y-2">
                    {sampleContent.offers.map((offer) => (
                      <div key={offer.id} className="bg-white/10 rounded-lg p-3">
                        <h5 className="font-semibold">{offer.title}</h5>
                        <p className="text-sm opacity-80">{offer.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Menu Section */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4">
                  <h4 className="font-bold text-lg mb-3 text-green-400">🍽️ Menu Highlights</h4>
                  <div className="space-y-2">
                    {sampleContent.menu.map((item) => (
                      <div key={item.id} className="bg-white/10 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <h5 className="font-semibold">{item.title}</h5>
                          <p className="text-sm opacity-80">{item.description}</p>
                        </div>
                        <span className="font-bold text-green-400">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gallery Section */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4">
                  <h4 className="font-bold text-lg mb-3 text-blue-400">📸 Gallery</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {sampleContent.gallery.map((item) => (
                      <div key={item.id} className="bg-white/10 rounded-lg p-2">
                        <div className="aspect-video bg-white/20 rounded mb-2"></div>
                        <h5 className="font-semibold text-sm">{item.title}</h5>
                        <p className="text-xs opacity-80">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full transition-all ${
                    isLiked ? 'scale-110' : 'scale-100'
                  }`}
                >
                  <Heart
                    size={24}
                    className={isLiked ? 'fill-red-500 text-red-500' : ''}
                  />
                </button>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="p-2 rounded-full"
                >
                  <MessageCircle size={24} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full"
                >
                  <Share2 size={24} />
                </button>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{currentBusiness.rating || 4.8}</span>
                </div>
                <p className="text-xs opacity-80">Rating</p>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
            {businesses.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all ${
                  index === currentIndex ? 'w-8 bg-white' : 'w-1 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
