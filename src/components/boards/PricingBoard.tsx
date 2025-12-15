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

  const handlePlanChange = (index: number, field: 'name' | 'price' | 'cta', value: string) => {
    const oldValue = content.plans[index][field];
    
    addContentChange({
      boardId: data.id,
      fieldPath: `content.plans[${index}].${field}`,
      oldValue,
      newValue: value,
      type: 'text',
    });

    setContent((prev) => {
      const newPlans = [...prev.plans];
      newPlans[index] = { ...newPlans[index], [field]: value };
      return { ...prev, plans: newPlans };
    });
  };

  const handleFeatureChange = (planIndex: number, featureIndex: number, value: string) => {
    const oldValue = content.plans[planIndex].features[featureIndex];
    
    addContentChange({
      boardId: data.id,
      fieldPath: `content.plans[${planIndex}].features[${featureIndex}]`,
      oldValue,
      newValue: value,
      type: 'text',
    });

    setContent((prev) => {
      const newPlans = [...prev.plans];
      const newFeatures = [...newPlans[planIndex].features];
      newFeatures[featureIndex] = value;
      newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures };
      return { ...prev, plans: newPlans };
    });
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-brand-darkgray">
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {content.plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-6 sm:p-8 space-y-4 sm:space-y-6 ${
                plan.highlighted
                  ? 'bg-brand-black text-white border-2 border-brand-purple shadow-2xl md:scale-105' 
                  : 'bg-brand-midgray text-white'
              }`}
            >
              {/* Plan Name */}
              <h3 className={`text-xl sm:text-2xl font-bold ${plan.highlighted ? 'text-brand-purple' : 'text-white'}`}>
                <EditableText
                  value={plan.name}
                  onChange={(value) => handlePlanChange(index, "name", value)}
                  boardId={data.id}
                  fieldPath={`content.plans[${index}].name`}
                  className={`text-xl sm:text-2xl font-bold ${plan.highlighted ? 'text-brand-purple' : 'text-white'}`}
                />
              </h3>
              
              {/* Price */}
              <div className={`text-2xl sm:text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-white'}`}>
                <EditableText
                  value={plan.price}
                  onChange={(value) => handlePlanChange(index, "price", value)}
                  boardId={data.id}
                  fieldPath={`content.plans[${index}].price`}
                  className={`text-2xl sm:text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-white'}`}
                />
              </div>
              
              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start">
                    <span className={`mr-2 ${plan.highlighted ? 'text-brand-purple' : 'text-brand-blue'}`}>✓</span>
                    <span className={plan.highlighted ? 'text-gray-300' : 'text-gray-300'}>
                      <EditableText
                        value={feature}
                        onChange={(value) => handleFeatureChange(index, fIndex, value)}
                        boardId={data.id}
                        fieldPath={`content.plans[${index}].features[${fIndex}]`}
                        className={plan.highlighted ? 'text-gray-300' : 'text-gray-300'}
                      />
                    </span>
                  </li>
                ))}
              </ul>
              
              {/* CTA */}
              <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                plan.highlighted 
                  ? 'bg-brand-purple hover:bg-brand-purple/80 text-white neon-glow-purple' 
                  : 'bg-brand-purple/80 hover:bg-brand-purple text-white'
              }`}>
                <EditableText
                  value={plan.cta}
                  onChange={(value) => handlePlanChange(index, "cta", value)}
                  boardId={data.id}
                  fieldPath={`content.plans[${index}].cta`}
                  className="font-semibold"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
