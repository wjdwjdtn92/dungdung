import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Settings } from 'lucide-react';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { AppHeader } from '@/components/layout/AppHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '설정' };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('users')
    .select('display_name, username, bio')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/');

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-lg px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="h-5 w-5 text-zinc-500" />
            <h1 className="text-xl font-bold text-zinc-900">설정</h1>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 p-6">
            <h2 className="text-sm font-semibold text-zinc-700 mb-4">프로필 편집</h2>
            <ProfileForm
              initialValues={{
                display_name: profile.display_name,
                username: profile.username,
                bio: profile.bio ?? '',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
