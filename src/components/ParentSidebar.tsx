import React from 'react';
import { Shield, Home, Users, BarChart, FileText, Bell, Settings, LogOut, Activity, TrendingUp, X } from 'lucide-react';
import logo from '../assets/35160e99e546074153c34366a831aa0e30d421e6.png';
import { ChildAvatar } from './ChildAvatar';

interface ParentSidebarProps {
  childName: string;
  childAvatar?: string;
  activeItem?: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onLogoClick?: () => void;
}

export function ParentSidebar({ childName, childAvatar, activeItem = 'overview', onNavigate, onLogout, isOpen = true, onClose, onLogoClick }: ParentSidebarProps) {
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
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
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
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onLogoClick}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--parent-teal)] rounded-xl"
              aria-label="Go to home page"
            >
              <img 
                src={logo} 
                alt="CharmChime Logo" 
                className="w-16 h-16 object-contain"
              />
            </button>
            <div className="flex-1">
              <h3 className="text-[#2d3748]">CharmChime</h3>
              <p className="text-xs text-[#64748b]">Parent Portal</p>
            </div>
          </div>
          
          {/* Child Info */}
          <div className="bg-[var(--parent-teal)]/10 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <ChildAvatar avatar={childAvatar} name={childName} size="small" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#2d3748] truncate">Monitoring</p>
                <p className="text-xs text-[#64748b]">{childName}</p>
              </div>
            </div>
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

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={() => handleNavigate('notifications')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
              ${activeItem === 'notifications'
                ? 'bg-[var(--parent-teal)] text-white shadow-md'
                : 'text-[#64748b] hover:bg-gray-50'
              }
            `}
          >
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </button>
          <button 
            onClick={() => handleNavigate('settings')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
              ${activeItem === 'settings'
                ? 'bg-[var(--parent-teal)] text-white shadow-md'
                : 'text-[#64748b] hover:bg-gray-50'
              }
            `}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#64748b] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
