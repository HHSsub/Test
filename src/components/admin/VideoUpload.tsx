"use client";

import { useState, useRef } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { generateLogicalKey } from "@/lib/mediaMapping";

interface Props {
  currentVideo?: string;
  onVideoChange: (newUrl: string) => void;
  boardId: string;
  fieldPath: string;
  className?: string;
  placeholderText?: string;
}

export default function VideoUpload({
  currentVideo,
  onVideoChange,
  boardId,
  fieldPath,
  className = "",
  placeholderText = "영상을 업로드하세요",
}: Props) {
  const { isAdmin, isPreviewMode } = useAdmin();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isAdmin || isPreviewMode) {
    // Non-admin or preview mode: Show current video or placeholder
    if (currentVideo) {
      return (
        <div className={`relative ${className}`}>
          <video
            src={currentVideo}
            controls
            className="w-full h-full object-cover rounded-lg"
          >
            <source src={currentVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded-lg ${className}`}>
        <span className="text-gray-600 text-sm">{placeholderText}</span>
      </div>
    );
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      // Auto-play preview video
      if (videoRef.current) {
        videoRef.current.load();
      }
    };
    reader.readAsDataURL(file);

    try {
      // Generate logical key: <boardId>_<fieldPath>
      const logicalKey = generateLogicalKey(boardId, fieldPath);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('logicalKey', logicalKey);
      formData.append('boardId', boardId);
      formData.append('fieldPath', fieldPath);

      // Upload to new API endpoint
      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      setIsUploading(false);

      if (result.success && result.url) {
        // result.url is CDN URL: /media/videos/<logical_key>?v=<timestamp>
        onVideoChange(result.url);
        setPreviewUrl(null);
      } else {
        setError(result.error || '업로드 실패');
        setPreviewUrl(null);
      }
    } catch (err) {
      setIsUploading(false);
      setError('업로드 중 오류가 발생했습니다.');
      setPreviewUrl(null);
      console.error('Upload error:', err);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayVideo = previewUrl || currentVideo;

  return (
    <div className={`relative group ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {displayVideo ? (
        // Video exists: show video + change button
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            src={displayVideo}
            controls
            className="w-full h-full object-cover rounded-lg"
          >
            <source src={displayVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Change video button - appears on hover */}
          <button
            onClick={handleClick}
            className="absolute top-4 right-4 bg-brand-purple/90 hover:bg-brand-purple text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity neon-glow-purple"
          >
            영상 변경
          </button>
        </div>
      ) : (
        // No video: show upload area
        <div
          onClick={handleClick}
          className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer transition-all bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 hover:from-brand-purple/20 hover:to-brand-blue/20"
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-2 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-gray-600 text-sm">{placeholderText}</span>
            </div>
          </div>
        </div>
      )}

      {/* Upload status */}
      {isUploading && (
        <div className="absolute top-2 left-2 bg-brand-blue text-white px-3 py-1 rounded-full text-xs neon-glow-blue">
          업로드 중...
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-500 text-white px-3 py-2 rounded text-xs">
          {error}
        </div>
      )}
    </div>
  );
}