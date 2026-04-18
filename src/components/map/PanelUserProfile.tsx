'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { getUserPublicPins, type UserPublicPins } from '@/lib/pins/queries';
import { FollowButton } from '@/components/social/FollowButton';
import type { GlobePinMarker } from '@/components/globe/GlobeEngine';

interface PanelUserProfileProps {
  username: string;
  currentUserId: string | null;
  onPinClick: (pinId: string) => void;
  onPinsLoaded?: (markers: GlobePinMarker[]) => void;
  onProfileLoaded?: (profile: { display_name: string; avatar_url: string | null }) => void;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function PanelUserProfile({
  username,
  currentUserId,
  onPinClick,
  onPinsLoaded,
  onProfileLoaded,
}: PanelUserProfileProps) {
  const [data, setData] = useState<UserPublicPins | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getUserPublicPins(username).then((result) => {
      setData(result);
      setLoading(false);
      if (result) {
        onPinsLoaded?.(
          result.pins.map((p) => ({
            id: p.id,
            title: p.title,
            lat: p.lat,
            lng: p.lng,
            visitedAt: p.visited_at,
          })),
        );
        onProfileLoaded?.({ display_name: result.user.display_name, avatar_url: result.user.avatar_url });
      }
    });
  }, [username, onPinsLoaded]);

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-zinc-100" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-zinc-100 rounded w-1/2" />
            <div className="h-3 bg-zinc-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-center text-zinc-400 text-sm">사용자를 찾을 수 없습니다</div>;
  }

  const { user: profile, pins, follower_count, is_following } = data;
  const isOwn = currentUserId === profile.id;

  return (
    <div className="space-y-4">
      {/* 프로필 헤더 */}
      <div className="px-4 pt-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-zinc-200 overflow-hidden shrink-0">
            {profile.avatar_url && (
              <Image src={profile.avatar_url} alt={profile.display_name} width={48} height={48} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold text-zinc-900">{profile.display_name}</h2>
                <p className="text-xs text-zinc-400">@{profile.username}</p>
              </div>
              {!isOwn && currentUserId && (
                <FollowButton targetUserId={profile.id} initialFollowing={is_following} />
              )}
            </div>
          </div>
        </div>
        {profile.bio && (
          <p className="text-sm text-zinc-600 leading-relaxed">{profile.bio}</p>
        )}
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>
            <strong className="text-zinc-900">{follower_count}</strong> 팔로워
          </span>
          <span>
            <strong className="text-zinc-900">{pins.length}</strong> 핀
          </span>
        </div>
      </div>

      {/* 핀 목록 */}
      <div className="border-t border-zinc-100">
        {pins.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-sm">공개된 핀이 없어요</div>
        ) : (
          <div className="p-3 space-y-1">
            {pins.map((pin) => (
              <button
                key={pin.id}
                onClick={() => onPinClick(pin.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-zinc-50 transition-colors"
              >
                {pin.cover_photo && (
                  <div className="relative h-12 w-12 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                    <Image
                      src={`${supabaseUrl}/storage/v1/object/public/pin-photos/${pin.cover_photo}?width=200&quality=60`}
                      alt={pin.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-zinc-900 truncate">{pin.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{pin.place_name}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
