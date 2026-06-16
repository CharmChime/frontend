import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'child-blue' | 'child-yellow' | 'child-mint' | 'child-peach' | 'child-lavender' | 'child-slate' | 'parent-teal' | 'parent-slate';
  size?: 'small' | 'medium' | 'large';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Button({ 
  children, 
  variant = 'child-blue', 
  size = 'medium', 
  onClick, 
  icon,
  className = '',
  disabled = false
}: ButtonProps) {
  const variantClasses = {
    'child-blue': 'bg-[#7ab8e8] hover:bg-[#5a9fd4] text-[#1a365d]',
    'child-yellow': 'bg-[#ffd670] hover:bg-[#ffc940] text-[#744210]',
    'child-mint': 'bg-[#8ce8b5] hover:bg-[#6dd89b] text-[#065f46]',
    'child-peach': 'bg-[#ffbfa8] hover:bg-[#ff9f7f] text-[#7c2d12]',
    'child-lavender': 'bg-[#d1bff0] hover:bg-[#b8a0e0] text-[#5b21b6]',
    'child-slate': 'bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#334155]',
    'parent-teal': 'bg-[var(--parent-teal)] hover:bg-[var(--parent-teal-dark)] text-white',
    'parent-slate': 'bg-[var(--parent-slate)] hover:bg-[var(--parent-slate-light)] text-white',
  };

  const sizeClasses = {
    small: 'px-4 sm:px-5 py-2 gap-2 text-sm sm:text-base',
    medium: 'px-5 sm:px-7 py-2.5 sm:py-3 gap-2 sm:gap-2.5 text-sm sm:text-base',
    large: 'px-7 sm:px-9 py-3 sm:py-4 gap-2.5 sm:gap-3 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        rounded-full
        transition-all duration-200
        shadow-[0_4px_16px_rgba(0,0,0,0.08)]
        hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]
        hover:scale-105
        active:scale-100
        disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
