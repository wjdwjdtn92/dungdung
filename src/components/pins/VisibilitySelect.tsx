'use client';

import { Globe, Lock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type Visibility = 'public' | 'friends' | 'private';

const OPTIONS: { value: Visibility; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    value: 'public',
    label: '전체 공개',
    icon: <Globe className="h-4 w-4" />,
    desc: '누구나 볼 수 있어요',
  },
  {
    value: 'friends',
    label: '친구 공개',
    icon: <Users className="h-4 w-4" />,
    desc: '나를 팔로우하는 사람만',
  },
  {
    value: 'private',
    label: '나만 보기',
    icon: <Lock className="h-4 w-4" />,
    desc: '나만 볼 수 있어요',
  },
];

interface Props {
  value: Visibility;
  onChange: (v: Visibility) => void;
}

export function VisibilitySelect({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 rounded-xl border p-3 text-sm transition-colors',
            value === opt.value
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-600',
          )}
        >
          {opt.icon}
          <span className="font-medium">{opt.label}</span>
          <span className="text-xs text-zinc-400 leading-tight text-center">{opt.desc}</span>
        </button>
      ))}
    </div>
  );
}
