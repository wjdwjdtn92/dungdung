'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, UserPlus } from 'lucide-react';
import { markAllAsRead, type NotificationItem } from '@/lib/notifications/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui';

interface NotificationListProps {
  notifications: NotificationItem[];
}

const TYPE_CONFIG = {
  follow: { icon: UserPlus, label: '팔로우했습니다', color: 'text-blue-500' },
  like: { icon: Heart, label: '좋아요를 눌렀습니다', color: 'text-red-500' },
  comment: { icon: MessageCircle, label: '댓글을 남겼습니다', color: 'text-green-500' },
} as const;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export function NotificationList({ notifications }: NotificationListProps) {
  const [isPending, startTransition] = useTransition();
  const hasUnread = notifications.some((n) => !n.read_at);
  const clearUnread = useUIStore((s) => s.clearUnread);

  function handleMarkAll() {
    startTransition(async () => {
      await markAllAsRead();
      clearUnread();
      window.location.reload();
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-400">
        <p className="text-lg font-medium mb-2">알림이 없어요</p>
        <p className="text-sm">새로운 활동이 있으면 여기에 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasUnread && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleMarkAll} disabled={isPending}>
            모두 읽음
          </Button>
        </div>
      )}

      <div className="space-y-1">
        {notifications.map((n) => {
          const config = TYPE_CONFIG[n.type];
          const Icon = config.icon;
          const href =
            n.type === 'follow' && n.actor
              ? `/${n.actor.username}`
              : n.target_pin_id
                ? `/pins/${n.target_pin_id}`
                : '#';

          return (
            <Link
              key={n.id}
              href={href}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-zinc-50',
                !n.read_at && 'bg-blue-50/50',
              )}
            >
              <div className="h-9 w-9 rounded-full bg-zinc-200 overflow-hidden shrink-0">
                {n.actor?.avatar_url && (
                  <Image
                    src={n.actor.avatar_url}
                    alt={n.actor.display_name}
                    width={36}
                    height={36}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-700">
                  <span className="font-medium">{n.actor?.display_name ?? '알 수 없음'}</span>
                  님이{' '}
                  <span className={config.color}>{config.label}</span>
                </p>
                <span className="text-xs text-zinc-400">{timeAgo(n.created_at)}</span>
              </div>
              <Icon className={cn('h-4 w-4 shrink-0 mt-1', config.color)} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
