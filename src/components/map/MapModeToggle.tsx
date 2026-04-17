'use client';

import { Globe2, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MapMode = '3d' | '2d';

interface MapModeToggleProps {
  mode: MapMode;
  onChange: (mode: MapMode) => void;
}

export function MapModeToggle({ mode, onChange }: MapModeToggleProps) {
  return (
    <div className="flex rounded-full bg-white/90 backdrop-blur-sm shadow-md overflow-hidden">
      <button
        onClick={() => onChange('3d')}
        className={cn(
          'flex items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
          mode === '3d' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100',
        )}
      >
        <Globe2 className="h-3.5 w-3.5" />
        3D
      </button>
      <button
        onClick={() => onChange('2d')}
        className={cn(
          'flex items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
          mode === '2d' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100',
        )}
      >
        <Map className="h-3.5 w-3.5" />
        2D
      </button>
    </div>
  );
}
