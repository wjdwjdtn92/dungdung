'use client';

import { Compass, Newspaper, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'feed' | 'explore' | 'my-pins';

interface PanelTabsProps {
  active: TabType;
  onChange: (tab: TabType) => void;
  isLoggedIn: boolean;
}

const TABS = [
  { key: 'feed' as const, label: '피드', icon: Newspaper, requiresAuth: true },
  { key: 'explore' as const, label: '탐색', icon: Compass, requiresAuth: false },
  { key: 'my-pins' as const, label: '내 핀', icon: MapPin, requiresAuth: true },
];

export function PanelTabs({ active, onChange, isLoggedIn }: PanelTabsProps) {
  const visibleTabs = isLoggedIn ? TABS : TABS.filter((t) => !t.requiresAuth);

  // 탐색 탭만 있는 경우 탭 바 숨김
  if (visibleTabs.length <= 1) return null;

  return (
    <div className="flex border-b border-zinc-100">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors',
              isActive
                ? 'text-zinc-900 border-b-2 border-zinc-900'
                : 'text-zinc-400 hover:text-zinc-600',
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
