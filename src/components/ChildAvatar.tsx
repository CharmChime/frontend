import React from 'react';
import { getDiceBearAvatarUrl } from '../services/avatar';

interface ChildAvatarProps {
  avatar?: string;
  name: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  className?: string;
}

const sizeClasses = {
  small: 'w-10 h-10',
  medium: 'w-12 h-12',
  large: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export function ChildAvatar({ avatar, name, size = 'medium', className = '' }: ChildAvatarProps) {
  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full bg-gradient-to-br from-[var(--child-yellow)] via-white to-[var(--child-mint)]
        p-1 shadow-md ring-2 ring-white overflow-hidden flex-shrink-0
        ${className}
      `}
    >
      <img
        src={getDiceBearAvatarUrl(avatar, name)}
        alt={`${name}'s avatar`}
        className="h-full w-full rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
