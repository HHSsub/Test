"use client";

import { HeroBoard as HeroBoardType } from "@/types/board";
import EditableText from "@/components/admin/EditableText";
import ImageUpload from "@/components/admin/ImageUpload";
import VideoUpload from "@/components/admin/VideoUpload";
import { useAdmin } from "@/contexts/AdminContext";
import { useState, useEffect } from "react";

interface Props {
  data: HeroBoardType;
}

export default function HeroBoard({ data }: Props) {
  const { addContentChange } = useAdmin();
  const [content, setContent] = useState(data.content);

  useEffect(() => {
    setContent(data.content);
  }, [data.content]);

  const handleTextChange = (field: keyof typeof content, value: string) => {
    const oldValue = content[field] as string;
    
    addContentChange({
      boardId: data.id,
      fieldPath: `content.${field}`,
      oldValue,
      newValue: value,
      type: 'text',
    });

    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (field: keyof typeof content, newUrl: string) => {
    const oldValue = content[field] as string;
    
    addContentChange({
      boardId: data.id,
      fieldPath: `content.${field}`,
      oldValue: oldValue || '',
      newValue: newUrl,
      type: 'image',
    });

    setContent((prev) => ({ ...prev, [field]: newUrl }));
  };

  const handleVideoChange = (field: keyof typeof content, newUrl: string) => {
    const oldValue = content[field] as string;
    
    addContentChange({
      boardId: data.id,
      fieldPath: `content.${field}`,
      oldValue: oldValue || '',
      newValue: newUrl,
      type: 'video',
    });

    setContent((prev) => ({ ...prev, [field]: newUrl }));
  };

  return (
    <section className="min-h-screen bg-brand-black flex items-center justify-center py-20 sm:py-0">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gradient leading-tight">
              <EditableText
                value={content.headline}
                onChange={(value) => handleTextChange("headline", value)}
                boardId={data.id}
                fieldPath="content.headline"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gradient leading-tight"
                multiline
              />
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300">
              <EditableText
                value={content.subheadline}
                onChange={(value) => handleTextChange("subheadline", value)}
                boardId={data.id}
                fieldPath="content.subheadline"
                className="text-lg sm:text-xl md:text-2xl text-gray-300"
                multiline
              />
            </p>
            {content.description && (
              <p className="text-base sm:text-lg text-gray-400">
                <EditableText
                  value={content.description}
                  onChange={(value) => handleTextChange("description", value)}
                  boardId={data.id}
                  fieldPath="content.description"
                  className="text-base sm:text-lg text-gray-400"
                  multiline
                />
              </p>
            )}
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 justify-center lg:justify-start">
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-brand-purple hover:bg-brand-purple/80 rounded-lg font-semibold transition-colors neon-glow-purple text-sm sm:text-base">
                <EditableText
                  value={content.primaryCta}
                  onChange={(value) => handleTextChange("primaryCta", value)}
                  boardId={data.id}
                  fieldPath="content.primaryCta"
                  className="font-semibold"
                />
              </button>
              {content.secondaryCta && (
                <button className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors text-sm sm:text-base">
                  <EditableText
                    value={content.secondaryCta}
                    onChange={(value) => handleTextChange("secondaryCta", value)}
                    boardId={data.id}
                    fieldPath="content.secondaryCta"
                    className="font-semibold"
                  />
                </button>
              )}
            </div>
          </div>

          {/* Right: Visual / Media Upload */}
          <div className="relative order-first lg:order-last">
            {content.mediaType === "video" ? (
              <VideoUpload
                currentVideo={content.mediaSrc}
                onVideoChange={(url) => handleVideoChange("mediaSrc", url)}
                boardId={data.id}
                fieldPath="content.mediaSrc"
                className="aspect-video rounded-lg overflow-hidden"
                placeholderText="영상 업로드"
              />
            ) : (
              <ImageUpload
                currentImage={content.mediaSrc}
                onImageChange={(url) => handleImageChange("mediaSrc", url)}
                boardId={data.id}
                fieldPath="content.mediaSrc"
                className="aspect-video rounded-lg overflow-hidden"
                placeholderText="이미지 업로드"
              />
            )}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
