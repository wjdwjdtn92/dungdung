'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MapPin, X } from 'lucide-react';
import { DynamicGlobe } from '@/components/globe/DynamicGlobe';
import { DynamicLeaflet } from '@/components/globe/DynamicLeaflet';
import { MapModeToggle, type MapMode } from '@/components/map/MapModeToggle';
import { SidePanel, type PanelView } from '@/components/map/SidePanel';
import { PanelPinDetail } from '@/components/map/PanelPinDetail';
import { cn } from '@/lib/utils';
import type { GlobePinMarker } from '@/components/globe/GlobeEngine';

interface PinData {
  id: string;
  title: string;
  lat: number;
  lng: number;
  visited_at: string;
  place_name: string;
  tags: string[];
  trip: { id: string; title: string } | null;
}

interface UserMapClientProps {
  profile: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  pins: PinData[];
  allTags: string[];
  trips: Array<{ id: string; title: string }>;
  currentUserId: string | null;
}

export function UserMapClient({ profile, pins, allTags, trips, currentUserId }: UserMapClientProps) {
  const [mapMode, setMapMode] = useState<MapMode>('3d');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [panelView, setPanelView] = useState<PanelView>({ type: 'feed' }); // feed = 목록 뷰 재사용

  // 필터 적용
  const filteredPins = useMemo(() => {
    return pins.filter((p) => {
      if (selectedTag && !p.tags.includes(selectedTag)) return false;
      if (selectedTripId && p.trip?.id !== selectedTripId) return false;
      return true;
    });
  }, [pins, selectedTag, selectedTripId]);

  const markers: GlobePinMarker[] = filteredPins.map((p) => ({
    id: p.id,
    title: p.title,
    lat: p.lat,
    lng: p.lng,
    visitedAt: p.visited_at,
  }));

  const handlePinClick = useCallback((pinId: string) => {
    setPanelView({ type: 'pin-detail', pinId });
  }, []);

  const handleBack = useCallback(() => {
    setPanelView({ type: 'feed' });
  }, []);

  const handleClose = useCallback(() => {
    setPanelView({ type: 'closed' });
  }, []);

  const isListView = panelView.type === 'feed';

  return (
    <div className="fixed inset-0 bg-zinc-950">
      {/* 지도 */}
      {mapMode === '3d' ? (
        <DynamicGlobe pins={markers} onPinClick={handlePinClick} className="absolute inset-0" />
      ) : (
        <DynamicLeaflet pins={markers} onPinClick={handlePinClick} className="absolute inset-0" />
      )}

      {/* 사이드패널 */}
      <SidePanel
        view={panelView}
        onClose={handleClose}
        onBack={panelView.type === 'pin-detail' ? handleBack : undefined}
      >
        {isListView && (
          <div className="space-y-4 pb-6">
            {/* 프로필 헤더 */}
            <div className="flex items-center gap-3 px-4 pt-3">
              <div className="h-10 w-10 rounded-full bg-zinc-200 overflow-hidden shrink-0">
                {profile.avatar_url && (
                  <Image src={profile.avatar_url} alt={profile.display_name} width={40} height={40} />
                )}
              </div>
              <div>
                <p className="font-semibold text-zinc-900">{profile.display_name}</p>
                <p className="text-xs text-zinc-400">@{profile.username} · 핀 {filteredPins.length}개</p>
              </div>
            </div>

            {/* 태그 필터 */}
            {allTags.length > 0 && (
              <div className="px-4">
                <p className="text-xs font-medium text-zinc-500 mb-2">태그</p>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                        selectedTag === tag
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
                      )}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 트립 필터 */}
            {trips.length > 0 && (
              <div className="px-4">
                <p className="text-xs font-medium text-zinc-500 mb-2">여행</p>
                <div className="flex flex-wrap gap-1.5">
                  {trips.map((trip) => (
                    <button
                      key={trip.id}
                      onClick={() => setSelectedTripId(selectedTripId === trip.id ? null : trip.id)}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                        selectedTripId === trip.id
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
                      )}
                    >
                      {trip.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 활성 필터 초기화 */}
            {(selectedTag || selectedTripId) && (
              <div className="px-4">
                <button
                  onClick={() => { setSelectedTag(null); setSelectedTripId(null); }}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-3 w-3" />필터 초기화
                </button>
              </div>
            )}

            {/* 핀 목록 */}
            <div className="px-4 space-y-1">
              {filteredPins.length === 0 ? (
                <p className="text-center py-8 text-sm text-zinc-400">
                  {selectedTag || selectedTripId ? '해당 필터에 맞는 핀이 없어요' : '공개된 핀이 없어요'}
                </p>
              ) : (
                filteredPins.map((pin) => (
                  <button
                    key={pin.id}
                    onClick={() => handlePinClick(pin.id)}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 text-left transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{pin.title}</p>
                      <p className="text-xs text-zinc-400 truncate">{pin.place_name}</p>
                      {pin.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {pin.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] text-zinc-400">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {panelView.type === 'pin-detail' && (
          <PanelPinDetail
            pinId={panelView.pinId}
            currentUserId={currentUserId}
          />
        )}
      </SidePanel>

      {/* 3D/2D 토글 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 sm:bottom-auto sm:top-4 sm:left-auto sm:right-1/2 sm:translate-x-1/2">
        <MapModeToggle mode={mapMode} onChange={setMapMode} />
      </div>

      {/* 뒤로가기 */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          href={`/${profile.username}`}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white text-sm font-medium text-zinc-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          프로필
        </Link>
      </div>
    </div>
  );
}
