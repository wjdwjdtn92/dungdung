'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DynamicGlobe } from '@/components/globe/DynamicGlobe';
import type { GlobePinMarker } from '@/components/globe/GlobeEngine';

interface MapClientProps {
  pins: GlobePinMarker[];
}

export function MapClient({ pins }: MapClientProps) {
  const router = useRouter();

  function handlePinClick(pinId: string) {
    router.push(`/pins/${pinId}`);
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 overflow-hidden">
      {/* 3D 지구 — fixed inset-0로 body 레이아웃 영향 완전 차단 */}
      <DynamicGlobe pins={pins} onPinClick={handlePinClick} className="absolute inset-0" />

      {/* 핀 개수 배지 */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full">
        핀 {pins.length}개
      </div>

      {/* 새 핀 만들기 버튼 */}
      <Link
        href="/pins/new"
        className="absolute bottom-8 right-6 z-10 flex items-center gap-2 bg-white text-zinc-900 font-medium text-sm px-4 py-2.5 rounded-full shadow-lg hover:bg-zinc-100 transition-colors"
      >
        <Plus className="h-4 w-4" />핀 만들기
      </Link>
    </div>
  );
}
