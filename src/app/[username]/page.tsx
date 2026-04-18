import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Heart, MessageCircle, Map } from 'lucide-react';
import type { Metadata } from 'next';
import { FollowButton } from '@/components/social/FollowButton';
import { AppHeader } from '@/components/layout/AppHeader';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('users')
    .select('display_name, bio')
    .eq('username', username)
    .single();

  if (!profile) return { title: '사용자를 찾을 수 없습니다' };

  return {
    title: `${profile.display_name} (@${username})`,
    description: profile.bio ?? `${profile.display_name}의 여행 기록`,
    openGraph: {
      title: `${profile.display_name} (@${username})`,
      description: profile.bio ?? `${profile.display_name}의 여행 기록`,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  // 프로필 먼저 조회 (ID 필요)
  const [
    {
      data: { user },
    },
    { data: profile },
  ] = await Promise.all([supabase.auth.getUser(), supabase.from('users').select('*').eq('username', username).single()]);

  if (!profile) notFound();

  // 프로필 ID 기반으로 나머지 병렬 조회
  const [{ count: followerCount }, { count: followingCount }, { data: pins }, followCheck] =
    await Promise.all([
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id),
      supabase
        .from('pins')
        .select(
          `id, title, place_name, created_at, visibility,
        pin_photos(storage_path, order),
        likes(count),
        comments(count)`,
        )
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(30),
      user && user.id !== profile.id
        ? supabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', user.id)
            .eq('following_id', profile.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const isFollowing = !!followCheck.data;
  const isOwn = user?.id === profile.id;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  function photoUrl(path: string) {
    return `${supabaseUrl}/storage/v1/object/public/pin-photos/${path}?width=400&quality=75`;
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-zinc-200 overflow-hidden shrink-0">
              {profile.avatar_url && (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  width={64}
                  height={64}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-zinc-900">{profile.display_name}</h1>
                  <p className="text-sm text-zinc-400">@{profile.username}</p>
                </div>
                {!isOwn && user && (
                  <FollowButton targetUserId={profile.id} initialFollowing={isFollowing} />
                )}
              </div>
              {profile.bio && (
                <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span>
                  <strong className="text-zinc-900">{followerCount ?? 0}</strong>{' '}
                  <span className="text-zinc-500">팔로워</span>
                </span>
                <span>
                  <strong className="text-zinc-900">{followingCount ?? 0}</strong>{' '}
                  <span className="text-zinc-500">팔로잉</span>
                </span>
                <span>
                  <strong className="text-zinc-900">{pins?.length ?? 0}</strong>{' '}
                  <span className="text-zinc-500">핀</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 지도로 보기 버튼 */}
        {pins && pins.length > 0 && (
          <div className="mb-4">
            <Link
              href={`/${profile.username}/map`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-700 transition-colors"
            >
              <Map className="h-4 w-4" />
              지도로 보기
            </Link>
          </div>
        )}

        {/* 핀 목록 */}
        {pins && pins.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pins.map((pin) => {
              const photos =
                (pin.pin_photos as Array<{ storage_path: string; order: number }> | null) ?? [];
              const sorted = [...photos].sort((a, b) => a.order - b.order);
              const likeAgg = pin.likes as unknown as Array<{ count: number }>;
              const commentAgg = pin.comments as unknown as Array<{ count: number }>;
              return (
                <Link key={pin.id} href={`/pins/${pin.id}`} className="block group">
                  <article className="bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:border-zinc-200 hover:shadow-sm transition-all">
                    {sorted[0] && (
                      <div className="relative aspect-[4/3] bg-zinc-100">
                        <Image
                          src={photoUrl(sorted[0].storage_path)}
                          alt={pin.title}
                          fill
                          className="object-cover group-hover:scale-[1.01] transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-3 space-y-1.5">
                      <h3 className="font-semibold text-sm text-zinc-900 line-clamp-1">
                        {pin.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <MapPin className="h-3 w-3 text-zinc-400" />
                        <span className="truncate">{pin.place_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {likeAgg?.[0]?.count ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {commentAgg?.[0]?.count ?? 0}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-400">
            <p className="text-lg font-medium mb-2">아직 핀이 없어요</p>
            {isOwn && <p className="text-sm">첫 번째 핀을 만들어보세요!</p>}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
