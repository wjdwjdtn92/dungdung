'use client'

import { useEffect, useRef } from 'react'
import type { DynamicGlobeProps } from './DynamicGlobe'

/**
 * CesiumJS 실제 구현체
 * TODO: cesium 패키지 설치 후 구현 (`npm install cesium`)
 * - Viewer 초기화
 * - pin markers 렌더링
 * - flyTo 애니메이션
 * - 클릭 이벤트 처리
 */
export function CesiumGlobe({ pins = [], onPinClick, onMapClick, className }: DynamicGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // CesiumJS Viewer 초기화 예정
    // const viewer = new Cesium.Viewer(containerRef.current!, { ... })
    // return () => viewer.destroy()
  }, [])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
      aria-label="3D 지구 지도"
    />
  )
}
