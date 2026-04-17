'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  getExplorePins,
  type ExplorePin,
  type ExploreCursor,
} from '@/lib/explore/actions';
import { ExplorePinCard } from './ExplorePinCard';
import { Button } from '@/components/ui/button';

interface ExploreListProps {
  initialPins: ExplorePin[];
  initialCursor: ExploreCursor | null;
  sort: 'latest' | 'popular';
  country?: string;
  tag?: string;
  popularTags: string[];
}

export function ExploreList({
  initialPins,
  initialCursor,
  sort,
  country,
  tag,
  popularTags,
}: ExploreListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pins, setPins] = useState(initialPins);
  const [cursor, setCursor] = useState<ExploreCursor | null>(initialCursor);
  const [isPending, startTransition] = useTransition();

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/explore?${params.toString()}`);
  }

  function loadMore() {
    if (!cursor) return;
    startTransition(async () => {
      const { pins: next, nextCursor } = await getExplorePins({
        cursor,
        sort,
        country: country || undefined,
        tag: tag || undefined,
      });
      setPins((prev) => [...prev, ...next]);
      setCursor(nextCursor);
    });
  }

  return (
    <div className="space-y-6">
      {/* 필터 바 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 정렬 */}
        <div className="flex rounded-lg border border-zinc-200 overflow-hidden text-sm">
          <button
            onClick={() => setFilter('sort', null)}
            className={`px-3 py-1.5 ${sort === 'latest' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}
          >
            최신순
          </button>
          <button
            onClick={() => setFilter('sort', 'popular')}
            className={`px-3 py-1.5 ${sort === 'popular' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}
          >
            인기순
          </button>
        </div>

        {/* 태그 필터 */}
        {popularTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {popularTags.map((t) => (
              <button
                key={t}
                onClick={() => setFilter('tag', tag === t ? null : t)}
                className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                  tag === t
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}

        {/* 나라 필터 활성화 시 제거 버튼 */}
        {country && (
          <button
            onClick={() => setFilter('country', null)}
            className="flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-xs"
          >
            {country} &times;
          </button>
        )}
      </div>

      {/* 핀 그리드 */}
      {pins.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-lg font-medium mb-2">아직 공개된 핀이 없어요</p>
          <p className="text-sm">첫 번째 여행 기록을 남겨보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pins.map((pin) => (
            <ExplorePinCard key={pin.id} pin={pin} />
          ))}
        </div>
      )}

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
