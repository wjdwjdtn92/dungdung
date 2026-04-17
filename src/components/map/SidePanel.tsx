'use client';

import { useState } from 'react';
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

export function SidePanel({ view, onClose, onBack, children }: SidePanelProps) {
  const isOpen = view.type !== 'closed';
  const [isDragging, setIsDragging] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const hasBack =
    view.type === 'pin-detail' || view.type === 'user-profile';

  return (
    <>
      {/* 데스크탑 사이드패널 */}
      <div
        className={cn(
          'hidden sm:flex flex-col absolute top-0 left-0 bottom-0 z-20 w-[380px] bg-white border-r border-zinc-200 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* 패널 헤더 */}
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

        {/* 패널 콘텐츠 */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>

      {/* 모바일 하단 시트
          absolute 사용: 부모가 fixed inset-0이므로 absolute = 뷰포트 기준.
          fixed-in-fixed 구조는 iOS Safari에서 터치 이벤트 전달 버그를 유발함. */}
      <div
        className={cn(
          'sm:hidden absolute left-0 right-0 bottom-0 z-20 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-transform duration-300',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          mobileExpanded ? 'top-16' : 'top-[60%]',
        )}
      >
        {/* 드래그 핸들 */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => {
            setIsDragging(false);
          }}
          onClick={() => setMobileExpanded(!mobileExpanded)}
        >
          <div className="w-10 h-1 rounded-full bg-zinc-300" />
        </div>

        {/* 모바일 헤더 */}
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="flex items-center gap-2">
            {hasBack && onBack && (
              <button onClick={onBack} className="p-1 text-zinc-500">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="overflow-y-auto px-4 pb-safe" style={{ maxHeight: 'calc(100% - 60px)' }}>
          {children}
        </div>
      </div>
    </>
  );
}
