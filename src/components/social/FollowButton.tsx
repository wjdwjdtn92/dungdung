'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { followUser, unfollowUser } from '@/lib/social/actions';
import { Button } from '@/components/ui/button';

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
}

export function FollowButton({ targetUserId, initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !following;
    setFollowing(next);

    startTransition(async () => {
      try {
        if (next) {
          await followUser(targetUserId);
        } else {
          await unfollowUser(targetUserId);
        }
      } catch {
        setFollowing(!next);
      }
    });
  }

  return (
    <Button
      onClick={toggle}
      disabled={isPending}
      variant={following ? 'outline' : 'default'}
      size="sm"
      className="min-w-[80px]"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        '팔로잉'
      ) : (
        '팔로우'
      )}
    </Button>
  );
}
