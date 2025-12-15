"use client";

import { BenefitsBoard as BenefitsBoardType } from "@/types/board";
import EditableText from "@/components/admin/EditableText";
import { useAdmin } from "@/contexts/AdminContext";
import { useState, useEffect } from "react";

interface Props {
  data: BenefitsBoardType;
}

export default function BenefitsBoard({ data }: Props) {
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

  const handleCardChange = (index: number, field: 'title' | 'description', value: string) => {
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

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-brand-darkgray">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            <EditableText
              value={content.title}
              onChange={(value) => handleChange("title", value)}
              boardId={data.id}
              fieldPath="content.title"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white"
              multiline
            />
          </h2>
        </div>

        {/* Benefit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {content.cards.map((card, index) => (
            <div key={index} className="text-center space-y-3 sm:space-y-4">
              {/* Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-blue/20 rounded-lg mx-auto flex items-center justify-center text-3xl sm:text-4xl">
                {card.icon}
              </div>
              
              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-white">
                <EditableText
                  value={card.title}
                  onChange={(value) => handleCardChange(index, "title", value)}
                  boardId={data.id}
                  fieldPath={`content.cards[${index}].title`}
                  className="text-lg sm:text-xl font-bold text-white"
                />
              </h3>
              
              {/* Description */}
              <p className="text-gray-400 text-sm">
                <EditableText
                  value={card.description}
                  onChange={(value) => handleCardChange(index, "description", value)}
                  boardId={data.id}
                  fieldPath={`content.cards[${index}].description`}
                  className="text-gray-400 text-sm"
                  multiline
                />
              </p>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
