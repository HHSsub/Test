"use client";

import { PricingBoard as PricingBoardType } from "@/types/board";
import EditableText from "@/components/admin/EditableText";
import { useAdmin } from "@/contexts/AdminContext";
import { useState, useEffect } from "react";

interface Props {
  data: PricingBoardType;
}

export default function PricingBoard({ data }: Props) {
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
    <section className="py-12 sm:py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            <EditableText
              value={content.title}
              onChange={(value) => handleChange("title", value)}
              boardId={data.id}
              fieldPath="content.title"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900"
              multiline
            />
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            <EditableText
              value={content.subtitle}
              onChange={(value) => handleChange("subtitle", value)}
              boardId={data.id}
              fieldPath="content.subtitle"
              className="text-base sm:text-lg md:text-xl text-gray-600"
            />
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {content.plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-6 sm:p-8 space-y-4 sm:space-y-6 ${
                plan.highlighted
                  ? 'bg-brand-black text-white border-2 border-brand-purple shadow-2xl md:scale-105' 
                  : 'bg-gray-50 text-gray-900'
              }`}
            >
              {/* Plan Name */}
              <h3 className={`text-xl sm:text-2xl font-bold ${plan.highlighted ? 'text-brand-purple' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              
              {/* Price */}
              <div className="text-2xl sm:text-3xl font-bold">
                {plan.price}
              </div>
              
              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start">
                    <span className={`mr-2 ${plan.highlighted ? 'text-brand-purple' : 'text-brand-blue'}`}>✓</span>
                    <span className={plan.highlighted ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA */}
              <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                plan.highlighted 
                  ? 'bg-brand-purple hover:bg-brand-purple/80 text-white neon-glow-purple' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
