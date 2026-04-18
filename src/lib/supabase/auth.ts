'use server';

import { createClient } from './server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function signInWithGoogle() {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const proto = headersList.get('x-forwarded-proto') ?? 'http';
  // 프로덕션 SITE_URL이 있으면 우선 사용, 없으면 요청 host 기반 (localhost/IP 모두 대응)
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect('/?error=auth');
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
