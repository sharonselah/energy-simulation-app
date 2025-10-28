'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  description?: string;
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
}

export default function CollapsibleSection({
  title,
  children,
  description,
  defaultOpen = false,
  className = '',
  contentClassName = '',
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left"
        aria-expanded={isOpen}
      >
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className={`px-4 pb-4 text-gray-700 text-sm ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
}

