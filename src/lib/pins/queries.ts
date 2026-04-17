'use server';

import { createClient } from '@/lib/supabase/server';

export interface PinDetail {
  id: string;
  title: string;
  body: string | null;
  place_name: string;
  lat: number;
  lng: number;
  visibility: string;
  created_at: string;
  visited_at: string;
  user_id: string;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  photos: Array<{ id: string; storage_path: string; order: number }>;
  tags: string[];
  like_count: number;
  liked: boolean;
  comments: Array<{
    id: string;
    body: string;
    created_at: string;
    user_id: string;
    author: { id: string; username: string; display_name: string; avatar_url: string | null } | null;
  }>;
}

export async function getPinDetail(pinId: string): Promise<PinDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: pin }, { data: photos }, { data: pinTags }, { count: likeCount }, { data: likeCheck }, { data: commentRows }] =
    await Promise.all([
      supabase
        .from('pins')
        .select('*, users!pins_user_id_fkey(id, username, display_name, avatar_url)')
        .eq('id', pinId)
        .single(),
      supabase.from('pin_photos').select('id, storage_path, order').eq('pin_id', pinId).order('order'),
      supabase.from('pin_tags').select('tags(name)').eq('pin_id', pinId),
      supabase.from('likes').select('*', { count: 'exact', head: true }).eq('pin_id', pinId),
      user
        ? supabase.from('likes').select('user_id').eq('pin_id', pinId).eq('user_id', user.id)
        : Promise.resolve({ data: [] }),
      supabase
        .from('comments')
        .select('id, body, created_at, user_id, users!comments_user_id_fkey(id, username, display_name, avatar_url)')
        .eq('pin_id', pinId)
        .order('created_at', { ascending: true }),
    ]);

  if (!pin) return null;

  const tags = pinTags?.flatMap((pt) => (pt.tags as { name: string } | null)?.name ?? []) ?? [];

  return {
    id: pin.id,
    title: pin.title,
    body: pin.body,
    place_name: pin.place_name,
    lat: pin.lat,
    lng: pin.lng,
    visibility: pin.visibility,
    created_at: pin.created_at,
    visited_at: pin.visited_at,
    user_id: pin.user_id,
    author: pin.users as PinDetail['author'],
    photos: photos ?? [],
    tags,
    like_count: likeCount ?? 0,
    liked: (likeCheck ?? []).length > 0,
    comments: (commentRows ?? []).map((c) => ({
      id: c.id,
      body: c.body,
      created_at: c.created_at,
      user_id: c.user_id,
      author: c.users as PinDetail['comments'][0]['author'],
    })),
  };
}

export interface UserPublicPins {
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
  };
  pins: Array<{
    id: string;
    title: string;
    lat: number;
    lng: number;
    place_name: string;
    visited_at: string;
    cover_photo: string | null;
  }>;
  follower_count: number;
  is_following: boolean;
}

export async function getUserPublicPins(username: string): Promise<UserPublicPins | null> {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('users')
    .select('id, username, display_name, avatar_url, bio')
    .eq('username', username)
    .single();

  if (!profile) return null;

  const [{ data: pins }, { count: followerCount }, followCheck] = await Promise.all([
    supabase
      .from('pins')
      .select('id, title, lat, lng, place_name, visited_at, pin_photos(storage_path, order)')
      .eq('user_id', profile.id)
      .eq('visibility', 'public')
      .order('visited_at', { ascending: false })
      .limit(50),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id),
    currentUser && currentUser.id !== profile.id
      ? supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    user: profile,
    pins: (pins ?? []).map((p) => {
      const photos = (p.pin_photos as Array<{ storage_path: string; order: number }> | null) ?? [];
      const sorted = [...photos].sort((a, b) => a.order - b.order);
      return {
        id: p.id,
        title: p.title,
        lat: p.lat,
        lng: p.lng,
        place_name: p.place_name,
        visited_at: p.visited_at,
        cover_photo: sorted[0]?.storage_path ?? null,
      };
    }),
    follower_count: followerCount ?? 0,
    is_following: !!followCheck.data,
  };
}
