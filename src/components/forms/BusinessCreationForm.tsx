"use client";
import { useState, useEffect } from 'react';
import { X, Upload, MapPin, Phone, Mail, Globe, Clock, Star, Shield, Navigation, Target } from 'lucide-react';
import BusinessVerification from '@/components/verification/BusinessVerification';
import ImageUpload from '@/components/upload/ImageUpload';

interface BusinessCreationFormProps {
  business?: any;
  onSave: (business: any) => void;
  onClose: () => void;
}

export default function BusinessCreationForm({ business, onSave, onClose }: BusinessCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: business?.name || '',
    category: business?.category || '',
    subcategory: business?.subcategory || '',
    description: business?.description || '',
    phone: business?.phone || '',
    email: business?.email || '',
    website: business?.website || '',
    address: business?.address || '',
    price_range: business?.price_range || '$$',
    logo_url: business?.logo_url || '',
    cover_image_url: business?.cover_image_url || '',
    operating_hours: business?.operating_hours || {
      monday: { open: '09:00', close: '18:00', is_open: true },
      tuesday: { open: '09:00', close: '18:00', is_open: true },
      wednesday: { open: '09:00', close: '18:00', is_open: true },
      thursday: { open: '09:00', close: '18:00', is_open: true },
      friday: { open: '09:00', close: '18:00', is_open: true },
      saturday: { open: '09:00', close: '18:00', is_open: true },
      sunday: { open: '09:00', close: '18:00', is_open: false }
    }
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [locationData, setLocationData] = useState({
    lat: business?.location_lat || '',
    lng: business?.location_lng || '',
    useCurrentLocation: false
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);

  const categories = [
    'Restaurant', 'Shopping', 'Healthcare', 'Education', 'Entertainment', 
    'Fitness', 'Automotive', 'Beauty', 'Professional Services', 'Other'
  ];

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationData({
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString(),
          useCurrentLocation: true
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please enter coordinates manually.');
        setIsGettingLocation(false);
      }
    );
  };

  // Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number) => {
    setLocationData({
      lat: lat.toString(),
      lng: lng.toString(),
      useCurrentLocation: false
    });
    setShowLocationMap(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const businessData = {
        ...formData,
        id: business?.id || Date.now().toString(),
        slug: business?.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        owner_id: localStorage.getItem('currentUser') || 'user1',
        location_lat: parseFloat(locationData.lat) || 0,
        location_lng: parseFloat(locationData.lng) || 0,
        rating: business?.rating || 0,
        review_count: business?.review_count || 0,
        is_verified: false, // Will be updated after verification
        is_featured: business?.is_featured || false,
        logo_url: business?.logo_url || '/api/placeholder/200/200',
        cover_image_url: business?.cover_image_url || '/api/placeholder/400/200',
        created_at: business?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Check if user is verified
      const currentUser = localStorage.getItem('currentUser');
      const userVerification = localStorage.getItem(`verification_${currentUser}`);
      
      if (!userVerification || JSON.parse(userVerification).status !== 'verified') {
        // Save business data temporarily and show verification
        localStorage.setItem('pending_business', JSON.stringify(businessData));
        setShowVerification(true);
        return;
      }

      // If already verified, save business directly
      onSave(businessData);
      onClose();
    } catch (error) {
      console.error('Failed to save business:', error);
      alert('Failed to save business. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationComplete = (verification: any) => {
    setVerificationData(verification);
    
    // Save verification status
    const currentUser = localStorage.getItem('currentUser');
    localStorage.setItem(`verification_${currentUser}`, JSON.stringify(verification));
    
    // Now save the business
    const pendingBusiness = localStorage.getItem('pending_business');
    if (pendingBusiness) {
      const businessData = JSON.parse(pendingBusiness);
      businessData.is_verified = true;
      businessData.verification_data = verification;
      
      onSave(businessData);
      localStorage.removeItem('pending_business');
      onClose();
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateOperatingHours = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: {
          ...prev.operating_hours[day],
          [field]: value
        }
      }
    }));
  };

  // If verification is needed, show verification component
  if (showVerification) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield size={24} className="text-violet-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Business Verification Required</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete verification to create your shop on BizGallery
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <BusinessVerification
              onVerificationComplete={handleVerificationComplete}
              businessData={formData}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {business ? 'Edit Business' : 'Create New Business'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Verification Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Verification Required</h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Business verification is mandatory to create a shop on BizGallery. You'll need to upload business documents for verification.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Enter business name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => updateFormData('category', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => updateFormData('subcategory', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="e.g., Italian Restaurant"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Describe your business..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price Range
                    </label>
                    <select
                      value={formData.price_range}
                      onChange={(e) => updateFormData('price_range', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    >
                      <option value="$">Budget ($)</option>
                      <option value="$$">Moderate ($$)</option>
                      <option value="$$$">Expensive ($$$)</option>
                      <option value="$$$$">Premium ($$$$)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Business Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Images</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Logo *
                    </label>
                    <ImageUpload
                      onImageSelect={(imageUrl) => updateFormData('logo_url', imageUrl)}
                      currentImage={formData.logo_url}
                      className="max-w-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Upload your business logo (square format recommended)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cover Image *
                    </label>
                    <ImageUpload
                      onImageSelect={(imageUrl) => updateFormData('cover_image_url', imageUrl)}
                      currentImage={formData.cover_image_url}
                      className="max-w-md"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Upload a cover image for your business (landscape format recommended)
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="info@business.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website (Optional)
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Leave empty to get a free business page on BizGallery (e.g., bizgallery.com/your-business)
                    </p>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => updateFormData('website', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="https://www.business.com (optional)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => updateFormData('address', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="123 Main Street, City, State"
                      />
                    </div>
                  </div>

                  {/* Location Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Location *
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={isGettingLocation}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                        >
                          <Navigation size={16} />
                          {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowLocationMap(true)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Target size={16} />
                          Select on Map
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Latitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={locationData.lat}
                            onChange={(e) => setLocationData(prev => ({ ...prev, lat: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            placeholder="23.0225"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Longitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={locationData.lng}
                            onChange={(e) => setLocationData(prev => ({ ...prev, lng: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            placeholder="72.5714"
                          />
                        </div>
                      </div>
                      
                      {(locationData.lat || locationData.lng) && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Target size={16} className="text-green-600" />
                            <span className="text-sm text-green-800 dark:text-green-200">
                              Location set: {locationData.lat}, {locationData.lng}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Operating Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formData.operating_hours).map((day) => (
                  <div key={day} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.operating_hours[day].is_open}
                      onChange={(e) => updateOperatingHours(day, 'is_open', e.target.checked)}
                      className="w-4 h-4 text-violet-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white capitalize">{day}</div>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={formData.operating_hours[day].open}
                          onChange={(e) => updateOperatingHours(day, 'open', e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                          disabled={!formData.operating_hours[day].is_open}
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={formData.operating_hours[day].close}
                          onChange={(e) => updateOperatingHours(day, 'close', e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                          disabled={!formData.operating_hours[day].is_open}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {business ? 'Updating...' : 'Continue to Verification...'}
                  </>
                ) : (
                  <>
                    {business ? 'Update Business' : 'Create Business'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Location Selection Map Modal */}
      {showLocationMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Business Location
                </h3>
                <button
                  onClick={() => setShowLocationMap(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <Target size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Click on the map to select your business location
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-sm">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      For now, please enter your coordinates manually in the form above. 
                      The interactive map will be available in the next update.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowLocationMap(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
