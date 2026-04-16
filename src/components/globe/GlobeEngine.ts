/**
 * GlobeEngine 인터페이스 — 3D 지구 엔진 추상화
 * 현재 구현: CesiumJS
 * 엔진 교체 시 이 인터페이스를 구현하는 새 클래스를 만들고 DynamicGlobe에서 swap
 */
export interface GlobePinMarker {
  id: string
  lat: number
  lng: number
  title: string
  visitedAt: string
}

export interface GlobeOptions {
  onPinClick?: (pinId: string) => void
  onMapClick?: (lat: number, lng: number) => void
}
