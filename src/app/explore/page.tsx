import { Compass } from 'lucide-react';
import { getExplorePins, getPopularTags } from '@/lib/explore/actions';
import { ExploreList } from '@/components/explore/ExploreList';
import { AppHeader } from '@/components/layout/AppHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '탐색',
  description: '전 세계 여행자들의 핀을 탐색해보세요',
};

interface Props {
  searchParams: Promise<{ sort?: string; country?: string; tag?: string }>;
}

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;
  const sort = params.sort === 'popular' ? 'popular' : 'latest';
  const country = params.country || undefined;
  const tag = params.tag || undefined;

  const [{ pins, nextCursor }, popularTags] = await Promise.all([
    getExplorePins({ sort, country, tag }),
    getPopularTags(),
  ]);

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Compass className="h-5 w-5 text-zinc-500" />
          <h1 className="text-xl font-bold text-zinc-900">탐색</h1>
        </div>

        <ExploreList
          initialPins={pins}
          initialCursor={nextCursor}
          sort={sort}
          country={country}
          tag={tag}
          popularTags={popularTags}
        />
      </div>
    </div>
    </>
  );
}
