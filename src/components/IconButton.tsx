import React from 'react';

interface IconButtonProps {
  children: React.ReactNode;
  variant?: 'child-blue' | 'child-yellow' | 'child-mint' | 'child-peach' | 'child-lavender' | 'parent-teal' | 'parent-slate';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  className?: string;
}

export function IconButton({ 
  children, 
  variant = 'child-blue', 
  size = 'medium', 
  onClick,
  className = '' 
}: IconButtonProps) {
  const variantClasses = {
    'child-blue': 'bg-[var(--child-blue)] hover:bg-[var(--child-blue-dark)] text-[#1a365d]',
    'child-yellow': 'bg-[var(--child-yellow)] hover:bg-[var(--child-yellow-dark)] text-[#744210]',
    'child-mint': 'bg-[var(--child-mint)] hover:bg-[var(--child-mint-dark)] text-[#065f46]',
    'child-peach': 'bg-[var(--child-peach)] hover:bg-[#ffbfa8] text-[#7c2d12]',
    'child-lavender': 'bg-[var(--child-lavender)] hover:bg-[#d1bff0] text-[#5b21b6]',
    'parent-teal': 'bg-[var(--parent-teal)] hover:bg-[var(--parent-teal-dark)] text-white',
    'parent-slate': 'bg-[var(--parent-slate)] hover:bg-[var(--parent-slate-light)] text-white',
  };

  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        rounded-full
        transition-all duration-200
        shadow-[0_4px_16px_rgba(0,0,0,0.06)]
        hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]
        hover:scale-110
        active:scale-100
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
