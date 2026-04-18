'use client';

import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getPinDetail, type PinDetail } from '@/lib/pins/queries';
import { LikeButton } from '@/components/pins/LikeButton';
import { CommentSection, type CommentData } from '@/components/pins/CommentSection';

interface PanelPinDetailProps {
  pinId: string;
  currentUserId: string | null;
  onAuthorClick?: (username: string) => void;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function PanelPinDetail({ pinId, currentUserId, onAuthorClick }: PanelPinDetailProps) {
  const [pin, setPin] = useState<PinDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPinDetail(pinId)
      .then(setPin)
      .finally(() => setLoading(false));
  }, [pinId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-48 bg-zinc-100 rounded-xl" />
        <div className="h-6 bg-zinc-100 rounded w-3/4" />
        <div className="h-4 bg-zinc-100 rounded w-1/2" />
      </div>
    );
  }

  if (!pin) {
    return <div className="p-6 text-center text-zinc-400 text-sm">핀을 찾을 수 없습니다</div>;
  }

  function photoUrl(path: string) {
    return `${supabaseUrl}/storage/v1/object/public/pin-photos/${path}?width=600&quality=80`;
  }

  const comments: CommentData[] = pin.comments.map((c) => ({
    id: c.id,
    body: c.body,
    created_at: c.created_at,
    user_id: c.user_id,
    author: c.author,
  }));

  return (
    <div className="space-y-4">
      {/* 사진 */}
      {pin.photos.length > 0 && (
        <div className="relative aspect-[4/3] bg-zinc-100">
          <Image
            src={photoUrl(pin.photos[0].storage_path)}
            alt={pin.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="px-4 space-y-4 pb-6">
        {/* 제목 + 링크 */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold text-zinc-900">{pin.title}</h2>
          <Link
            href={`/pins/${pin.id}`}
            className="p-1 text-zinc-400 hover:text-zinc-600 shrink-0"
            title="전체 페이지로 보기"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {/* 장소 */}
        <div className="flex items-center gap-1.5 text-sm text-zinc-500">
          <MapPin className="h-4 w-4 text-zinc-400" />
          {pin.place_name}
        </div>

        {/* 태그 */}
        {pin.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pin.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 작성자 + 좋아요 */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          {pin.author && (() => {
            const isOwn = currentUserId === pin.user_id;
            return (
              <button
                onClick={() => onAuthorClick?.(pin.author!.username)}
                className="flex items-center gap-2 hover:opacity-80 cursor-pointer"
              >
                <div className="h-7 w-7 rounded-full bg-zinc-200 overflow-hidden">
                  {pin.author.avatar_url && (
                    <Image src={pin.author.avatar_url} alt={pin.author.display_name} width={28} height={28} />
                  )}
                </div>
                <span className={isOwn ? 'text-sm font-medium text-blue-600' : 'text-sm text-zinc-600'}>
                  {isOwn ? '나' : pin.author.display_name}
                </span>
              </button>
            );
          })()}
          <LikeButton pinId={pin.id} initialLiked={pin.liked} initialCount={pin.like_count} currentUserId={currentUserId} />
        </div>

        {/* 본문 */}
        {pin.body && (
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{pin.body}</p>
        )}

        {/* 댓글 */}
        <CommentSection
          pinId={pin.id}
          initialComments={comments}
          currentUserId={currentUserId}
          pinOwnerId={pin.user_id}
        />
      </div>
    </div>
  );
}
