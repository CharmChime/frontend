import React from 'react';
import { Button } from './Button';
import { LogOut, X } from 'lucide-react';

interface LogoutConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'child' | 'parent';
}

export function LogoutConfirmation({ isOpen, onConfirm, onCancel, variant = 'child' }: LogoutConfirmationProps) {
  if (!isOpen) return null;

  const isChild = variant === 'child';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className={`
        relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8
        ${isChild ? 'border-4 border-[var(--child-blue)]' : 'border-2 border-[var(--parent-teal)]'}
      `}>
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-[#64748b]" />
        </button>

        {/* Icon */}
        <div className={`
          w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center
          ${isChild 
            ? 'bg-gradient-to-br from-[var(--child-yellow)] to-[var(--child-peach)]' 
            : 'bg-[var(--parent-teal)]'
          }
        `}>
          <LogOut className={`w-8 h-8 sm:w-10 sm:h-10 ${isChild ? 'text-[#744210]' : 'text-white'}`} />
        </div>

        {/* Content */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-[#2d3748] mb-2 sm:mb-3 text-xl sm:text-2xl">
            {isChild ? 'See You Soon! 👋' : 'Confirm Logout'}
          </h2>
          <p className="text-[#64748b] text-sm sm:text-base">
            {isChild 
              ? 'Are you sure you want to leave? Your memories will be waiting for you!' 
              : 'Are you sure you want to logout from your parent account?'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant={isChild ? 'child-blue' : 'parent-slate'}
            size="large"
            onClick={onCancel}
            className="flex-1"
          >
            Stay Here
          </Button>
          <Button
            variant={isChild ? 'child-peach' : 'parent-teal'}
            size="large"
            onClick={onConfirm}
            icon={<LogOut className="w-5 h-5" />}
            className="flex-1"
          >
            {isChild ? 'Goodbye' : 'Logout'}
          </Button>
        </div>
      </div>
    </div>
  );
}
