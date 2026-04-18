'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PanelView =
  | { type: 'closed' }
  | { type: 'feed' }
  | { type: 'explore' }
  | { type: 'my-pins' }
  | { type: 'pin-detail'; pinId: string }
  | { type: 'user-profile'; username: string };

interface SidePanelProps {
  view: PanelView;
  onClose: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}

type SnapPoint = 'half' | 'full';

// 스냅 위치 (뷰포트 높이 대비 %)
const SNAP = { full: 0.08, half: 0.45 } as const;

export function SidePanel({ view, onClose, onBack, children }: SidePanelProps) {
  const isOpen = view.type !== 'closed';

  const hasBack = view.type === 'pin-detail' || view.type === 'user-profile';

  // 모바일 바텀 시트 드래그
  const [snapPoint, setSnapPoint] = useState<SnapPoint>('half');
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // view가 바뀌면 half로 리셋
  useEffect(() => {
    setSnapPoint('half');
  }, [view.type]);

  // snapPointRef: 드래그 핸들러 클로저 내 stale state 방지
  const snapPointRef = useRef<SnapPoint>('half');

  const setSnap = useCallback((s: SnapPoint) => {
    snapPointRef.current = s;
    setSnapPoint(s);
  }, []);

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    let startY = 0;
    let lastY = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      lastY = startY;
      tracking = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking) return;
      // passive: false로 등록 → e.preventDefault() 가능
      // iOS pull-to-refresh / 페이지 스크롤 방지
      e.preventDefault();
      lastY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      if (!tracking) return;
      tracking = false;
      const deltaY = lastY - startY;
      // 30px 이상 이동한 경우만 스냅 전환 (tap과 구분)
      if (deltaY < -30) {
        setSnap('full');
      } else if (deltaY > 30) {
        if (snapPointRef.current === 'full') setSnap('half');
        else onCloseRef.current();
      }
    };

    const onTouchCancel = () => {
      tracking = false;
    };

    // touchstart는 passive:true — 스크롤 성능 유지
    // touchmove는 passive:false — e.preventDefault() 필수 (pull-to-refresh 차단)
    handle.addEventListener('touchstart', onTouchStart, { passive: true });
    handle.addEventListener('touchmove', onTouchMove, { passive: false });
    handle.addEventListener('touchend', onTouchEnd, { passive: true });
    handle.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      handle.removeEventListener('touchstart', onTouchStart);
      handle.removeEventListener('touchmove', onTouchMove);
      handle.removeEventListener('touchend', onTouchEnd);
      handle.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [setSnap]);

  const snapTopClass = snapPoint === 'full' ? 'top-[8%]' : 'top-[45%]';

  return (
    <>
      {/* 데스크탑 사이드패널 */}
      <div
        className={cn(
          'hidden sm:flex flex-col absolute top-0 left-0 bottom-0 z-20 w-[380px] bg-white border-r border-zinc-200 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2">
            {hasBack && onBack && (
              <button
                onClick={onBack}
                className="p-1 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <span className="text-lg font-bold text-zinc-900">둥둥</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>

      {/* 모바일 드래그 바텀 시트
          - absolute: 부모가 fixed inset-0이므로 뷰포트 기준 동일. fixed-in-fixed iOS 버그 방지
          - top-[8%]/top-[45%]: 드래그로 스냅 전환
          - translate-y: 열기/닫기 슬라이드 애니메이션 */}
      <div
        ref={sheetRef}
        className={cn(
          'sm:hidden absolute left-0 right-0 bottom-0 z-20 bg-white rounded-t-2xl',
          'shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-[top,transform] duration-300',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          snapTopClass,
        )}
      >
        {/* 드래그 영역: 핸들 + 헤더 (터치 감지 영역 확장)
            touch-action은 CSS로 걸지 않음 — touch-none(touch-action:none) + passive:false 조합이
            iOS Safari에서 터치 시퀀스를 취소시키는 버그 유발. e.preventDefault()만 사용. */}
        <div ref={handleRef} className="select-none">
          <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
            <div className="w-10 h-1 rounded-full bg-zinc-300" />
          </div>
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              {hasBack && onBack && (
                <button
                  onClick={onBack}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="p-1 text-zinc-500"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              onTouchEnd={(e) => e.stopPropagation()}
              className="p-1 text-zinc-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="overflow-y-auto px-4 pb-safe" style={{ maxHeight: 'calc(100% - 72px)' }}>
          {children}
        </div>
      </div>
    </>
  );
}
