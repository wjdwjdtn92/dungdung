import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Bell, Compass, Map, Newspaper } from 'lucide-react';
import { getUnreadCount } from '@/lib/notifications/actions';
import { UserMenu } from './UserMenu';
import { MobileNav } from './MobileNav';

export async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { username: string; display_name: string; avatar_url: string | null } | null = null;
  let unreadCount = 0;
  if (user) {
    const [{ data }, count] = await Promise.all([
      supabase
        .from('users')
        .select('username, display_name, avatar_url')
        .eq('id', user.id)
        .single(),
      getUnreadCount(),
    ]);
    profile = data;
    unreadCount = count;
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={user ? '/feed' : '/'} className="text-lg font-bold text-zinc-900">
              둥둥
            </Link>
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              <Link
                href="/explore"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <Compass className="h-4 w-4" />
                탐색
              </Link>
              {user && (
                <>
                  <Link
                    href="/feed"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    <Newspaper className="h-4 w-4" />
                    피드
                  </Link>
                  <Link
                    href="/map"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    <Map className="h-4 w-4" />
                    지도
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <Link
                href="/notifications"
                className="relative p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            {user && profile ? (
              <UserMenu
                username={profile.username}
                displayName={profile.display_name}
                avatarUrl={profile.avatar_url}
              />
            ) : (
              <Link
                href="/"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>
      {user && <MobileNav username={profile?.username} />}
    </>
  );
}
