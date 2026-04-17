'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { getFeedPins, type FeedPin, type FeedCursor } from '@/lib/feed/actions';
import { PinCard } from './PinCard';
import { Button } from '@/components/ui/button';

interface FeedListProps {
  initialPins: FeedPin[];
  initialCursor: FeedCursor | null;
}

export function FeedList({ initialPins, initialCursor }: FeedListProps) {
  const [pins, setPins] = useState(initialPins);
  const [cursor, setCursor] = useState<FeedCursor | null>(initialCursor);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    if (!cursor) return;
    startTransition(async () => {
      const { pins: next, nextCursor } = await getFeedPins(cursor);
      setPins((prev) => [...prev, ...next]);
      setCursor(nextCursor);
    });
  }

  if (pins.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-400">
        <p className="text-lg font-medium mb-2">아직 피드가 없어요</p>
        <p className="text-sm">핀을 만들거나 다른 사람을 팔로우해보세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pins.map((pin) => (
          <PinCard key={pin.id} pin={pin} />
        ))}
      </div>

      {cursor && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                불러오는 중...
              </>
            ) : (
              '더 보기'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
