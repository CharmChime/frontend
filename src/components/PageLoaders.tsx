import React from 'react';
import { BarChart3, BookOpen, Heart, Loader2, Sparkles } from 'lucide-react';
import { ChildAvatar } from './ChildAvatar';

interface ParentDashboardLoaderProps {
  childName: string;
}

interface ParentPageLoaderProps {
  title?: string;
  message?: string;
}

interface ChildPageLoaderProps {
  childName: string;
  childAvatar?: string;
  message?: string;
}

export function ParentDashboardLoader({ childName }: ParentDashboardLoaderProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--parent-teal)]/10 text-[var(--parent-teal)]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#2d3748]">Loading dashboard</h3>
            <p className="text-sm text-[#64748b]">Fetching the latest records for {childName}.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[BarChart3, BookOpen, Heart, Sparkles].map((Icon, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="h-3 w-24 rounded-full bg-gray-200" />
                <div className="h-7 w-16 rounded-full bg-gray-100" />
                <div className="h-3 w-20 rounded-full bg-gray-100" />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-[#94a3b8]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="h-5 w-40 rounded-full bg-gray-200" />
              <div className="h-7 w-20 rounded-full bg-gray-100" />
            </div>
            <div className="flex h-56 items-end gap-3">
              {[44, 68, 52, 86, 64, 76].map((height, index) => (
                <div key={index} className="flex flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-[var(--parent-teal)]/15"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ParentPageLoader({
  title = 'Loading workspace',
  message = 'Fetching the latest parent data.',
}: ParentPageLoaderProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--parent-teal)]/10 text-[var(--parent-teal)]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#2d3748]">{title}</h3>
            <p className="text-sm text-[#64748b]">{message}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="h-4 w-36 rounded-full bg-gray-200" />
              <div className="h-8 w-8 rounded-lg bg-gray-100" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-full rounded-full bg-gray-100" />
              <div className="h-3 w-4/5 rounded-full bg-gray-100" />
              <div className="h-3 w-2/3 rounded-full bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChildPageLoader({
  childName,
  childAvatar,
  message = 'Getting your space ready...',
}: ChildPageLoaderProps) {
  return (
    <div className="rounded-3xl border-2 border-white bg-gradient-to-br from-[var(--child-blue)]/20 via-white to-[var(--child-mint)]/20 p-6 shadow-lg sm:p-8">
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <div className="relative">
          <ChildAvatar avatar={childAvatar} name={childName} size="xl" />
          <div className="absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md">
            <Sparkles className="h-5 w-5 animate-pulse text-[#1a365d]" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#64748b]">Just a moment</p>
          <h3 className="mt-1 text-xl font-semibold text-[#2d3748] sm:text-2xl">
            Hi {childName}, Chime is warming up.
          </h3>
          <p className="mt-2 text-[#4a5568]">{message}</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[var(--child-blue)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
