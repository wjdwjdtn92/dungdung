'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const tripSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100),
  description: z.string().max(500).optional(),
  visibility: z.enum(['public', 'friends', 'private']).default('public'),
  started_at: z.string().optional(),
  ended_at: z.string().optional(),
});

export type TripFormValues = z.infer<typeof tripSchema>;

export async function createTrip(values: TripFormValues) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const parsed = tripSchema.safeParse(values);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      visibility: parsed.data.visibility,
      started_at: parsed.data.started_at ?? null,
      ended_at: parsed.data.ended_at ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateTrip(tripId: string, values: Partial<TripFormValues>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { error } = await supabase
    .from('trips')
    .update({
      ...(values.title !== undefined && { title: values.title }),
      ...(values.description !== undefined && { description: values.description ?? null }),
      ...(values.visibility !== undefined && { visibility: values.visibility }),
      ...(values.started_at !== undefined && { started_at: values.started_at ?? null }),
      ...(values.ended_at !== undefined && { ended_at: values.ended_at ?? null }),
    })
    .eq('id', tripId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
}

export async function deleteTrip(tripId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
}

export async function linkPinToTrip(pinId: string, tripId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { error } = await supabase
    .from('pins')
    .update({ trip_id: tripId })
    .eq('id', pinId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
}

export async function unlinkPinFromTrip(pinId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { error } = await supabase
    .from('pins')
    .update({ trip_id: null })
    .eq('id', pinId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
}

export async function getUserTrips() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data, error } = await supabase
    .from('trips')
    .select('id, title, description, visibility, started_at, ended_at, created_at, pins(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((t) => ({
    ...t,
    pin_count: (t.pins as unknown as Array<{ count: number }>)?.[0]?.count ?? 0,
  }));
}
