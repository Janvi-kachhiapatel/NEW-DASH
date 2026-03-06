"use client";
import { useState, useRef } from 'react';
import { Upload, X, Wand2, Play, Download, Sparkles, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface GeneratedReel {
  id: string;
  video_url: string;
  thumbnail_url: string;
  prompt_used: string;
  generation_time: number;
  cost_credits: number;
}

interface ReelGeneratorProps {
  businessId: string;
  onReelGenerated?: (reel: GeneratedReel) => void;
  className?: string;
}

export default function ReelGenerator({ businessId, onReelGenerated, className = '' }: ReelGeneratorProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedReel, setGeneratedReel] = useState<GeneratedReel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI prompt templates
  const promptTemplates = [
    "Create a vibrant promotional video showcasing our products with dynamic transitions and upbeat music",
    "Generate a cinematic business tour with smooth camera movements and professional narration",
    "Make a trendy social media video with quick cuts, text overlays, and popular background music",
    "Create an elegant brand story video with emotional visuals and inspiring background music",
    "Generate a high-energy product showcase with bold text animations and exciting effects"
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      file.type.startsWith('video/')
    );

    if (validFiles.length !== files.length) {
      setError('Only image and video files are allowed');
      return;
    }

    if (uploadedFiles.length + validFiles.length > 10) {
      setError('Maximum 10 files allowed');
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePromptTemplate = (template: string) => {
    setPrompt(template);
  };

  const generateReel = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt or select a template');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 1000);

      // Upload files
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('business_id', businessId);
      formData.append('prompt', prompt);

      // TODO: Replace with actual API call
      const response = await fetch('/api/ai/generate-reel', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to generate reel');
      }

      const result = await response.json();
      
      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Simulate API response
      const mockReel: GeneratedReel = {
        id: result.id || 'mock-' + Date.now(),
        video_url: result.video_url || '/api/placeholder/400/800',
        thumbnail_url: result.thumbnail_url || '/api/placeholder/400/800',
        prompt_used: prompt,
        generation_time: result.generation_time || 45,
        cost_credits: result.cost_credits || 10
      };

      setGeneratedReel(mockReel);
      onReelGenerated?.(mockReel);

    } catch (error) {
      console.error('Generation failed:', error);
      setError('Failed to generate reel. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const downloadReel = () => {
    if (generatedReel) {
      const link = document.createElement('a');
      link.href = generatedReel.video_url;
      link.download = `reel-${generatedReel.id}.mp4`;
      link.click();
    }
  };

  const resetGenerator = () => {
    setUploadedFiles([]);
    setPrompt('');
    setGeneratedReel(null);
    setError(null);
    setGenerationProgress(0);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Wand2 size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Reel Generator</h2>
            <p className="text-gray-600 dark:text-gray-400">Create stunning promotional videos instantly</p>
          </div>
        </div>
        {generatedReel && (
          <button
            onClick={resetGenerator}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      {!generatedReel ? (
        <>
          {/* File Upload Area */}
          <div className="mb-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Upload Media Files
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload images and videos to include in your reel
              </p>
              <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Choose Files
              </button>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Describe your reel
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the type of video you want to create..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              rows={4}
            />
            
            {/* Prompt Templates */}
            <div className="mt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick templates:</p>
              <div className="flex flex-wrap gap-2">
                {promptTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptTemplate(template)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                  >
                    {template.split(' ')[0]} {template.split(' ')[1]}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generation Info */}
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                AI Generation Details
              </span>
            </div>
            <div className="space-y-1 text-sm text-purple-700 dark:text-purple-400">
              <p>• Estimated time: 30-60 seconds</p>
              <p>• Cost: 10 credits per reel</p>
              <p>• Output: 1080x1920 vertical video</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateReel}
            disabled={isGenerating || uploadedFiles.length === 0}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating... {Math.round(generationProgress)}%
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generate Reel
              </>
            )}
          </button>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                AI is creating your masterpiece...
              </p>
            </div>
          )}
        </>
      ) : (
        /* Success State */
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Reel Generated Successfully!
          </h3>
          
          {/* Video Preview */}
          <div className="mb-6 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
            <video
              src={generatedReel.video_url}
              poster={generatedReel.thumbnail_url}
              className="w-full max-w-md mx-auto"
              controls
            />
          </div>

          {/* Generation Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <Clock size={20} className="text-gray-600 dark:text-gray-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {generatedReel.generation_time}s
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Generation Time</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <Sparkles size={20} className="text-gray-600 dark:text-gray-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {generatedReel.cost_credits}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Credits Used</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <Play size={20} className="text-gray-600 dark:text-gray-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">HD</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Quality</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={downloadReel}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download
            </button>
            <button
              onClick={() => {
                // TODO: Post reel to business profile
                console.log('Posting reel:', generatedReel);
              }}
              className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Post Reel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
