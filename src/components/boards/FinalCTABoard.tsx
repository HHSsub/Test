"use client";

import { FinalCTABoard as FinalCTABoardType } from "@/types/board";
import EditableText from "@/components/admin/EditableText";
import ImageUpload from "@/components/admin/ImageUpload";
import VideoUpload from "@/components/admin/VideoUpload";
import { useAdmin } from "@/contexts/AdminContext";
import { useState, useEffect } from "react";

interface Props {
  data: FinalCTABoardType;
}

export default function FinalCTABoard({ data }: Props) {
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
    <section className="py-12 sm:py-16 md:py-24 bg-brand-darkgray">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gradient leading-tight">
            <EditableText
              value={content.title}
              onChange={(value) => handleTextChange("title", value)}
              boardId={data.id}
              fieldPath="content.title"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gradient leading-tight"
              multiline
            />
          </h2>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300">
            <EditableText
              value={content.subtitle}
              onChange={(value) => handleTextChange("subtitle", value)}
              boardId={data.id}
              fieldPath="content.subtitle"
              className="text-lg sm:text-xl md:text-2xl text-gray-300"
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
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4 sm:pt-8">
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
              <button className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors">
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
      </div>
    </section>
  );
}
