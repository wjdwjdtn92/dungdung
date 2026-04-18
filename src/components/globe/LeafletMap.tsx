'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import type { GlobeOptions, GlobePinMarker } from './GlobeEngine';

interface LeafletMapProps extends GlobeOptions {
  pins?: GlobePinMarker[];
  className?: string;
}

export function LeafletMap({ pins = [], onPinClick, className }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    async function init() {
      const L = await import('leaflet');

      if (destroyed || !containerRef.current) return;

      // 기본 마커 아이콘 경로 수정 (Leaflet + bundler 이슈)
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // tap: false — Leaflet 커스텀 탭 에뮬레이터 비활성화 (모바일 오버레이 UI 클릭 충돌 방지)
      // @types/leaflet에 tap 옵션이 없어 타입 캐스팅 필요
      // 위도: ±85.051129° (Web Mercator 한계, 극지방 회색 방지)
      // 경도: ±18000° (50 world copies) → 실질적으로 무한 좌우 스크롤 허용
      const worldBounds = L.latLngBounds(
        L.latLng(-85.051129, -18000),
        L.latLng(85.051129, 18000),
      );

      const mapOptions = {
        center: [20, 0] as L.LatLngExpression,
        zoom: 2,
        minZoom: 2,
        zoomControl: false,
        maxBounds: worldBounds,
        maxBoundsViscosity: 1.0, // 위아래 경계에서 딱 멈춤
        worldCopyJump: true,      // 경도 끝 도달 시 반대편으로 이어지도록
        tap: false,
      };
      const map = L.map(containerRef.current, mapOptions as L.MapOptions);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // 컨테이너 크기를 정확히 반영 — 비동기 마운트 후 사이즈 재계산
      requestAnimationFrame(() => map.invalidateSize());

      // 줌 컨트롤 우측 하단
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapRef.current = map;

      // 핀 추가
      addMarkers(L, map, pins, onPinClick);
    }

    init().catch(console.error);

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 핀 변경 시 마커 업데이트
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    async function updateMarkers() {
      const L = await import('leaflet');
      // 기존 마커 제거
      map!.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map!.removeLayer(layer);
        }
      });
      addMarkers(L, map!, pins, onPinClick);
    }

    updateMarkers().catch(console.error);
  }, [pins, onPinClick]);

  return (
    // isolate: Leaflet 내부 z-index(최대 1000)가 외부 UI와 충돌하지 않도록 stacking context 분리
    <div ref={containerRef} className={cn(className ?? 'absolute inset-0', 'isolate')} aria-label="2D 지도" />
  );
}

function addMarkers(
  L: typeof import('leaflet'),
  map: import('leaflet').Map,
  pins: GlobePinMarker[],
  onPinClick?: (pinId: string) => void,
) {
  const pinIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
      <path fill="#ef4444" stroke="white" stroke-width="1.5"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

  for (const pin of pins) {
    const marker = L.marker([pin.lat, pin.lng], { icon: pinIcon }).addTo(map);
    marker.bindTooltip(pin.title, {
      direction: 'top',
      offset: [0, -30],
      className: 'text-xs font-medium',
    });
    if (onPinClick) {
      marker.on('click', () => onPinClick(pin.id));
    }
  }
}
