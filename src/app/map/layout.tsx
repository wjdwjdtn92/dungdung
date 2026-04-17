// /map은 전체화면 지구 페이지 — 일반 레이아웃 스크롤/flex 영향 없도록 격리
export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
