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

  // 핀 + 트립 + 팔로우 상태 병렬 조회 (핀은 단순 쿼리로 분리)
  const [{ data: pinsRaw }, { data: tripsRaw }, followCheck] = await Promise.all([
    supabase
      .from('pins')
      .select('id, title, lat, lng, visited_at, place_name, trip_id')
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

  const pinIds = (pinsRaw ?? []).map((p) => p.id);

  // 태그는 별도 쿼리 (pin_tags → tags 중첩 조인 안정성 확보)
  const { data: pinTagsRaw } = pinIds.length > 0
    ? await supabase
        .from('pin_tags')
        .select('pin_id, tags(name)')
        .in('pin_id', pinIds)
    : { data: [] };

  // pin_id → 태그 목록 맵
  const tagsByPin: Record<string, string[]> = {};
  for (const pt of pinTagsRaw ?? []) {
    const tag = (pt.tags as { name: string } | null)?.name;
    if (tag) {
      (tagsByPin[pt.pin_id] ??= []).push(tag);
    }
  }

  const pins = (pinsRaw ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    lat: p.lat as number | null,
    lng: p.lng as number | null,
    visited_at: p.visited_at,
    place_name: p.place_name,
    tags: tagsByPin[p.id] ?? [],
    tripId: p.trip_id as string | null,
  }));

  const allTags = Array.from(new Set(pins.flatMap((p) => p.tags))).sort();
  const trips = tripsRaw ?? [];
  const isOwnMap = user?.id === profile.id;
  const initialFollowing = !isOwnMap && !!followCheck?.data;

  // 현재 로그인 유저 프로필 (우측 상단 메뉴용)
  let currentUserProfile: { avatar_url: string | null; display_name: string; username: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('avatar_url, display_name, username')
      .eq('id', user.id)
      .single();
    currentUserProfile = data;
  }

  return (
    <UserMapClient
      profile={profile}
      pins={pins}
      allTags={allTags}
      trips={trips}
      currentUserId={user?.id ?? null}
      currentUserProfile={currentUserProfile}
      isOwnMap={isOwnMap}
      initialFollowing={initialFollowing}
    />
  );
}
