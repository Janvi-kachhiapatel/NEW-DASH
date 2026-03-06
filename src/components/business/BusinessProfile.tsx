"use client";
import { useState } from 'react';
import { 
  MapPin, Phone, Globe, Star, Heart, Share2, Bookmark, 
  Clock, Calendar, ChevronRight, Camera, MessageCircle, 
  Navigation, ExternalLink, MessageSquare, Facebook, Instagram,
  Play, CheckCircle, Award, TrendingUp, Users, Eye
} from 'lucide-react';

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  phone?: string;
  whatsapp_number?: string;
  email?: string;
  website?: string;
  address: string;
  location_lat?: number;
  location_lng?: number;
  city: string;
  state: string;
  logo_url?: string;
  cover_image_url?: string;
  gallery?: string[];
  operating_hours?: Record<string, any>;
  price_range: string;
  rating: number;
  review_count: number;
  follower_count: number;
  view_count: number;
  is_verified: boolean;
  is_featured: boolean;
  trust_score: number;
  response_time_minutes: number;
  social_links?: Record<string, string>;
  created_at: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  unit: string;
  duration_minutes?: number;
  category: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percent?: number;
  discount_amount?: number;
  original_price?: number;
  offer_price?: number;
  expiry_time: string;
  image_url?: string;
}

interface Review {
  id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title?: string;
  review_text: string;
  images?: string[];
  created_at: string;
  helpful_count: number;
}

interface Reel {
  id: string;
  video_url: string;
  thumbnail_url: string;
  caption: string;
  duration_seconds: number;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
}

interface BusinessProfileProps {
  business: Business;
  services?: Service[];
  offers?: Offer[];
  reviews?: Review[];
  reels?: Reel[];
  onBookService?: (service: Service) => void;
  onContact?: () => void;
  onShare?: () => void;
}

