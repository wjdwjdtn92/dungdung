import Image from 'next/image';
import { MapPin, Heart, MessageCircle } from 'lucide-react';

export interface PinListData {
  id: string;
  title: string;
  place_name: string;
  cover_photo: string | null;
  like_count: number;
  comment_count: number;
  author?: {
    display_name: string;
    avatar_url: string | null;
  } | null;
}

interface PinListItemProps {
  pin: PinListData;
  onClick: (pinId: string) => void;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function PinListItem({ pin, onClick }: PinListItemProps) {
  return (
    <button
      onClick={() => onClick(pin.id)}
      className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-zinc-50 transition-colors"
    >
      {pin.cover_photo && (
        <div className="relative h-14 w-14 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
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
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{pin.place_name}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
          {pin.author && <span>{pin.author.display_name}</span>}
          <span className="flex items-center gap-0.5">
            <Heart className="h-3 w-3" /> {pin.like_count}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageCircle className="h-3 w-3" /> {pin.comment_count}
          </span>
        </div>
      </div>
    </button>
  );
}
