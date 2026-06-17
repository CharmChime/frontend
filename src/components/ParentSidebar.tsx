import React, { useState } from 'react';
import { Check, ChevronDown, Home, Users, BarChart, FileText, Activity, TrendingUp, X } from 'lucide-react';
import logo from '../assets/logo.png';
import { TopAppActions } from './TopAppActions';
import { ChildAvatar } from './ChildAvatar';
import type { Child } from '../services/api';

interface ParentSidebarProps {
  childName: string;
  childAvatar?: string;
  parentName?: string;
  children?: Child[];
  selectedChildId?: string;
  onSelectChild?: (childId: string) => void;
  activeItem?: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onLogoClick?: () => void;
}

export function ParentSidebar({
  childName,
  childAvatar,
  parentName = 'Parent',
  children = [],
  selectedChildId,
  onSelectChild,
  activeItem = 'overview',
  onNavigate,
  onLogout,
  isOpen = true,
  onClose,
  onLogoClick,
}: ParentSidebarProps) {
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart className="w-5 h-5" /> },
    { id: 'insights', label: 'AI Insights', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'activity', label: 'Activity Log', icon: <Activity className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
    { id: 'children', label: 'Children', icon: <Users className="w-5 h-5" /> },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleSelectChild = (childId: string) => {
    onSelectChild?.(childId);
    setIsChildSelectorOpen(false);
  };

  const hasChildOptions = children.length > 1 && Boolean(onSelectChild);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50
        w-72 h-screen bg-white border-r border-gray-200 shadow-lg flex flex-col flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <TopAppActions
          variant="parent"
          onNavigate={handleNavigate}
          onLogout={onLogout}
          profileName={parentName}
        />

        {/* Close Button for Mobile */}
        {onClose && (
          <button
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors z-10"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Logo/Brand Section */}
        <div className="border-b border-gray-200 px-6 py-7 text-center">
          <button
            onClick={onLogoClick}
            className="mx-auto block hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] rounded-2xl"
            aria-label="Go to home page"
          >
            <img
              src={logo}
              alt="CharmChime Logo"
              className="mx-auto h-24 w-24 object-contain"
            />
          </button>
          <div className="mt-3">
            <h3 className="text-2xl font-semibold leading-tight tracking-normal text-[#2d3748]">
              <span className="block">Charm Chime</span>
            </h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-[#94a3b8]">
              Parent Portal
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${activeItem === item.id
                  ? 'bg-[var(--parent-teal)] text-white shadow-md'
                  : 'text-[#64748b] hover:bg-gray-50'
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="relative border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={() => hasChildOptions && setIsChildSelectorOpen((value) => !value)}
            className={`
              w-full rounded-xl bg-[var(--parent-teal)]/10 p-3 text-left transition-all
              ${hasChildOptions ? 'cursor-pointer hover:bg-[var(--parent-teal)]/15 focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)]' : 'cursor-default'}
            `}
            aria-label="Select child to monitor"
            aria-expanded={hasChildOptions ? isChildSelectorOpen : undefined}
          >
            <div className="flex items-center gap-3">
              <ChildAvatar avatar={childAvatar} name={childName} size="small" className="h-9 w-9" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--parent-teal)]">
                  Monitoring
                </p>
                <p className="truncate text-sm font-semibold text-[#2d3748]">{childName}</p>
              </div>
              {hasChildOptions && (
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-[var(--parent-teal)] transition-transform ${isChildSelectorOpen ? 'rotate-180' : ''
                    }`}
                />
              )}
            </div>
          </button>

          {hasChildOptions && isChildSelectorOpen && (
            <div className="absolute bottom-full left-4 right-4 z-[70] mb-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#94a3b8]">
                  Select child
                </p>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {children.map((child) => {
                  const optionName = child.nickname || child.name;
                  const isSelected = child.id === selectedChildId;

                  return (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => handleSelectChild(child.id)}
                      className={`
                        flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors
                        ${isSelected ? 'bg-[var(--parent-teal)]/10' : 'hover:bg-gray-50'}
                      `}
                    >
                      <ChildAvatar avatar={child.avatar} name={optionName} size="small" className="h-9 w-9" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#2d3748]">{optionName}</p>
                        <p className="text-xs text-[#64748b]">Age {child.age}</p>
                      </div>
                      {isSelected && <Check className="h-4 w-4 flex-shrink-0 text-[var(--parent-teal)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
