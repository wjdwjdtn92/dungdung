'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// ─── 팔로우 ───

export async function followUser(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: targetUserId });

  if (error && error.code !== '23505') throw new Error(error.message);
}

export async function unfollowUser(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId);

  if (error) throw new Error(error.message);
}

// ─── 좋아요 ───

export async function likePin(pinId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { error } = await supabase
    .from('likes')
    .insert({ user_id: user.id, pin_id: pinId });

  if (error && error.code !== '23505') throw new Error(error.message);
}

export async function unlikePin(pinId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', user.id)
    .eq('pin_id', pinId);

  if (error) throw new Error(error.message);
}

// ─── 댓글 ───

export async function createComment(pinId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 1000) throw new Error('댓글은 1~1000자 사이여야 합니다');

  const { data, error } = await supabase
    .from('comments')
    .insert({ pin_id: pinId, user_id: user.id, body: trimmed })
    .select('id, body, created_at, user_id, users!comments_user_id_fkey(id, username, display_name, avatar_url)')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw new Error(error.message);
}
