"use client";

import { ProblemSolutionBoard as ProblemSolutionBoardType } from "@/types/board";
import EditableText from "@/components/admin/EditableText";
import ImageUpload from "@/components/admin/ImageUpload";
import { useAdmin } from "@/contexts/AdminContext";
import { useState, useEffect } from "react";

interface Props {
  data: ProblemSolutionBoardType;
}

export default function ProblemSolutionBoard({ data }: Props) {
  const { addContentChange } = useAdmin();
  const [content, setContent] = useState(data.content);

  useEffect(() => {
    setContent(data.content);
  }, [data.content]);

  const handleChange = (field: keyof typeof content, value: string) => {
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

  const handleCardTextChange = (index: number, field: 'title' | 'description', value: string) => {
    const oldValue = content.cards[index][field];
    
    addContentChange({
      boardId: data.id,
      fieldPath: `content.cards[${index}].${field}`,
      oldValue,
      newValue: value,
      type: 'text',
    });

    setContent((prev) => {
      const newCards = [...prev.cards];
      newCards[index] = { ...newCards[index], [field]: value };
      return { ...prev, cards: newCards };
    });
  };

  const handleCardImageChange = (index: number, newUrl: string) => {
    const oldValue = content.cards[index].image || '';
    
    addContentChange({
      boardId: data.id,
      fieldPath: `content.cards[${index}].image`,
      oldValue,
      newValue: newUrl,
      type: 'image',
    });

    setContent((prev) => {
      const newCards = [...prev.cards];
      newCards[index] = { ...newCards[index], image: newUrl };
      return { ...prev, cards: newCards };
    });
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-brand-black">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            <EditableText
              value={content.title}
              onChange={(value) => handleChange("title", value)}
              boardId={data.id}
              fieldPath="content.title"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white"
              multiline
            />
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400">
            <EditableText
              value={content.subtitle}
              onChange={(value) => handleChange("subtitle", value)}
              boardId={data.id}
              fieldPath="content.subtitle"
              className="text-base sm:text-lg md:text-xl text-gray-400"
            />
          </p>
        </div>

        {/* Solution Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {content.cards.map((card, index) => (
            <div key={index} className="bg-brand-midgray rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4 hover:bg-brand-midgray/80 transition-colors">
              {/* Image Upload */}
              <ImageUpload
                currentImage={card.image}
                onImageChange={(url) => handleCardImageChange(index, url)}
                boardId={data.id}
                fieldPath={`content.cards[${index}].image`}
                className="aspect-square rounded overflow-hidden"
                placeholderText="이미지 업로드"
              />
              
              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-white">
                <EditableText
                  value={card.title}
                  onChange={(value) => handleCardTextChange(index, "title", value)}
                  boardId={data.id}
                  fieldPath={`content.cards[${index}].title`}
                  className="text-lg sm:text-xl font-bold text-white"
                />
              </h3>
              
              {/* Description */}
              <p className="text-gray-400 text-xs sm:text-sm">
                <EditableText
                  value={card.description}
                  onChange={(value) => handleCardTextChange(index, "description", value)}
                  boardId={data.id}
                  fieldPath={`content.cards[${index}].description`}
                  className="text-gray-400 text-xs sm:text-sm"
                  multiline
                />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}