export default function BusinessProfile({ 
  business, 
  services = [], 
  offers = [], 
  reviews = [], 
  reels = [],
  onBookService,
  onContact,
  onShare
}: BusinessProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'services' | 'reels' | 'offers' | 'reviews'>('overview');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatOperatingHours = () => {
    if (!business.operating_hours) return null;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    
    return days.map((day, index) => {
      const hours = business.operating_hours[day.toLowerCase()];
      if (!hours || hours.is_closed) {
        return (
          <div key={day} className={`flex justify-between py-2 ${index === today ? 'font-semibold text-violet-600 dark:text-violet-400' : ''}`}>
            <span className="text-gray-600 dark:text-gray-400">{day}</span>
            <span className="text-red-500">Closed</span>
          </div>
        );
      }
      
      return (
        <div key={day} className={`flex justify-between py-2 ${index === today ? 'font-semibold text-violet-600 dark:text-violet-400' : ''}`}>
          <span className="text-gray-600 dark:text-gray-400">{day}</span>
          <span className="text-gray-900 dark:text-white">
            {hours.open_time} - {hours.close_time}
          </span>
        </div>
      );
    });
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover Image and Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-br from-violet-500 to-indigo-600 relative">
          {business.cover_image_url && (
            <img
              src={business.cover_image_url}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Back Button for Mobile */}
          <button className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white md:hidden">
            <ChevronRight size={20} className="rotate-180" />
          </button>

          {/* Share and Save Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={onShare}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <Bookmark size={18} className={isSaved ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        {/* Business Logo and Basic Info */}
        <div className="px-4 -mt-12">
          <div className="flex items-end gap-4 mb-4">
            {/* Logo */}
            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2">
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {business.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Business Name and Category */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {business.name}
                </h1>
                {business.is_verified && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                )}
                {business.is_featured && (
                  <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Award size={12} />
                    Featured
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {business.category} {business.subcategory && `• ${business.subcategory}`}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {business.rating}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {business.review_count} reviews
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users size={16} className="text-violet-500" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {business.follower_count}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Followers</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Eye size={16} className="text-green-500" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {business.view_count}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Views</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <div className={`flex items-center justify-center gap-1 mb-1 px-3 py-1 rounded-full ${getTrustScoreColor(business.trust_score)}`}>
                <Award size={16} />
                <span className="text-xl font-bold">
                  {business.trust_score}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Trust Score</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-2">About</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {business.description}
            </p>
            
            {/* Tags */}
            {business.tags && business.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {business.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Contact and Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{business.address}</p>
                    <p className="text-xs text-gray-500">{business.city}, {business.state}</p>
                  </div>
                </div>
                
                {business.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-400" />
                    <a href={`tel:${business.phone}`} className="text-sm text-violet-600 dark:text-violet-400 hover:underline">
                      {business.phone}
                    </a>
                  </div>
                )}
                
                {business.whatsapp_number && (
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} className="text-gray-400" />
                    <a 
                      href={`https://wa.me/${business.whatsapp_number.replace(/[^0-9]/g, '')}`}
                      className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      {business.whatsapp_number}
                    </a>
                  </div>
                )}
                
                {business.website && (
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-gray-400" />
                    <a 
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                    >
                      Website
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Business Hours</h3>
              <div className="space-y-1">
                {formatOperatingHours()}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={16} />
                  <span>Typically responds within {business.response_time_minutes} minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={onContact}
              className="flex-1 bg-violet-600 text-white py-3 rounded-xl hover:bg-violet-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              Contact Business
            </button>
            
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`px-6 py-3 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 ${
                isLiked
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Heart size={18} className={isLiked ? 'fill-current' : ''} />
              {isLiked ? 'Liked' : 'Like'}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-1 mb-6">
            <div className="flex overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'gallery', label: 'Gallery', count: business.gallery?.length },
                { id: 'services', label: 'Services', count: services.length },
                { id: 'reels', label: 'Reels', count: reels.length },
                { id: 'offers', label: 'Offers', count: offers.length },
                { id: 'reviews', label: 'Reviews', count: reviews.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-1 ${
                    activeTab === tab.id
                      ? 'bg-violet-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-20">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Price Range */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Price Range</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {business.price_range}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      ({business.price_range === '$' ? 'Budget-friendly' : 
                        business.price_range === '$$' ? 'Moderate' :
                        business.price_range === '$$$' ? 'Expensive' : 'Fine Dining'})
                    </span>
                  </div>
                </div>

                {/* Social Links */}
                {business.social_links && Object.keys(business.social_links).length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Follow Us</h3>
                    <div className="flex gap-3">
                      {business.social_links.instagram && (
                        <a
                          href={business.social_links.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                        >
                          <Instagram size={18} />
                        </a>
                      )}
                      {business.social_links.facebook && (
                        <a
                          href={business.social_links.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                        >
                          <Facebook size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && business.gallery && business.gallery.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {business.gallery.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`${business.name} ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && services.length > 0 && (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="bg-white dark:bg-gray-800 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {service.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold text-violet-600 dark:text-violet-400">
                            {formatPrice(service.base_price)}
                          </span>
                          <span className="text-gray-500">/{service.unit}</span>
                          {service.duration_minutes && (
                            <span className="text-gray-500">• {service.duration_minutes} min</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onBookService?.(service)}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reels Tab */}
            {activeTab === 'reels' && reels.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reels.map((reel) => (
                  <div key={reel.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                    <div className="relative aspect-[9/16] bg-gray-900">
                      <img
                        src={reel.thumbnail_url}
                        alt={reel.caption}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
                          <Play size={24} className="text-gray-900 ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-sm line-clamp-2 mb-2">{reel.caption}</p>
                        <div className="flex items-center gap-3 text-white text-xs">
                          <span className="flex items-center gap-1">
                            <Heart size={14} />
                            {reel.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={14} />
                            {reel.comments_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {reel.views_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Offers Tab */}
            {activeTab === 'offers' && offers.length > 0 && (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                    {offer.image_url && (
                      <div className="h-32">
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {offer.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {offer.description}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            {offer.original_price && (
                              <span className="text-gray-500 line-through">
                                {formatPrice(offer.original_price)}
                              </span>
                            )}
                            {offer.offer_price && (
                              <span className="font-semibold text-violet-600 dark:text-violet-400">
                                {formatPrice(offer.offer_price)}
                              </span>
                            )}
                            {offer.discount_percent && (
                              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                                {offer.discount_percent}% OFF
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Valid until {new Date(offer.expiry_time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && reviews.length > 0 && (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white dark:bg-gray-800 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        {review.user_avatar ? (
                          <img
                            src={review.user_avatar}
                            alt={review.user_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            {review.user_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {review.user_name}
                          </h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                        {review.title && (
                          <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                            {review.title}
                          </h5>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {review.review_text}
                        </p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mb-2">
                            {review.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Review ${index + 1}`}
                                className="w-16 h-16 rounded-lg object-cover cursor-pointer"
                                onClick={() => setSelectedImage(image)}
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(review.created_at).toLocaleDateString()}</span>
                          <span>Helpful ({review.helpful_count})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
