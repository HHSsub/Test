"use client";

import { ProblemSolutionBoard as ProblemSolutionBoardType } from "@/types/board";
import EditableText from "@/components/admin/EditableText";
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
              {/* Image Placeholder */}
              <div className="aspect-square bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded flex items-center justify-center">
                <span className="text-gray-600 text-sm">Image</span>
              </div>
              
              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {card.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-400 text-xs sm:text-sm">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
