import { Bell } from 'lucide-react';
import { getNotifications, markAllAsRead } from '@/lib/notifications/actions';
import { NotificationList } from '@/components/notifications/NotificationList';
import { AppHeader } from '@/components/layout/AppHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '알림' };

export default async function NotificationsPage() {
  const [notifications] = await Promise.all([
    getNotifications(),
    markAllAsRead(), // 페이지 진입 시 모두 읽음 처리
  ]);

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="h-5 w-5 text-zinc-500" />
            <h1 className="text-xl font-bold text-zinc-900">알림</h1>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 p-4">
            <NotificationList notifications={notifications} />
          </div>
        </div>
      </div>
    </>
  );
}
