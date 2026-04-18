import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('users')
    .select('display_name, bio')
    .eq('username', username)
    .single();

  if (!profile) return { title: '사용자를 찾을 수 없습니다' };

  return {
    title: `${profile.display_name} (@${username})`,
    description: profile.bio ?? `${profile.display_name}의 여행 지도`,
    openGraph: {
      title: `${profile.display_name} (@${username})`,
      description: profile.bio ?? `${profile.display_name}의 여행 지도`,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (!profile) notFound();

  redirect(`/?user=${username}`);
}
