"use client";
import { useState, useRef } from 'react';
import { Video, Upload, X, Play, Pause, Camera, Mic, MicOff, VideoOff } from 'lucide-react';

interface ReelCreationProps {
  businessId: string;
  businessName: string;
  onReelCreated?: (reel: any) => void;
  onClose?: () => void;
}

export default function ReelCreation({ 
  businessId, 
  businessName, 
  onReelCreated, 
  onClose 
}: ReelCreationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: cameraEnabled, 
        audio: !isMuted 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideo(videoUrl);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Update duration
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          setDuration(Math.floor((Date.now() - startTime) / 1000));
        } else {
          clearInterval(interval);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  };

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !cameraEnabled;
      });
    }
  };

  const uploadVideo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setRecordedVideo(videoUrl);
    }
  };

  const saveReel = async () => {
    if (!recordedVideo || !caption.trim()) {
      alert('Please add a caption for your reel.');
      return;
    }

    try {
      // In a real app, upload to server/cloud storage
      const reelData = {
        business_id: businessId,
        business_name: businessName,
        video_url: recordedVideo,
        thumbnail_url: '/api/placeholder/400/700', // Would be generated from video
        caption: caption.trim(),
        duration_seconds: duration,
        likes_count: 0,
        comments_count: 0,
        views_count: 0,
        created_at: new Date().toISOString()
      };

      // Mock API call
      console.log('Reel created:', reelData);
      
      onReelCreated?.(reelData);
      onClose?.();
      
    } catch (error) {
      console.error('Error saving reel:', error);
      alert('Failed to save reel. Please try again.');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Create Reel for {businessName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Video Preview */}
          <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden mb-4">
            {!recordedVideo ? (
              <video
                ref={videoRef}
                autoPlay
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={recordedVideo}
                controls
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Recording Overlay */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">
                  {isPaused ? 'PAUSED' : 'REC'} {formatDuration(duration)}
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          {!recordedVideo ? (
            <div className="space-y-4">
              {/* Recording Controls */}
              <div className="flex items-center justify-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <Video size={24} className="text-white" />
                  </button>
                ) : (
                  <>
                    {!isPaused ? (
                      <button
                        onClick={pauseRecording}
                        className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors"
                      >
                        <Pause size={24} className="text-white" />
                      </button>
                    ) : (
                      <button
                        onClick={resumeRecording}
                        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                      >
                        <Play size={24} className="text-white" />
                      </button>
                    )}
                    <button
                      onClick={stopRecording}
                      className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X size={24} className="text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Audio/Video Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-lg transition-colors ${
                    isMuted ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button
                  onClick={toggleCamera}
                  className={`p-3 rounded-lg transition-colors ${
                    !cameraEnabled ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {cameraEnabled ? <VideoOn size={20} /> : <VideoOff size={20} />}
                </button>
              </div>

              {/* Upload Option */}
              <div className="text-center">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Upload size={16} />
                  <span>Upload Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={uploadVideo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Caption Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption for your reel..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setRecordedVideo(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Retake
                </button>
                <button
                  onClick={saveReel}
                  className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Post Reel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
