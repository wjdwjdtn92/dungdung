import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, MapPin } from 'lucide-react';
import type { ExplorePin } from '@/lib/explore/actions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function photoUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/pin-photos/${path}?width=600&quality=75`;
}

export function ExplorePinCard({ pin }: { pin: ExplorePin }) {
  return (
    <Link href={`/pins/${pin.id}`} className="block group">
      <article className="bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:border-zinc-200 hover:shadow-sm transition-all">
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

        <div className="p-4 space-y-2.5">
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
              <span className="text-xs font-medium text-zinc-700 truncate">
                {pin.author.display_name}
              </span>
            </div>
          )}

          <h2 className="font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-zinc-700">
            {pin.title}
          </h2>

          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="h-3 w-3 shrink-0 text-zinc-400" />
            <span className="truncate">{pin.place_name}</span>
          </div>

          {pin.body && (
            <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{pin.body}</p>
          )}

          <div className="flex items-center gap-3 pt-1 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {pin.like_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {pin.comment_count}
            </span>
            {pin.country_code && (
              <span className="ml-auto">{pin.country_code}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
