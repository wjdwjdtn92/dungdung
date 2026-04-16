import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Globe, Lock, Users } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: pin } = await supabase
    .from('pins')
    .select('title, place_name, body')
    .eq('id', id)
    .single()

  if (!pin) return { title: '핀을 찾을 수 없습니다' }

  return {
    title: pin.title,
    description: pin.body?.slice(0, 160) ?? `${pin.place_name}에서의 여행 기록`,
    openGraph: {
      title: pin.title,
      description: pin.body?.slice(0, 160) ?? `${pin.place_name}에서의 여행 기록`,
    },
  }
}

const VISIBILITY_ICON = {
  public: <Globe className="h-3.5 w-3.5" />,
  friends: <Users className="h-3.5 w-3.5" />,
  private: <Lock className="h-3.5 w-3.5" />,
} as const

const VISIBILITY_LABEL = { public: '전체 공개', friends: '친구 공개', private: '나만 보기' } as const

export default async function PinDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // 핀 + 작성자 + 사진 + 태그 병렬 조회 (server-parallel-fetching)
  const [{ data: pin }, { data: photos }, { data: pinTags }] = await Promise.all([
    supabase
      .from('pins')
      .select('*, users(id, username, display_name, avatar_url)')
      .eq('id', id)
      .single(),
    supabase
      .from('pin_photos')
      .select('*')
      .eq('pin_id', id)
      .order('order'),
    supabase
      .from('pin_tags')
      .select('tags(name)')
      .eq('pin_id', id),
  ])

  if (!pin) notFound()

  const author = pin.users as { id: string; username: string; display_name: string; avatar_url: string | null } | null
  const tags = pinTags?.flatMap((pt) => (pt.tags as { name: string } | null)?.name ?? []) ?? []

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  function photoUrl(path: string) {
    return `${supabaseUrl}/storage/v1/object/public/pin-photos/${path}?width=800&quality=80`
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">

        {/* 사진 */}
        {photos && photos.length > 0 && (
          <div className="rounded-2xl overflow-hidden">
            <div className="relative aspect-[4/3] bg-zinc-100">
              <Image
                src={photoUrl(photos[0].storage_path)}
                alt={pin.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {photos.length > 1 && (
              <div className="grid grid-cols-3 gap-1 mt-1">
                {photos.slice(1, 4).map((photo) => (
                  <div key={photo.id} className="relative aspect-square bg-zinc-100">
                    <Image
                      src={photoUrl(photo.storage_path)}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 헤더 */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-zinc-900">{pin.title}</h1>
            <span className="flex items-center gap-1 shrink-0 text-xs text-zinc-400 mt-1">
              {VISIBILITY_ICON[pin.visibility as keyof typeof VISIBILITY_ICON]}
              {VISIBILITY_LABEL[pin.visibility as keyof typeof VISIBILITY_LABEL]}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-zinc-500">
            <MapPin className="h-4 w-4 text-zinc-400" />
            {pin.place_name}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {author && (
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-50">
              <div className="h-7 w-7 rounded-full bg-zinc-200 overflow-hidden">
                {author.avatar_url && (
                  <Image src={author.avatar_url} alt={author.display_name} width={28} height={28} />
                )}
              </div>
              <span className="text-sm text-zinc-600">{author.display_name}</span>
              <span className="text-sm text-zinc-400">@{author.username}</span>
            </div>
          )}
        </div>

        {/* 본문 */}
        {pin.body && (
          <div className="bg-white rounded-2xl border border-zinc-100 p-6">
            <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">{pin.body}</p>
          </div>
        )}
      </div>
    </div>
  )
}
