'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface FeedPin {
  id: string;
  title: string;
  body: string | null;
  place_name: string;
  visibility: string;
  created_at: string;
  user_id: string;
  cover_photo: string | null;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export interface FeedCursor {
  created_at: string;
  id: string;
}

const FEED_LIMIT = 10;

export async function getFeedPins(cursor?: FeedCursor): Promise<{
  pins: FeedPin[];
  nextCursor: FeedCursor | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // 팔로우 중인 사용자 목록
  const { data: followings } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id);

  const followingIds = followings?.map((f) => f.following_id) ?? [];
  const authorIds = [user.id, ...followingIds];

  let query = supabase
    .from('pins')
    .select(
      `
      id, title, body, place_name, visibility, created_at, user_id,
      users!pins_user_id_fkey(id, username, display_name, avatar_url),
      pin_photos(storage_path, order)
    `,
    )
    .in('user_id', authorIds)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(FEED_LIMIT + 1); // 다음 페이지 존재 여부 확인용으로 1개 더

  // cursor 기반 페이지네이션 (created_at + id 복합 커서)
  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const hasMore = rows.length > FEED_LIMIT;
  const results = hasMore ? rows.slice(0, FEED_LIMIT) : rows;

  const pins: FeedPin[] = results.map((p) => {
    const photos = (p.pin_photos as Array<{ storage_path: string; order: number }> | null) ?? [];
    const sorted = [...photos].sort((a, b) => a.order - b.order);
    return {
      id: p.id,
      title: p.title,
      body: p.body,
      place_name: p.place_name,
      visibility: p.visibility,
      created_at: p.created_at,
      user_id: p.user_id,
      cover_photo: sorted[0]?.storage_path ?? null,
      author: p.users as FeedPin['author'],
    };
  });

  const nextCursor: FeedCursor | null = hasMore
    ? { created_at: results[results.length - 1].created_at, id: results[results.length - 1].id }
    : null;

  return { pins, nextCursor };
}
