"use client";
import { useState, useEffect } from 'react';
import { Camera, Upload, CheckCircle, XCircle, Clock, Users, Award, AlertCircle, X } from 'lucide-react';

interface ShopVerificationProps {
  businessId: string;
  businessName: string;
  onVerificationComplete?: (status: string) => void;
}

export default function ShopVerification({ businessId, businessName, onVerificationComplete }: ShopVerificationProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'in_progress' | 'verified' | 'failed'>('pending');
  const [customerResponses, setCustomerResponses] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    checkVerificationStatus();
    // Simulate customer responses
    const mockResponses = [
      { customer_id: '1', customer_name: 'Rahul S.', verified: true, comment: 'Yes, this shop exists and is operational' },
      { customer_id: '2', customer_name: 'Priya P.', verified: true, comment: 'Visited last week, great service!' },
      { customer_id: '3', customer_name: 'Amit K.', verified: true, comment: 'Authentic business, highly recommend' },
      { customer_id: '4', customer_name: 'Neha R.', verified: false, comment: 'Could not verify - shop was closed' },
      { customer_id: '5', customer_name: 'Vikram S.', verified: true, comment: 'Regular customer, shop is legitimate' }
    ];
    setCustomerResponses(mockResponses);
  }, []);

  const checkVerificationStatus = () => {
    // Mock verification status check
    const status = localStorage.getItem(`verification_${businessId}`);
    if (status) {
      setVerificationStatus(status as any);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setIsUploading(true);
      
      // Simulate upload process
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
      
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  const submitVerification = async () => {
    if (uploadedPhotos.length < 3) {
      alert('Please upload at least 3 photos for verification');
      return;
    }

    setIsUploading(true);
    setVerificationStatus('in_progress');

    try {
      // Mock API call to submit verification
      const verificationData = {
        business_id: businessId,
        photos: uploadedPhotos,
        submitted_at: new Date().toISOString(),
        status: 'in_progress'
      };

      localStorage.setItem(`verification_${businessId}`, 'in_progress');
      
      // Simulate verification process (would notify 10 random customers)
      setTimeout(() => {
        const verifiedCount = customerResponses.filter(r => r.verified).length;
        const isVerified = verifiedCount >= 7; // At least 7 out of 10 customers must verify
        
        setVerificationStatus(isVerified ? 'verified' : 'failed');
        localStorage.setItem(`verification_${businessId}`, isVerified ? 'verified' : 'failed');
        onVerificationComplete?.(isVerified ? 'verified' : 'failed');
        
        setIsUploading(false);
      }, 5000); // Simulate 5 second verification process

    } catch (error) {
      console.error('Verification submission failed:', error);
      setVerificationStatus('failed');
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'in_progress': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle size={20} />;
      case 'failed': return <XCircle size={20} />;
      case 'in_progress': return <Clock size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shop Verification</h2>
        <div className={`flex items-center gap-2 ${getStatusColor(verificationStatus)}`}>
          {getStatusIcon(verificationStatus)}
          <span className="font-medium capitalize">
            {verificationStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Verification Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Monthly Verification Process</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Upload 3-5 current photos of your shop</li>
              <li>• 10 random customers will be contacted for verification</li>
              <li>• At least 7 customers must confirm shop exists</li>
              <li>• Verification is required monthly to maintain verified status</li>
              <li>• Verified shops get priority in search results</li>
            </ul>
          </div>
        </div>
      </div>

      {verificationStatus === 'pending' && (
        <div className="space-y-6">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Shop Photos (3-5 photos required)
            </label>
            <div className="space-y-4">
              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Shop photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {uploadedPhotos.length < 5 && (
                    <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {isUploading ? 'Uploading...' : 'Add Photos'}
                      </span>
                    </label>
                  )}
                </div>
              )}
              
              {uploadedPhotos.length === 0 && (
                <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Camera size={32} className="text-gray-400 mb-2" />
                  <span className="text-gray-600 dark:text-gray-400">Click to upload shop photos</span>
                  <span className="text-sm text-gray-500">3-5 photos required</span>
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={submitVerification}
            disabled={uploadedPhotos.length < 3 || isUploading}
            className="w-full px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting for Verification...
              </>
            ) : (
              <>
                <Award size={20} />
                Submit for Verification
              </>
            )}
          </button>
        </div>
      )}

      {verificationStatus === 'in_progress' && (
        <div className="text-center py-8">
          <Clock size={48} className="mx-auto text-yellow-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Verification in Progress</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We're contacting 10 random customers to verify {businessName}. This usually takes 24-48 hours.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              You'll receive an email once verification is complete.
            </p>
          </div>
        </div>
      )}

      {verificationStatus === 'verified' && (
        <div className="text-center py-8">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Shop Verified! ✓</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {businessName} has been successfully verified by customers.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              Your shop now has a verified badge and priority in search results.
            </p>
          </div>
        </div>
      )}

      {verificationStatus === 'failed' && (
        <div className="text-center py-8">
          <XCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Verification Failed</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We couldn't verify {businessName}. Please try again with better photos.
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              Less than 7 customers could verify your shop. Please ensure your shop is operational and try again.
            </p>
          </div>
          <button
            onClick={() => {
              setVerificationStatus('pending');
              setUploadedPhotos([]);
            }}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Customer Responses Preview */}
      {verificationStatus !== 'pending' && customerResponses.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Verification Responses</h3>
          <div className="space-y-3">
            {customerResponses.map((response, index) => (
              <div key={response.customer_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    response.verified 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {response.verified ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Customer {response.customer_id}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {response.customer_name}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                  "{response.comment}"
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{customerResponses.filter(r => r.verified).length}/10</strong> customers verified this shop exists.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
