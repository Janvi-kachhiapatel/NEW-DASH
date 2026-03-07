"use client";
import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Shield, Award, Clock, X, Eye } from 'lucide-react';

interface BusinessVerificationProps {
  onVerificationComplete: (verificationData: any) => void;
  businessData?: any;
}

interface VerificationDocument {
  id: string;
  type: 'business_certificate' | 'gst_certificate' | 'address_proof' | 'identity_proof';
  name: string;
  file: File;
  uploaded_at: string;
  status: 'pending' | 'verified' | 'rejected';
  preview_url?: string;
}

export default function BusinessVerification({ onVerificationComplete, businessData }: BusinessVerificationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'in_progress' | 'verified' | 'rejected'>('pending');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const documentTypes = [
    {
      id: 'business_certificate',
      name: 'Business Registration Certificate',
      description: 'Official business registration document',
      required: true,
      icon: <FileText size={20} />
    },
    {
      id: 'gst_certificate',
      name: 'GST Certificate',
      description: 'Goods and Services Tax registration certificate',
      required: true,
      icon: <Award size={20} />
    },
    {
      id: 'address_proof',
      name: 'Address Proof',
      description: 'Utility bill or rental agreement for business address',
      required: true,
      icon: <Shield size={20} />
    },
    {
      id: 'identity_proof',
      name: 'Identity Proof',
      description: 'Owner\'s Aadhaar card, PAN card, or Passport',
      required: true,
      icon: <FileText size={20} />
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, JPEG, or PNG file');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      const newDocument: VerificationDocument = {
        id: Date.now().toString(),
        type: documentType as any,
        name: file.name,
        file,
        uploaded_at: new Date().toISOString(),
        status: 'pending',
        preview_url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      };

      setDocuments(prev => {
        const filtered = prev.filter(d => d.type !== documentType);
        return [...filtered, newDocument];
      });
    }
  };

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== documentId));
  };

  const handleSubmit = async () => {
    // Check if all required documents are uploaded
    const requiredDocs = documentTypes.filter(doc => doc.required);
    const uploadedDocTypes = documents.map(d => d.type);
    const missingDocs = requiredDocs.filter(doc => !uploadedDocTypes.includes(doc.id as any));

    if (missingDocs.length > 0) {
      alert(`Please upload all required documents: ${missingDocs.map(d => d.name).join(', ')}`);
      return;
    }

    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    setVerificationStatus('in_progress');

    try {
      // Simulate verification process
      const verificationData = {
        business_id: businessData?.id,
        documents: documents.map(doc => ({
          id: doc.id,
          type: doc.type,
          name: doc.name,
          uploaded_at: doc.uploaded_at
        })),
        submitted_at: new Date().toISOString(),
        status: 'pending'
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock verification success
      setVerificationStatus('verified');
      verificationData.status = 'verified';
      verificationData.verified_at = new Date().toISOString();

      onVerificationComplete(verificationData);
      
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationStatus('rejected');
      alert('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return documents.length >= documentTypes.filter(d => d.required).length;
      case 2:
        return agreedToTerms;
      default:
        return false;
    }
  };

  const VerificationStep = ({ step, title, description, children, isComplete }: any) => (
    <div className={`border-l-4 pl-4 py-4 ${
      currentStep === step ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20' : 
      isComplete ? 'border-green-600 bg-green-50 dark:bg-green-900/20' : 
      'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === step ? 'bg-violet-600 text-white' :
          isComplete ? 'bg-green-600 text-white' :
          'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
        }`}>
          {isComplete ? <CheckCircle size={16} /> : step}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );

  if (verificationStatus === 'verified') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business Verified! ✓</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your business has been successfully verified. You can now create and manage your shop on BizGallery.
        </p>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            Your verification certificate is valid for 1 year. You'll need to renew it annually.
          </p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'rejected') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
        <XCircle size={64} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We couldn't verify your business. Please check your documents and try again.
        </p>
        <button
          onClick={() => {
            setVerificationStatus('pending');
            setCurrentStep(1);
            setDocuments([]);
            setAgreedToTerms(false);
          }}
          className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} className="text-violet-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Business Verification</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mandatory verification required to create your shop on BizGallery
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4 mb-8">
        <VerificationStep
          step={1}
          title="Upload Documents"
          description="Submit all required business documents"
          isComplete={isStepComplete(1)}
        >
          <div className="mt-4 space-y-4">
            {documentTypes.map((docType) => {
              const uploadedDoc = documents.find(d => d.type === docType.id);
              return (
                <div key={docType.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {docType.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {docType.name}
                        {docType.required && <span className="text-red-500 text-sm">*</span>}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{docType.description}</p>
                      
                      {uploadedDoc ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="text-sm text-green-800 dark:text-green-200">{uploadedDoc.name}</span>
                          </div>
                          <button
                            onClick={() => removeDocument(uploadedDoc.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="block">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, docType.id)}
                            className="hidden"
                          />
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-violet-500 transition-colors">
                            <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload {docType.name.toLowerCase()}</p>
                            <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </VerificationStep>

        <VerificationStep
          step={2}
          title="Terms & Conditions"
          description="Agree to BizGallery verification terms"
          isComplete={isStepComplete(2)}
        >
          <div className="mt-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Verification Terms:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• All documents must be authentic and valid</li>
                <li>• Business information must match the submitted documents</li>
                <li>• Verification is valid for 1 year from approval date</li>
                <li>• False information may result in permanent ban</li>
                <li>• BizGallery reserves the right to verify documents with authorities</li>
              </ul>
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded mt-1"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I agree to the verification terms and conditions. I confirm that all submitted documents are authentic and the business information provided is accurate.
              </span>
            </label>
          </div>
        </VerificationStep>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <AlertCircle size={16} className="inline mr-1" />
          Verification typically takes 24-48 hours
        </div>
        <button
          onClick={handleSubmit}
          disabled={!isStepComplete(1) || !isStepComplete(2) || isSubmitting}
          className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting for Verification...
            </>
          ) : (
            <>
              <Shield size={16} />
              Submit for Verification
            </>
          )}
        </button>
      </div>
    </div>
  );
}
