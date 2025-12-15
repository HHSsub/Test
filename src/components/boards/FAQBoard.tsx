"use client";

import { FAQBoard as FAQBoardType } from "@/types/board";
import EditableText from "@/components/admin/EditableText";
import { useAdmin } from "@/contexts/AdminContext";
import { useState, useEffect } from "react";

interface Props {
  data: FAQBoardType;
}

export default function FAQBoard({ data }: Props) {
  const { addContentChange } = useAdmin();
  const [content, setContent] = useState(data.content);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  const handleItemChange = (index: number, field: 'question' | 'answer', value: string) => {
    const oldValue = content.items[index][field];
    
    addContentChange({
      boardId: data.id,
      fieldPath: `content.items[${index}].${field}`,
      oldValue,
      newValue: value,
      type: 'text',
    });

    setContent((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-brand-black">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
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

        {/* FAQ Items */}
        <div className="space-y-3 sm:space-y-4">
          {content.items.map((item, index) => (
            <div key={index} className="bg-brand-midgray rounded-lg p-4 sm:p-6">
              {/* Question */}
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-base sm:text-lg font-semibold text-white pr-4">
                  <EditableText
                    value={item.question}
                    onChange={(value) => handleItemChange(index, "question", value)}
                    boardId={data.id}
                    fieldPath={`content.items[${index}].question`}
                    className="text-base sm:text-lg font-semibold text-white"
                  />
                </h3>
                <span className="text-brand-purple text-2xl flex-shrink-0">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              
              {/* Answer */}
              {openIndex === index && (
                <p className="mt-4 text-gray-400 leading-relaxed">
                  <EditableText
                    value={item.answer}
                    onChange={(value) => handleItemChange(index, "answer", value)}
                    boardId={data.id}
                    fieldPath={`content.items[${index}].answer`}
                    className="text-gray-400 leading-relaxed"
                    multiline
                  />
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
