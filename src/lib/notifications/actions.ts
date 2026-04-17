'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface NotificationItem {
  id: string;
  type: 'follow' | 'like' | 'comment';
  target_pin_id: string | null;
  read_at: string | null;
  created_at: string;
  actor: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data, error } = await supabase
    .from('notifications')
    .select(
      `id, type, target_pin_id, read_at, created_at,
       users!notifications_actor_id_fkey(id, username, display_name, avatar_url)`,
    )
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  return (data ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    target_pin_id: n.target_pin_id,
    read_at: n.read_at,
    created_at: n.created_at,
    actor: n.users as NotificationItem['actor'],
  }));
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .is('read_at', null);

  return count ?? 0;
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', user.id)
    .is('read_at', null);

  if (error) throw new Error(error.message);
}
