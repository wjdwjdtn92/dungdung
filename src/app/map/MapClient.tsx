'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Menu, Settings, Bell } from 'lucide-react';
import { LoginButton } from '@/components/auth/LoginButton';
import { useUIStore } from '@/store/ui';
import { DynamicGlobe } from '@/components/globe/DynamicGlobe';
import { DynamicLeaflet } from '@/components/globe/DynamicLeaflet';
import type { GlobePinMarker } from '@/components/globe/GlobeEngine';
import { MapModeToggle, type MapMode } from '@/components/map/MapModeToggle';
import { SidePanel, type PanelView } from '@/components/map/SidePanel';
import { PanelTabs, type TabType } from '@/components/map/PanelTabs';
import { PinListItem, type PinListData } from '@/components/map/PinListItem';
import { PanelPinDetail } from '@/components/map/PanelPinDetail';
import { PanelUserProfile } from '@/components/map/PanelUserProfile';
import { RealtimeNotifications } from '@/components/notifications/RealtimeNotifications';

interface MapClientProps {
  myPins: GlobePinMarker[];
  myPinList: PinListData[];
  feedPins: PinListData[];
  feedMarkers: GlobePinMarker[];
  explorePins: PinListData[];
  exploreMarkers: GlobePinMarker[];
  currentUserId: string | null;
  user: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  unreadCount: number;
}

export function MapClient({
  myPins,
  myPinList,
  feedPins,
  feedMarkers,
  explorePins,
  exploreMarkers,
  currentUserId,
  user,
  unreadCount: initialUnreadCount,
}: MapClientProps) {
  const isLoggedIn = !!user;
  const defaultTab: TabType = isLoggedIn ? 'my-pins' : 'explore';

  const [panelView, setPanelView] = useState<PanelView>({ type: defaultTab });
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [userPinMarkers, setUserPinMarkers] = useState<GlobePinMarker[] | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>('3d');

  // 현재 뷰에 따라 지도에 표시할 핀 결정
  const displayPins = (() => {
    if (panelView.type === 'user-profile' && userPinMarkers) {
      return userPinMarkers;
    }
    switch (activeTab) {
      case 'feed':
        return feedMarkers;
      case 'explore':
        return exploreMarkers;
      case 'my-pins':
      default:
        return myPins;
    }
  })();

  const listData = (() => {
    switch (activeTab) {
      case 'feed':
        return feedPins;
      case 'explore':
        return explorePins;
      case 'my-pins':
      default:
        return myPinList;
    }
  })();

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setPanelView({ type: tab });
    setUserPinMarkers(null);
  }, []);

  const handlePinClick = useCallback((pinId: string) => {
    setPanelView({ type: 'pin-detail', pinId });
  }, []);

  const handleAuthorClick = useCallback((username: string) => {
    setPanelView({ type: 'user-profile', username });
  }, []);

  const handleUserPinsLoaded = useCallback((markers: GlobePinMarker[]) => {
    setUserPinMarkers(markers);
  }, []);

  const handleBack = useCallback(() => {
    setPanelView({ type: activeTab });
    setUserPinMarkers(null);
  }, [activeTab]);

  const handleClose = useCallback(() => {
    setPanelView({ type: 'closed' });
    setUserPinMarkers(null);
  }, []);

  const handleOpenPanel = useCallback(() => {
    setPanelView({ type: activeTab });
  }, [activeTab]);

  const openLoginModal = useUIStore((s) => s.openLoginModal);
  const unreadCount = useUIStore((s) => s.unreadCount);

  const isListView =
    panelView.type === 'feed' || panelView.type === 'explore' || panelView.type === 'my-pins';

  return (
    <div className="fixed inset-0 bg-zinc-950">
      {/* 알림 Realtime 구독 (로그인 사용자만) */}
      {user && currentUserId && (
        <RealtimeNotifications userId={currentUserId} initialUnreadCount={initialUnreadCount} />
      )}

      {/* 지도 */}
      {mapMode === '3d' ? (
        <DynamicGlobe pins={displayPins} onPinClick={handlePinClick} className="absolute inset-0" />
      ) : (
        <DynamicLeaflet pins={displayPins} onPinClick={handlePinClick} className="absolute inset-0" />
      )}

      {/* 사이드패널 */}
      <SidePanel
        view={panelView}
        onClose={handleClose}
        onBack={
          panelView.type === 'pin-detail' || panelView.type === 'user-profile'
            ? handleBack
            : undefined
        }
      >
        {isListView && (
          <>
            <PanelTabs active={activeTab} onChange={handleTabChange} isLoggedIn={isLoggedIn} />
            <div className="p-3 space-y-1">
              {listData.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-sm">
                  {activeTab === 'my-pins' && '아직 핀이 없어요. 첫 핀을 만들어보세요!'}
                  {activeTab === 'feed' && '팔로우한 사람의 핀이 여기에 나타나요'}
                  {activeTab === 'explore' && '공개된 핀이 없어요'}
                </div>
              ) : (
                listData.map((pin) => (
                  <PinListItem key={pin.id} pin={pin} onClick={handlePinClick} />
                ))
              )}
            </div>
          </>
        )}

        {panelView.type === 'pin-detail' && (
          <PanelPinDetail
            pinId={panelView.pinId}
            currentUserId={currentUserId}
            onAuthorClick={handleAuthorClick}
          />
        )}

        {panelView.type === 'user-profile' && (
          <PanelUserProfile
            username={panelView.username}
            currentUserId={currentUserId}
            onPinClick={handlePinClick}
            onPinsLoaded={handleUserPinsLoaded}
          />
        )}
      </SidePanel>

      {/* 3D/2D 토글 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 sm:bottom-auto sm:top-4 sm:left-auto sm:right-1/2 sm:translate-x-1/2">
        <MapModeToggle mode={mapMode} onChange={setMapMode} />
      </div>

      {/* 상단 우측 컨트롤 */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {isLoggedIn ? (
          <>
            <Link
              href="/notifications"
              className="relative p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
            >
              <Bell className="h-4 w-4 text-zinc-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/settings"
              className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
            >
              <Settings className="h-4 w-4 text-zinc-700" />
            </Link>
            <Link
              href={`/${user!.username}`}
              className="h-9 w-9 rounded-full bg-zinc-200 overflow-hidden shadow-md"
            >
              {user!.avatar_url && (
                <Image src={user!.avatar_url} alt={user!.display_name} width={36} height={36} />
              )}
            </Link>
          </>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md overflow-hidden">
            <LoginButton size="sm" />
          </div>
        )}
      </div>

      {/* 패널 토글 (닫혀있을 때) */}
      {panelView.type === 'closed' && (
        <button
          onClick={handleOpenPanel}
          className="absolute top-4 left-4 z-10 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
        >
          <Menu className="h-5 w-5 text-zinc-700" />
        </button>
      )}

      {/* 새 핀 만들기 */}
      {isLoggedIn ? (
        <Link
          href="/pins/new"
          className="absolute bottom-8 right-6 z-10 flex items-center gap-2 bg-white text-zinc-900 font-medium text-sm px-4 py-2.5 rounded-full shadow-lg hover:bg-zinc-100 transition-colors"
        >
          <Plus className="h-4 w-4" />핀 만들기
        </Link>
      ) : (
        <button
          onClick={openLoginModal}
          className="absolute bottom-8 right-6 z-10 flex items-center gap-2 bg-white text-zinc-900 font-medium text-sm px-4 py-2.5 rounded-full shadow-lg hover:bg-zinc-100 transition-colors"
        >
          <Plus className="h-4 w-4" />핀 만들기
        </button>
      )}
    </div>
  );
}
