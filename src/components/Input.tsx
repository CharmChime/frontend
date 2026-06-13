import React from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  variant?: 'child' | 'parent';
  icon?: React.ReactNode;
  maxLength?: number;
}

export function Input({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = 'text',
  variant = 'child',
  icon,
  maxLength,
}: InputProps) {
  const variantClasses = {
    child: 'border-2 border-[var(--child-blue)] focus:border-[var(--child-blue-dark)] bg-white',
    parent: 'border border-gray-300 focus:border-[var(--parent-teal)] bg-white',
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`
            w-full
            ${variant === 'child' ? 'rounded-full' : 'rounded-xl'}
            ${icon ? 'pl-12 pr-4' : 'px-4'}
            py-3
            transition-all duration-200
            focus:outline-none
            focus:ring-4
            ${variant === 'child' ? 'focus:ring-[var(--child-blue)]/20' : 'focus:ring-[var(--parent-teal)]/20'}
            ${variantClasses[variant]}
          `}
        />
      </div>
    </div>
  );
}
