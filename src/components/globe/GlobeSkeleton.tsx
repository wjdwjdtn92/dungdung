/** CesiumJS 로딩 전 전체화면 스켈레톤 — LCP 확보용 */
export function GlobeSkeleton() {
  // pointer-events-none: 로딩 중 스켈레톤이 UI 클릭을 막지 않도록
  return <div className="absolute inset-0 bg-[#0a0f1e] pointer-events-none" aria-label="지구 로딩 중" />;
}
