'use client';

/**
 * CesiumJS 3D 지구 컴포넌트 (CSR 전용)
 * DynamicGlobe에서 next/dynamic { ssr: false }로 로드됨
 *
 * webpack 번들링 대신 /public/cesium/Cesium.js를 런타임 script 태그로 로드.
 * 이유: CesiumJS 소스의 octal escape sequence가 webpack strict mode 번들에서 SyntaxError 유발
 */
import { useEffect, useRef } from 'react';
import type { GlobeOptions, GlobePinMarker } from './GlobeEngine';

interface CesiumGlobeProps extends GlobeOptions {
  pins?: GlobePinMarker[];
  className?: string;
}

/** /cesium/Cesium.js + CSS를 한 번만 로드하는 싱글턴 Promise */
let cesiumLoadPromise: Promise<typeof import('cesium')> | null = null;

function loadCesium(): Promise<typeof import('cesium')> {
  if (cesiumLoadPromise) return cesiumLoadPromise;

  cesiumLoadPromise = new Promise((resolve, reject) => {
    // CSS
    if (!document.querySelector('link[href="/cesium/Widgets/widgets.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/cesium/Widgets/widgets.css';
      document.head.appendChild(link);
    }

    // 이미 로드된 경우
    if ((window as // eslint-disable-next-line @typescript-eslint/no-explicit-any
any).Cesium) {
      resolve((window as // eslint-disable-next-line @typescript-eslint/no-explicit-any
any).Cesium as typeof import('cesium'));
      return;
    }

    const script = document.createElement('script');
    script.src = '/cesium/Cesium.js';
    script.async = true;
    script.onload = () => resolve((window as // eslint-disable-next-line @typescript-eslint/no-explicit-any
any).Cesium as typeof import('cesium'));
    script.onerror = () => reject(new Error('Failed to load /cesium/Cesium.js'));
    document.head.appendChild(script);
  });

  return cesiumLoadPromise;
}

export function CesiumGlobe({ pins = [], onPinClick, onMapClick, className }: CesiumGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<import('cesium').Viewer | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    viewerRef.current = null;

    let destroyed = false;

    async function init() {
      const Cesium = await loadCesium();

      const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
      if (ionToken) Cesium.Ion.defaultAccessToken = ionToken;

      if (destroyed || !containerRef.current) return;

      const viewer = new Cesium.Viewer(containerRef.current, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        creditContainer: (() => {
          const el = document.createElement('div');
          el.style.display = 'none';
          document.body.appendChild(el);
          return el;
        })(),
      });

      viewerRef.current = viewer;
      viewer.scene.globe.enableLighting = true;

      requestAnimationFrame(() => {
        if (!viewer.isDestroyed()) viewer.resize();
      });

      const ro = new ResizeObserver(() => {
        if (!viewer.isDestroyed()) viewer.resize();
      });
      ro.observe(containerRef.current!);
      resizeObserverRef.current = ro;

      addPins(Cesium, viewer, pins, onPinClick);

      if (onMapClick) {
        const mapHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        mapHandler.setInputAction((e: { position: import('cesium').Cartesian2 }) => {
          const picked = viewer.scene.pick(e.position);
          if (Cesium.defined(picked)) return;
          const ray = viewer.camera.getPickRay(e.position);
          if (!ray) return;
          const pos = viewer.scene.globe.pick(ray, viewer.scene);
          if (!pos) return;
          const carto = Cesium.Cartographic.fromCartesian(pos);
          onMapClick(Cesium.Math.toDegrees(carto.latitude), Cesium.Math.toDegrees(carto.longitude));
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }

      if (onPinClick) {
        viewer.screenSpaceEventHandler.setInputAction(
          (e: { position: import('cesium').Cartesian2 }) => {
            const picked = viewer.scene.pick(e.position);
            const entityId = picked?.id?.id;
            if (typeof entityId === 'string') onPinClick(entityId);
          },
          Cesium.ScreenSpaceEventType.LEFT_CLICK,
        );
      }
    }

    init().catch(console.error);

    return () => {
      destroyed = true;
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    async function updatePins() {
      const Cesium = await loadCesium();
      viewer!.entities.removeAll();
      addPins(Cesium, viewer!, pins, onPinClick);
    }

    updatePins().catch(console.error);
  }, [pins, onPinClick]);

  return (
    <div ref={containerRef} className={className ?? 'absolute inset-0'} aria-label="3D 지구 지도" />
  );
}

function addPins(
  Cesium: typeof import('cesium'),
  viewer: import('cesium').Viewer,
  pins: GlobePinMarker[],
  onPinClick?: (pinId: string) => void,
) {
  for (const pin of pins) {
    viewer.entities.add({
      id: pin.id,
      position: Cesium.Cartesian3.fromDegrees(pin.lng, pin.lat),
      billboard: {
        image: createPinSvgDataUrl(),
        width: 28,
        height: 28,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
      label: {
        text: pin.title,
        font: '12px system-ui, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -32),
        showBackground: true,
        backgroundColor: new Cesium.Color(0, 0, 0, 0.65),
        backgroundPadding: new Cesium.Cartesian2(6, 3),
      },
    });
  }
  void onPinClick;
}

function createPinSvgDataUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
    <path fill="#ef4444" stroke="white" stroke-width="1.5"
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5" fill="white"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
