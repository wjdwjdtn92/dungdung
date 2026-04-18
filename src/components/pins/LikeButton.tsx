'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { likePin, unlikePin } from '@/lib/social/actions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LikeButtonProps {
  pinId: string;
  initialLiked: boolean;
  initialCount: number;
  currentUserId?: string | null;
}

export function LikeButton({ pinId, initialLiked, initialCount, currentUserId }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (!currentUserId) {
      toast('좋아요는 로그인 후 가능합니다', {
        action: { label: '로그인', onClick: () => window.location.href = '/' },
      });
      return;
    }

    // 낙관적 업데이트
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));

    startTransition(async () => {
      try {
        if (next) {
          await likePin(pinId);
        } else {
          await unlikePin(pinId);
        }
      } catch {
        // 롤백
        setLiked(!next);
        setCount((c) => c + (next ? -1 : 1));
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={cn(
        'flex items-center gap-1.5 text-sm transition-colors',
        liked ? 'text-red-500' : 'text-zinc-400 hover:text-red-400',
      )}
    >
      <Heart className={cn('h-5 w-5', liked && 'fill-current')} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
