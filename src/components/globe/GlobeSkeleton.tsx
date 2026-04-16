/** CesiumJS 로딩 전 표시되는 정적 스켈레톤 — LCP 확보용 */
export function GlobeSkeleton() {
  return (
    <div
      className="w-full h-full bg-[#0a0f1e] flex items-center justify-center"
      aria-label="지구 로딩 중"
    >
      <div className="rounded-full bg-[#1a2744] animate-pulse"
        style={{ width: 'min(80vw, 80vh)', height: 'min(80vw, 80vh)' }}
      />
    </div>
  )
}
