'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
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

      const map = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

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
    <div ref={containerRef} className={className ?? 'absolute inset-0'} aria-label="2D 지도" />
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
