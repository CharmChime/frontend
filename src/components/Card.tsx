import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'child' | 'parent';
  padding?: 'small' | 'medium' | 'large';
}

export function Card({ 
  children, 
  variant = 'child', 
  className = '',
  padding = 'medium',
  onClick,
  onKeyDown,
  tabIndex,
  role,
  ...props
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

  const isInteractive = Boolean(onClick);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented || !onClick) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(event as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={role || (isInteractive ? 'button' : undefined)}
      tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
      className={`
        ${variant === 'child' ? 'rounded-[1.5rem]' : 'rounded-xl'}
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        shadow-[0_4px_16px_rgba(0,0,0,0.06)]
        transition-shadow duration-200
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
