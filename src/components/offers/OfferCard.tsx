"use client";
import { useState } from 'react';
import { Clock, Tag, TrendingUp, Zap, ChevronRight, Copy, CheckCircle, AlertCircle } from 'lucide-react';

interface Offer {
  id: string;
  business_id: string;
  title: string;
  description: string;
  discount_percent?: number;
  discount_amount?: number;
  original_price?: number;
  offer_price?: number;
  offer_type: 'percentage' | 'fixed' | 'bogo' | 'free_shipping' | 'bundle';
  quantity_available?: number;
  quantity_used: number;
  expiry_time: string;
  is_flash_sale: boolean;
  is_featured: boolean;
  terms_conditions?: string;
  image_url?: string;
  click_count: number;
  conversion_count: number;
  business: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    rating: number;
    category: string;
    address: string;
  };
}

interface OfferCardProps {
  offer: Offer;
  onClaim?: (offer: Offer) => void;
  onBusinessClick?: (businessId: string) => void;
  showBusinessInfo?: boolean;
  compact?: boolean;
  className?: string;
}

export default function OfferCard({ 
  offer, 
  onClaim, 
  onBusinessClick, 
  showBusinessInfo = true,
  compact = false,
  className = '' 
}: OfferCardProps) {
  const [claimed, setClaimed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Calculate time left
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const expiry = new Date(offer.expiry_time).getTime();
    const difference = expiry - now;

    if (difference <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  // Update time left every minute
  useState(() => {
    const updateTime = () => {
      setTimeLeft(calculateTimeLeft());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  });

  const handleClaim = () => {
    if (claimed) return;
    
    setClaimed(true);
    onClaim?.(offer);
    
    // Reset after animation
    setTimeout(() => setClaimed(false), 3000);
  };

  const handleCopyCode = async () => {
    const code = `OFFER${offer.id.slice(-6).toUpperCase()}`;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDiscountDisplay = () => {
    if (offer.discount_percent) {
      return `${offer.discount_percent}% OFF`;
    } else if (offer.discount_amount) {
      return `₹${offer.discount_amount} OFF`;
    } else if (offer.offer_type === 'bogo') {
      return 'Buy 1 Get 1';
    } else if (offer.offer_type === 'free_shipping') {
      return 'Free Delivery';
    } else if (offer.offer_type === 'bundle') {
      return 'Bundle Deal';
    }
    return 'Special Offer';
  };

  const getUrgencyColor = () => {
    const now = new Date().getTime();
    const expiry = new Date(offer.expiry_time).getTime();
    const hoursLeft = (expiry - now) / (1000 * 60 * 60);

    if (hoursLeft <= 2) return 'text-red-600 bg-red-50';
    if (hoursLeft <= 6) return 'text-orange-600 bg-orange-50';
    if (hoursLeft <= 24) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const isExpired = new Date(offer.expiry_time) <= new Date();
  const isAlmostGone = offer.quantity_available && (offer.quantity_available - offer.quantity_used) <= 5;

  if (compact) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}>
        <div className="flex items-center gap-3 p-3">
          {/* Offer Image */}
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Tag size={24} className="text-white" />
          </div>

          {/* Offer Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {offer.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-red-600">
                {getDiscountDisplay()}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor()}`}>
                {timeLeft}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {offer.business.name}
            </p>
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={isExpired || claimed}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              isExpired 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : claimed 
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isExpired ? 'Expired' : claimed ? 'Claimed!' : 'Claim'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}>
      {/* Header with Badge */}
      <div className="relative">
        {offer.image_url ? (
          <img
            src={offer.image_url}
            alt={offer.title}
            className="w-full h-32 object-cover"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
            <Tag size={48} className="text-white opacity-50" />
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {offer.is_flash_sale && (
            <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Zap size={12} className="animate-pulse" />
              Flash Sale
            </div>
          )}
          {offer.is_featured && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <TrendingUp size={12} />
              Featured
            </div>
          )}
        </div>

        {/* Urgity Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${getUrgencyColor()}`}>
          <Clock size={12} className="inline mr-1" />
          {timeLeft}
        </div>

        {/* Stock Warning */}
        {isAlmostGone && (
          <div className="absolute bottom-2 right-2 bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <AlertCircle size={12} />
            Only {offer.quantity_available! - offer.quantity_used} left!
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Business Info */}
        {showBusinessInfo && (
          <div 
            className="flex items-center gap-2 mb-3 cursor-pointer"
            onClick={() => onBusinessClick?.(offer.business.id)}
          >
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              {offer.business.logo_url ? (
                <img
                  src={offer.business.logo_url}
                  alt={offer.business.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  {offer.business.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {offer.business.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {offer.business.category} • ⭐ {offer.business.rating}
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        )}

        {/* Offer Title */}
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
          {offer.title}
        </h3>

        {/* Offer Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {offer.description}
        </p>

        {/* Price Display */}
        {offer.original_price && offer.offer_price && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-red-600">
              ₹{offer.offer_price}
            </span>
            <span className="text-lg text-gray-400 line-through">
              ₹{offer.original_price}
            </span>
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">
              {getDiscountDisplay()}
            </span>
          </div>
        )}

        {/* Terms */}
        {offer.terms_conditions && (
          <details className="mb-3">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              Terms & Conditions
            </summary>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {offer.terms_conditions}
            </p>
          </details>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span>{offer.click_count} views</span>
          <span>{offer.conversion_count} claimed</span>
          {offer.quantity_available && (
            <span>
              {offer.quantity_available - offer.quantity_used} of {offer.quantity_available} available
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleClaim}
            disabled={isExpired || claimed}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              isExpired 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : claimed 
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isExpired ? 'Offer Expired' : claimed ? '✓ Successfully Claimed!' : 'Claim Offer'}
          </button>

          <button
            onClick={handleCopyCode}
            className="py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Code'}
          </button>
        </div>

        {/* Success Message */}
        {claimed && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
              <CheckCircle size={16} />
              <span>Offer code copied to clipboard! Show this at the business to redeem.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
