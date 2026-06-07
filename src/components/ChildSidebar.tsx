import React from 'react';
import { Sparkles, PenLine, BookOpen, Settings, Calendar, Trophy, LogOut, Home, Wand2, X } from 'lucide-react';
import logo from '../assets/35160e99e546074153c34366a831aa0e30d421e6.png';

interface ChildSidebarProps {
  childName: string;
  activeItem?: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onLogoClick?: () => void;
  streakDays?: number;
}

export function ChildSidebar({
  childName,
  activeItem = 'home',
  onNavigate,
  onLogout,
  isOpen = true,
  onClose,
  onLogoClick,
  streakDays,
}: ChildSidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'entry', label: 'New Entry', icon: <PenLine className="w-5 h-5" /> },
    { id: 'story-mode', label: 'Story Time', icon: <Wand2 className="w-5 h-5" /> },
    { id: 'memories', label: 'My Memories', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-5 h-5" /> },
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

        {/* Logo/Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onLogoClick}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--child-blue)] rounded-xl"
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
            </div>
          </div>
          
          {/* User Info */}
          <div className="bg-gradient-to-br from-[var(--child-blue)]/10 to-[var(--child-mint)]/10 rounded-2xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[var(--child-peach)] flex items-center justify-center">
                <span className="text-xl">🌟</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#2d3748] truncate">{childName}</p>
                <p className="text-xs text-[#64748b]">
                  {typeof streakDays === 'number' ? `${streakDays}-day streak` : 'Keep journaling'}
                </p>
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
                  ? 'bg-[var(--child-blue)] text-[#1a365d] shadow-md'
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
            onClick={() => handleNavigate('settings')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
              ${activeItem === 'settings'
                ? 'bg-[var(--child-blue)] text-[#1a365d] shadow-md'
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
