'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { followUser, unfollowUser } from '@/lib/social/actions';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
  /** 다크 배경 위에서 사용 시 'ghost-dark' */
  variant?: 'default' | 'ghost-dark';
}

export function FollowButton({ targetUserId, initialFollowing, variant = 'default' }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      try {
        if (next) await followUser(targetUserId);
        else await unfollowUser(targetUserId);
      } catch {
        setFollowing(!next);
      }
    });
  }

  if (variant === 'ghost-dark') {
    return (
      <button
        onClick={toggle}
        disabled={isPending}
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer min-w-[72px]',
          following
            ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
            : 'bg-white text-zinc-900 hover:bg-zinc-100',
        )}
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : following ? '팔로잉' : '팔로우'}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={cn(
        'px-4 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer min-w-[80px]',
        following
          ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
          : 'bg-zinc-900 text-white hover:bg-zinc-700',
      )}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : following ? '팔로잉' : '팔로우'}
    </button>
  );
}
