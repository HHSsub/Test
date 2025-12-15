"use client";

import { WorkflowBoard as WorkflowBoardType } from "@/types/board";
import EditableText from "@/components/admin/EditableText";
import { useAdmin } from "@/contexts/AdminContext";
import { useState, useEffect } from "react";

interface Props {
  data: WorkflowBoardType;
}

export default function WorkflowBoard({ data }: Props) {
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

  const handleStepChange = (index: number, field: 'title' | 'description', value: string) => {
    const oldValue = content.steps[index][field];
    
    addContentChange({
      boardId: data.id,
      fieldPath: `content.steps[${index}].${field}`,
      oldValue,
      newValue: value,
      type: 'text',
    });

    setContent((prev) => {
      const newSteps = [...prev.steps];
      newSteps[index] = { ...newSteps[index], [field]: value };
      return { ...prev, steps: newSteps };
    });
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-brand-darkgray">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
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
                value={content.description}
                onChange={(value) => handleChange("description", value)}
                boardId={data.id}
                fieldPath="content.description"
                className="text-base sm:text-lg md:text-xl text-gray-400"
              />
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {content.steps.map((step, index) => (
            <div key={index} className="text-center space-y-3 sm:space-y-4">
              {/* Icon */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-brand-purple/20 rounded-full mx-auto flex items-center justify-center text-4xl sm:text-5xl">
                {step.icon}
              </div>
              
              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                <EditableText
                  value={step.title}
                  onChange={(value) => handleStepChange(index, "title", value)}
                  boardId={data.id}
                  fieldPath={`content.steps[${index}].title`}
                  className="text-xl sm:text-2xl font-bold text-white"
                />
              </h3>
              
              {/* Description */}
              <p className="text-sm sm:text-base text-gray-400">
                <EditableText
                  value={step.description}
                  onChange={(value) => handleStepChange(index, "description", value)}
                  boardId={data.id}
                  fieldPath={`content.steps[${index}].description`}
                  className="text-sm sm:text-base text-gray-400"
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
