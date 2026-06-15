import React from 'react';
import { Users } from 'lucide-react';
import type { Child } from '../services/api';

interface ParentChildSelectorProps {
  childrenList: Child[];
  selectedChildId: string;
  onChange: (childId: string) => void;
  isLoading?: boolean;
}

export function ParentChildSelector({
  childrenList,
  selectedChildId,
  onChange,
  isLoading = false,
}: ParentChildSelectorProps) {
  if (isLoading || childrenList.length <= 1) {
    return null;
  }

  return (
    <label className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-[#334155]">
      <Users className="h-4 w-4 text-[var(--parent-teal)]" />
      <span className="hidden sm:inline">Child</span>
      <select
        value={selectedChildId}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-[#2d3748] outline-none"
      >
        {childrenList.map((child) => (
          <option key={child.id} value={child.id}>
            {child.nickname || child.name}
          </option>
        ))}
      </select>
    </label>
  );
}
