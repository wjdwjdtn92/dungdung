import { createClient } from '@/lib/supabase/server';
import { MapClient } from './map/MapClient';
import { getUnreadCount } from '@/lib/notifications/actions';
import type { GlobePinMarker } from '@/components/globe/GlobeEngine';
import type { PinListData } from '@/components/map/PinListItem';

function toPinList(
  rows: Array<{
    id: string;
    title: string;
    place_name: string;
    pin_photos: Array<{ storage_path: string; order: number }> | null;
    likes: unknown;
    comments: unknown;
    users?: unknown;
  }>,
): PinListData[] {
  return rows.map((p) => {
    const photos = (p.pin_photos as Array<{ storage_path: string; order: number }> | null) ?? [];
    const sorted = [...photos].sort((a, b) => a.order - b.order);
    const likeAgg = p.likes as Array<{ count: number }> | null;
    const commentAgg = p.comments as Array<{ count: number }> | null;
    const author = p.users as { display_name: string; avatar_url: string | null } | null;
    return {
      id: p.id,
      title: p.title,
      place_name: p.place_name,
      cover_photo: sorted[0]?.storage_path ?? null,
      like_count: likeAgg?.[0]?.count ?? 0,
      comment_count: commentAgg?.[0]?.count ?? 0,
      author: author ?? undefined,
    };
  });
}

function toMarkers(
  rows: Array<{ id: string; title: string; lat: number; lng: number; visited_at: string }>,
): GlobePinMarker[] {
  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    lat: p.lat,
    lng: p.lng,
    visitedAt: p.visited_at,
  }));
}

const PIN_SELECT = `id, title, lat, lng, place_name, visited_at,
  pin_photos(storage_path, order),
  likes(count),
  comments(count)`;

export default async function HomePage() {
  const supabase = await createClient();

  // 인증 체크 + 탐색 핀 병렬 로드
  const [
    {
      data: { user },
    },
    { data: explorePinsRaw },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('pins')
      .select(`${PIN_SELECT}, users!pins_user_id_fkey(display_name, avatar_url)`)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const explorePins = explorePinsRaw ?? [];

  // 비로그인: explore 핀만 표시
  if (!user) {
    return (
      <MapClient
        myPins={[]}
        myPinList={[]}
        feedPins={[]}
        feedMarkers={[]}
        explorePins={toPinList(explorePins as Parameters<typeof toPinList>[0])}
        exploreMarkers={toMarkers(
          explorePins as Array<{ id: string; title: string; lat: number; lng: number; visited_at: string }>,
        )}
        currentUserId={null}
        user={null}
        unreadCount={0}
      />
    );
  }

  // 로그인: 프로필 + 내 핀 + 팔로잉 + 미읽음 병렬 로드
  const [{ data: profile }, { data: myPinsRaw }, { data: followings }, unreadCount] =
    await Promise.all([
      supabase.from('users').select('username, display_name, avatar_url').eq('id', user.id).single(),
      supabase
        .from('pins')
        .select(PIN_SELECT)
        .eq('user_id', user.id)
        .order('visited_at', { ascending: false })
        .limit(100),
      supabase.from('follows').select('following_id').eq('follower_id', user.id),
      getUnreadCount(),
    ]);

  // 피드: 팔로우한 사용자 + 본인 핀
  const followingIds = followings?.map((f) => f.following_id) ?? [];
  const authorIds = [user.id, ...followingIds];

  let feedPinsRaw: typeof explorePinsRaw = [];
  if (authorIds.length > 0) {
    const { data } = await supabase
      .from('pins')
      .select(`${PIN_SELECT}, users!pins_user_id_fkey(display_name, avatar_url)`)
      .in('user_id', authorIds)
      .order('created_at', { ascending: false })
      .limit(50);
    feedPinsRaw = data;
  }

  const myPins = myPinsRaw ?? [];
  const feedPins = feedPinsRaw ?? [];

  return (
    <MapClient
      myPins={toMarkers(myPins as Array<{ id: string; title: string; lat: number; lng: number; visited_at: string }>)}
      myPinList={toPinList(myPins as Parameters<typeof toPinList>[0])}
      feedPins={toPinList(feedPins as Parameters<typeof toPinList>[0])}
      feedMarkers={toMarkers(feedPins as Array<{ id: string; title: string; lat: number; lng: number; visited_at: string }>)}
      explorePins={toPinList(explorePins as Parameters<typeof toPinList>[0])}
      exploreMarkers={toMarkers(explorePins as Array<{ id: string; title: string; lat: number; lng: number; visited_at: string }>)}
      currentUserId={user.id}
      user={profile ?? null}
      unreadCount={unreadCount}
    />
  );
}
