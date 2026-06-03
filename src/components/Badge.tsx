import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'child-blue' | 'child-yellow' | 'child-mint' | 'child-peach' | 'child-lavender' | 'parent-teal' | 'parent-slate';
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'child-blue', 
  icon,
  className = '' 
}: BadgeProps) {
  const variantClasses = {
    'child-blue': 'bg-[var(--child-blue)] text-[#1a365d]',
    'child-yellow': 'bg-[var(--child-yellow)] text-[#744210]',
    'child-mint': 'bg-[var(--child-mint)] text-[#065f46]',
    'child-peach': 'bg-[var(--child-peach)] text-[#7c2d12]',
    'child-lavender': 'bg-[var(--child-lavender)] text-[#5b21b6]',
    'parent-teal': 'bg-[var(--parent-teal)]/10 text-[var(--parent-teal-dark)] border border-[var(--parent-teal)]/20',
    'parent-slate': 'bg-[var(--parent-slate)]/10 text-[var(--parent-slate)] border border-[var(--parent-slate)]/20',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1.5
        rounded-full
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="text-sm">{children}</span>
    </div>
  );
}
