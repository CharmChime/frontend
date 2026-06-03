import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'child' | 'parent';
  className?: string;
  padding?: 'small' | 'medium' | 'large';
}

export function Card({ 
  children, 
  variant = 'child', 
  className = '',
  padding = 'medium'
}: CardProps) {
  const variantClasses = {
    child: 'bg-[var(--child-card)] border-2 border-transparent',
    parent: 'bg-[var(--parent-card)] border border-gray-200',
  };

  const paddingClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  return (
    <div
      className={`
        ${variant === 'child' ? 'rounded-[1.5rem]' : 'rounded-xl'}
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        shadow-[0_4px_16px_rgba(0,0,0,0.06)]
        transition-shadow duration-200
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
