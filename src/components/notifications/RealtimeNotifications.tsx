'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useUIStore } from '@/store/ui';
import { Bell } from 'lucide-react';

interface RealtimeNotificationsProps {
  userId: string;
  initialUnreadCount: number;
}

const TYPE_LABEL = {
  follow: '팔로우했습니다',
  like: '좋아요를 눌렀습니다',
  comment: '댓글을 남겼습니다',
} as const;

export function RealtimeNotifications({ userId, initialUnreadCount }: RealtimeNotificationsProps) {
  const { setUnreadCount, incrementUnread } = useUIStore();

  // 서버에서 내려온 초기값으로 스토어 동기화
  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount, setUnreadCount]);

  // Supabase Realtime 구독
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        async (payload) => {
          incrementUnread();

          // 액터 정보 조회 후 토스트 표시
          const actorId = payload.new.actor_id as string | null;
          const type = payload.new.type as keyof typeof TYPE_LABEL;
          const label = TYPE_LABEL[type] ?? '새 알림이 있습니다';

          if (actorId) {
            const { data: actor } = await supabase
              .from('users')
              .select('display_name')
              .eq('id', actorId)
              .single();

            toast(`${actor?.display_name ?? '누군가'}님이 ${label}`, {
              icon: <Bell className="h-4 w-4" />,
              action: { label: '확인', onClick: () => window.location.href = '/notifications' },
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, incrementUnread]);

  return null;
}
