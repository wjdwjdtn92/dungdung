import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { FeedPin } from '@/lib/feed/actions';

interface PinCardProps {
  pin: FeedPin;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function photoUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/pin-photos/${path}?width=600&quality=75`;
}

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

export function PinCard({ pin }: PinCardProps) {
  return (
    <Link href={`/pins/${pin.id}`} className="block group">
      <article className="bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:border-zinc-200 hover:shadow-sm transition-all">
        {/* 커버 사진 */}
        {pin.cover_photo && (
          <div className="relative aspect-[4/3] bg-zinc-100">
            <Image
              src={photoUrl(pin.cover_photo)}
              alt={pin.title}
              fill
              className="object-cover group-hover:scale-[1.01] transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* 작성자 */}
          {pin.author && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-zinc-200 overflow-hidden shrink-0">
                {pin.author.avatar_url && (
                  <Image
                    src={pin.author.avatar_url}
                    alt={pin.author.display_name}
                    width={24}
                    height={24}
                  />
                )}
              </div>
              <span className="text-xs font-medium text-zinc-700">{pin.author.display_name}</span>
              <span className="text-xs text-zinc-400 ml-auto">{timeAgo(pin.created_at)}</span>
            </div>
          )}

          {/* 제목 */}
          <h2 className="font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-zinc-700">
            {pin.title}
          </h2>

          {/* 장소 */}
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="h-3 w-3 shrink-0 text-zinc-400" />
            <span className="truncate">{pin.place_name}</span>
          </div>

          {/* 본문 미리보기 */}
          {pin.body && (
            <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{pin.body}</p>
          )}
        </div>
      </article>
    </Link>
  );
}
