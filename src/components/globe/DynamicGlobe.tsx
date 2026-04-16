/**
 * CesiumJS 동적 로드 래퍼 (bundle-dynamic-imports 규칙)
 * SSR 완전 비활성화 — 이 파일 자체도 CSR 전용 페이지에서만 import
 */
import dynamic from 'next/dynamic'
import { GlobeSkeleton } from './GlobeSkeleton'
import type { GlobeOptions, GlobePinMarker } from './GlobeEngine'

export interface DynamicGlobeProps extends GlobeOptions {
  pins?: GlobePinMarker[]
  className?: string
}

const CesiumGlobe = dynamic(
  () => import('./CesiumGlobe').then((m) => m.CesiumGlobe),
  {
    ssr: false,
    loading: () => <GlobeSkeleton />,
  }
)

export function DynamicGlobe(props: DynamicGlobeProps) {
  return <CesiumGlobe {...props} />
}
