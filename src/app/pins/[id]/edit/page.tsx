import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { PinForm } from '@/components/pins/PinForm';
import type { PinFormValues } from '@/types/pin';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PinEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const [{ data: pin }, { data: pinTags }] = await Promise.all([
    supabase.from('pins').select('*').eq('id', id).single(),
    supabase.from('pin_tags').select('tags(name)').eq('pin_id', id),
  ]);

  if (!pin) notFound();
  if (pin.user_id !== user.id) redirect(`/pins/${id}`);

  const tags = pinTags?.flatMap((pt) => (pt.tags as { name: string } | null)?.name ?? []) ?? [];

  const initialValues: Partial<PinFormValues> = {
    title: pin.title,
    body: pin.body ?? undefined,
    place_name: pin.place_name,
    lat: pin.lat,
    lng: pin.lng,
    country_code: pin.country_code,
    city: pin.city,
    visited_tz: pin.visited_tz,
    visibility: pin.visibility,
    tags,
    trip_id: pin.trip_id,
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">핀 수정</h1>
        <PinForm mode="edit" pinId={id} initialValues={initialValues} />
      </div>
    </div>
  );
}
