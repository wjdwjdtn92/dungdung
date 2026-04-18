import { redirect } from 'next/navigation';

// /map은 /로 통합 — 실제 구현은 src/app/page.tsx
export default function MapPage() {
  redirect('/');
}
