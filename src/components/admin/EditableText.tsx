"use client";

import { useState, useRef, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";

interface Props {
  value: string;
  onChange: (newValue: string) => void;
  boardId: string;
  fieldPath: string;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

export default function EditableText({
  value,
  onChange,
  boardId,
  fieldPath,
  className = "",
  multiline = false,
  placeholder = "텍스트를 입력하세요",
}: Props) {
  const { isAdmin, isPreviewMode, editingField, setEditingField } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const fullFieldPath = `${boardId}.${fieldPath}`;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // 커서를 텍스트 끝으로 이동
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleClick = () => {
    if (isAdmin && !isPreviewMode && !isEditing) {
      setIsEditing(true);
      setEditingField(fullFieldPath);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    setEditingField(null);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  // Admin 모드가 아니거나 미리보기 모드면 일반 텍스트만 표시
  if (!isAdmin || isPreviewMode) {
    return <span className={className}>{value}</span>;
  }

  // 편집 모드
  if (isEditing) {
    const commonProps = {
      ref: inputRef as any,
      value: localValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setLocalValue(e.target.value),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      placeholder,
      className: `${className} bg-brand-black/80 border-2 border-brand-blue rounded px-2 py-1 outline-none neon-glow-blue`,
    };

    if (multiline) {
      return (
        <textarea
          {...commonProps}
          rows={3}
          className={`${commonProps.className} resize-none w-full`}
        />
      );
    }

    return <input type="text" {...commonProps} className={`${commonProps.className} w-full`} />;
  }

  // 표시 모드 (admin이고 편집 중이 아닐 때)
  const isCurrentlyEditing = editingField === fullFieldPath;
  return (
    <span
      onClick={handleClick}
      className={`${className} cursor-pointer hover:bg-brand-purple/10 hover:border-brand-purple border-2 transition-all inline-block ${
        isCurrentlyEditing
          ? 'border-brand-blue bg-brand-blue/10 neon-glow-blue'
          : 'border-transparent'
      } rounded px-2 py-1`}
      title="클릭하여 편집"
    >
      {value || placeholder}
    </span>
  );
}
