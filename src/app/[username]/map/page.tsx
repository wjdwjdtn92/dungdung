import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { UserMapClient } from './UserMapClient';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('users')
    .select('display_name')
    .eq('username', username)
    .single();

  if (!profile) return { title: '사용자를 찾을 수 없습니다' };
  return { title: `${profile.display_name}의 지도` };
}

export default async function UserMapPage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const [{ data: { user } }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('users').select('id, username, display_name, avatar_url').eq('username', username).single(),
  ]);

  if (!profile) notFound();

  // 공개 핀 + 태그 + 트립 + 팔로우 상태 병렬 조회
  const [{ data: pinsRaw }, { data: tripsRaw }, followCheck] = await Promise.all([
    supabase
      .from('pins')
      .select(`id, title, lat, lng, visited_at, place_name,
        pin_tags(tags(name)),
        trip_id, trips(id, title)`)
      .eq('user_id', profile.id)
      .eq('visibility', 'public')
      .order('visited_at', { ascending: false })
      .limit(200),
    supabase
      .from('trips')
      .select('id, title')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
    user && user.id !== profile.id
      ? supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', profile.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const pins = (pinsRaw ?? []).map((p) => {
    const tags = (p.pin_tags as Array<{ tags: { name: string } | null }> | null)
      ?.map((pt) => pt.tags?.name)
      .filter(Boolean) as string[] ?? [];
    const trip = p.trips as { id: string; title: string } | null;
    return {
      id: p.id,
      title: p.title,
      lat: p.lat as number | null,
      lng: p.lng as number | null,
      visited_at: p.visited_at,
      place_name: p.place_name,
      tags,
      trip: trip ?? null,
    };
  });

  // 이 유저 핀에서 사용된 고유 태그 목록
  const allTags = Array.from(new Set(pins.flatMap((p) => p.tags))).sort();
  const trips = tripsRaw ?? [];

  const isOwnMap = user?.id === profile.id;
  const initialFollowing = !isOwnMap && !!followCheck?.data;

  return (
    <UserMapClient
      profile={profile}
      pins={pins}
      allTags={allTags}
      trips={trips}
      currentUserId={user?.id ?? null}
      isOwnMap={isOwnMap}
      initialFollowing={initialFollowing}
    />
  );
}
