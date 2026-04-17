import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getFeedPins } from '@/lib/feed/actions';
import { FeedList } from '@/components/feed/FeedList';
import { AppHeader } from '@/components/layout/AppHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '피드' };

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { pins, nextCursor } = await getFeedPins();

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-zinc-900">피드</h1>
            <Link
              href="/pins/new"
              className="flex items-center gap-1.5 bg-zinc-900 text-white text-sm font-medium px-3 py-1.5 rounded-full hover:bg-zinc-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />핀 만들기
            </Link>
          </div>

          <FeedList initialPins={pins} initialCursor={nextCursor} />
        </div>
      </div>
    </>
  );
}
