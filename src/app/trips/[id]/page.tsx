import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Globe, Lock, Users } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { TripActions } from '@/components/trips/TripActions';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: trip } = await supabase
    .from('trips')
    .select('title, description')
    .eq('id', id)
    .single();

  if (!trip) return { title: '트립을 찾을 수 없습니다' };
  return {
    title: trip.title,
    description: trip.description ?? `${trip.title} 여행 기록`,
  };
}

const VISIBILITY_ICON = {
  public: <Globe className="h-3.5 w-3.5" />,
  friends: <Users className="h-3.5 w-3.5" />,
  private: <Lock className="h-3.5 w-3.5" />,
} as const;

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: trip }, { data: pins }] = await Promise.all([
    supabase
      .from('trips')
      .select('*, users!trips_user_id_fkey(id, username, display_name, avatar_url)')
      .eq('id', id)
      .single(),
    supabase
      .from('pins')
      .select('id, title, place_name, visited_at, pin_photos(storage_path, order)')
      .eq('trip_id', id)
      .order('visited_at', { ascending: true }),
  ]);

  if (!trip) notFound();

  const author = trip.users as {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;

  const isOwner = user?.id === trip.user_id;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  function photoUrl(path: string) {
    return `${supabaseUrl}/storage/v1/object/public/pin-photos/${path}?width=400&quality=75`;
  }

  function formatDate(date: string | null) {
    if (!date) return null;
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
          {/* 헤더 */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-zinc-900">{trip.title}</h1>
              <div className="flex items-center gap-3 shrink-0 mt-1">
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  {VISIBILITY_ICON[trip.visibility as keyof typeof VISIBILITY_ICON]}
                </span>
                {isOwner && <TripActions tripId={id} />}
              </div>
            </div>

            {trip.description && (
              <p className="text-sm text-zinc-600 leading-relaxed">{trip.description}</p>
            )}

            {(trip.started_at || trip.ended_at) && (
              <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                <Calendar className="h-4 w-4 text-zinc-400" />
                {formatDate(trip.started_at)}
                {trip.started_at && trip.ended_at && ' — '}
                {formatDate(trip.ended_at)}
              </div>
            )}

            {author && (
              <Link
                href={`/${author.username}`}
                className="flex items-center gap-2 pt-2 border-t border-zinc-100 hover:opacity-80"
              >
                <div className="h-7 w-7 rounded-full bg-zinc-200 overflow-hidden">
                  {author.avatar_url && (
                    <Image src={author.avatar_url} alt={author.display_name} width={28} height={28} />
                  )}
                </div>
                <span className="text-sm text-zinc-600">{author.display_name}</span>
              </Link>
            )}
          </div>

          {/* 핀 타임라인 */}
          {pins && pins.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-700 px-1">
                핀 {pins.length}개
              </h2>
              <div className="space-y-3">
                {pins.map((pin) => {
                  const photos =
                    (pin.pin_photos as Array<{ storage_path: string; order: number }> | null) ?? [];
                  const cover = [...photos].sort((a, b) => a.order - b.order)[0];
                  return (
                    <Link
                      key={pin.id}
                      href={`/pins/${pin.id}`}
                      className="flex items-center gap-4 bg-white rounded-xl border border-zinc-100 p-3 hover:border-zinc-200 transition-colors"
                    >
                      {cover && (
                        <div className="relative h-16 w-16 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                          <Image
                            src={photoUrl(cover.storage_path)}
                            alt={pin.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-zinc-900 truncate">{pin.title}</h3>
                        <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{pin.place_name}</span>
                        </div>
                        <span className="text-xs text-zinc-400 mt-0.5 block">
                          {formatDate(pin.visited_at)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-400">
              <p className="text-sm">아직 이 트립에 연결된 핀이 없어요</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
