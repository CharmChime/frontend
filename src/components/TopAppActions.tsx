import React from 'react';
import { createPortal } from 'react-dom';
import { Bell, LogOut } from 'lucide-react';
import { ChildAvatar } from './ChildAvatar';

interface TopAppActionsProps {
  variant: 'parent' | 'child';
  onNavigate: (page: string) => void;
  onLogout: () => void;
  profileName?: string;
  profileAvatar?: string;
}

const getInitials = (name: string) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return 'P';

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

export function TopAppActions({
  variant,
  onNavigate,
  onLogout,
  profileName = 'Profile',
  profileAvatar,
}: TopAppActionsProps) {
  if (typeof document === 'undefined') return null;

  const isParent = variant === 'parent';
  const activeClass = isParent
    ? 'hover:bg-[var(--parent-teal)]/10 hover:text-[var(--parent-teal)] focus:ring-[var(--parent-teal)]'
    : 'hover:bg-[var(--child-blue)]/20 hover:text-[#1a365d] focus:ring-[var(--child-blue)]';

  const buttonClass = `
    inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200
    bg-white text-[#64748b] shadow-sm transition-colors
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${activeClass}
  `;

  return createPortal(
    <div
      className="top-app-actions fixed right-4 top-4 z-[60] flex items-center gap-2 sm:right-6"
      data-variant={variant}
    >
      {isParent && (
        <button
          type="button"
          className={buttonClass}
          onClick={() => onNavigate('notifications')}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
      )}
      <button
        type="button"
        className={`${buttonClass} p-0`}
        onClick={() => onNavigate('settings')}
        aria-label="Profile"
        title="Profile"
      >
        {isParent ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--parent-teal)] text-sm font-semibold text-white">
            {getInitials(profileName)}
          </span>
        ) : (
          <ChildAvatar
            avatar={profileAvatar}
            name={profileName}
            size="small"
            className="h-9 w-9 shadow-none ring-0"
          />
        )}
      </button>
      <button
        type="button"
        className={`${buttonClass} hover:bg-red-50 hover:text-red-600 focus:ring-red-300`}
        onClick={onLogout}
        aria-label="Logout"
        title="Logout"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>,
    document.body
  );
}
