'use client';

import { Compass, Newspaper, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'feed' | 'explore' | 'my-pins';

interface PanelTabsProps {
  active: TabType;
  onChange: (tab: TabType) => void;
}

const TABS = [
  { key: 'feed' as const, label: '피드', icon: Newspaper },
  { key: 'explore' as const, label: '탐색', icon: Compass },
  { key: 'my-pins' as const, label: '내 핀', icon: MapPin },
];

export function PanelTabs({ active, onChange }: PanelTabsProps) {
  return (
    <div className="flex border-b border-zinc-100">
      {TABS.map((tab) => {
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
