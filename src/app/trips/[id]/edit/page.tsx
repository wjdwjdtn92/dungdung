import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TripForm } from '@/components/trips/TripForm';
import { AppHeader } from '@/components/layout/AppHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '트립 수정' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTripPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: trip } = await supabase
    .from('trips')
    .select('id, title, description, visibility, started_at, ended_at, user_id')
    .eq('id', id)
    .single();

  if (!trip || trip.user_id !== user.id) redirect('/map');

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-lg px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-900">트립 수정</h1>
          </div>
          <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-6">
            <TripForm
              mode="edit"
              tripId={id}
              initialValues={{
                title: trip.title,
                description: trip.description ?? '',
                visibility: trip.visibility,
                started_at: trip.started_at ?? '',
                ended_at: trip.ended_at ?? '',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
