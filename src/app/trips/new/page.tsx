import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TripForm } from '@/components/trips/TripForm';
import { AppHeader } from '@/components/layout/AppHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '트립 만들기' };

export default async function NewTripPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-lg px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-900">트립 만들기</h1>
            <p className="text-sm text-zinc-500 mt-1">여행을 묶어서 관리해보세요</p>
          </div>
          <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-6">
            <TripForm />
          </div>
        </div>
      </div>
    </>
  );
}
