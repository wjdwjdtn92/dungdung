'use server';

import { createClient } from '@/lib/supabase/server';

export interface ExplorePin {
  id: string;
  title: string;
  body: string | null;
  place_name: string;
  country_code: string | null;
  created_at: string;
  visited_at: string;
  cover_photo: string | null;
  like_count: number;
  comment_count: number;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export interface ExploreCursor {
  created_at: string;
  id: string;
}

const PAGE_LIMIT = 12;

export async function getExplorePins(options?: {
  cursor?: ExploreCursor;
  sort?: 'latest' | 'popular';
  country?: string;
  tag?: string;
}): Promise<{ pins: ExplorePin[]; nextCursor: ExploreCursor | null }> {
  const supabase = await createClient();
  const sort = options?.sort ?? 'latest';

  let query = supabase
    .from('pins')
    .select(
      `
      id, title, body, place_name, country_code, created_at, visited_at,
      users!pins_user_id_fkey(id, username, display_name, avatar_url),
      pin_photos(storage_path, order),
      likes(count),
      comments(count)
    `,
    )
    .eq('visibility', 'public');

  // 필터
  if (options?.country) {
    query = query.eq('country_code', options.country);
  }

  if (options?.tag) {
    // 태그 필터: pin_tags → tags 조인으로 필터
    const { data: tagRow } = await supabase
      .from('tags')
      .select('id')
      .eq('name', options.tag.toLowerCase())
      .single();

    if (tagRow) {
      const { data: pinIds } = await supabase
        .from('pin_tags')
        .select('pin_id')
        .eq('tag_id', tagRow.id);

      const ids = pinIds?.map((r) => r.pin_id) ?? [];
      if (ids.length === 0) return { pins: [], nextCursor: null };
      query = query.in('id', ids);
    } else {
      return { pins: [], nextCursor: null };
    }
  }

  // 정렬 & 페이지네이션
  query = query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(PAGE_LIMIT + 1);

  if (options?.cursor) {
    query = query.or(
      `created_at.lt.${options.cursor.created_at},and(created_at.eq.${options.cursor.created_at},id.lt.${options.cursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const hasMore = rows.length > PAGE_LIMIT;
  const results = hasMore ? rows.slice(0, PAGE_LIMIT) : rows;

  let pinList: ExplorePin[] = results.map((p) => {
    const photos = (p.pin_photos as Array<{ storage_path: string; order: number }> | null) ?? [];
    const sorted = [...photos].sort((a, b) => a.order - b.order);
    const likeAgg = p.likes as unknown as Array<{ count: number }>;
    const commentAgg = p.comments as unknown as Array<{ count: number }>;
    return {
      id: p.id,
      title: p.title,
      body: p.body,
      place_name: p.place_name,
      country_code: p.country_code,
      created_at: p.created_at,
      visited_at: p.visited_at,
      cover_photo: sorted[0]?.storage_path ?? null,
      like_count: likeAgg?.[0]?.count ?? 0,
      comment_count: commentAgg?.[0]?.count ?? 0,
      author: p.users as ExplorePin['author'],
    };
  });

  // 인기순: 7일 내 좋아요 기준 (간단히 like_count 내림차순)
  if (sort === 'popular') {
    pinList = pinList.sort((a, b) => b.like_count - a.like_count);
  }

  const nextCursor: ExploreCursor | null = hasMore
    ? { created_at: results[results.length - 1].created_at, id: results[results.length - 1].id }
    : null;

  return { pins: pinList, nextCursor };
}

export async function getPopularTags(limit = 10): Promise<string[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('pin_tags')
    .select('tag_id, tags(name)')
    .limit(500);

  if (!data || data.length === 0) return [];

  // 태그별 카운트
  const counts = new Map<string, number>();
  for (const row of data) {
    const name = (row.tags as { name: string } | null)?.name;
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}
