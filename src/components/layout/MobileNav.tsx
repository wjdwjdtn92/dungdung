'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Map, Newspaper, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  username?: string;
}

const NAV_ITEMS = [
  { href: '/feed', label: '피드', icon: Newspaper },
  { href: '/explore', label: '탐색', icon: Compass },
  { href: '/map', label: '지도', icon: Map },
] as const;

export function MobileNav({ username }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-zinc-100 sm:hidden">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 text-[10px] px-3 py-1',
                active ? 'text-zinc-900' : 'text-zinc-400',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        {username && (
          <Link
            href={`/${username}`}
            className={cn(
              'flex flex-col items-center gap-0.5 text-[10px] px-3 py-1',
              pathname === `/${username}` ? 'text-zinc-900' : 'text-zinc-400',
            )}
          >
            <User className="h-5 w-5" />
            프로필
          </Link>
        )}
      </div>
    </nav>
  );
}
