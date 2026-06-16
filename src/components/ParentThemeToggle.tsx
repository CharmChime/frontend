import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

interface ParentThemeToggleProps {
  theme: 'light' | 'dark';
  onThemeToggle?: () => Promise<void>;
}

export function ParentThemeToggle({ theme, onThemeToggle }: ParentThemeToggleProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async () => {
    if (!onThemeToggle || isSaving) return;

    setIsSaving(true);
    try {
      await onThemeToggle();
      toast.success(`Parent theme switched to ${theme === 'dark' ? 'light' : 'dark'} mode.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update theme.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={!onThemeToggle || isSaving}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 text-sm text-[#475569] shadow-sm transition-colors hover:bg-[var(--parent-teal)]/10 hover:text-[var(--parent-teal-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      aria-label={`Switch parent pages to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">
        {isSaving ? 'Saving...' : theme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
