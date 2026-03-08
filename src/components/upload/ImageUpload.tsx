"use client";
import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  className?: string;
}

export default function ImageUpload({ 
  onImageSelect, 
  currentImage, 
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = ''
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`);
      return false;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    // Additional validation for business images
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        // Check image dimensions (minimum 300x300 for business images)
        if (img.width < 300 || img.height < 300) {
          setError('Image must be at least 300x300 pixels');
          return false;
        }
        
        // Check aspect ratio (should be reasonable for business images)
        const aspectRatio = img.width / img.height;
        if (aspectRatio > 4 || aspectRatio < 0.25) {
          setError('Image aspect ratio is too extreme. Please use a more standard image.');
          return false;
        }
      };
      img.src = URL.createObjectURL(file);
    }

    return true;
  };

  const processFile = (file: File) => {
    setError('');
    
    if (!validateFile(file)) {
      return;
    }

    setUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      
      // Simulate upload delay (in real app, this would upload to server)
      setTimeout(() => {
        onImageSelect(result);
        setUploading(false);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const removeImage = () => {
    setPreview('');
    onImageSelect('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          dragActive
            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
            : error
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X size={16} />
            </button>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Uploading...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              {uploading ? (
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ImageIcon size={48} className="text-gray-400" />
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                {uploading ? 'Processing image...' : 'Drop image here or click to browse'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Max size: {maxSizeMB}MB • Formats: {allowedTypes.map(type => type.split('/')[1]).join(', ')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Minimum resolution: 300x300px
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept={allowedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              <Upload size={16} className="inline mr-2" />
              Choose Image
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle size={16} className="text-red-600" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {preview && !error && !uploading && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle size={16} className="text-green-600" />
          <p className="text-sm text-green-600 dark:text-green-400">Image uploaded successfully</p>
        </div>
      )}
    </div>
  );
}
