import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '페이지를 찾을 수 없습니다' };

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4">
      <h1 className="text-6xl font-bold text-zinc-200">404</h1>
      <p className="mt-4 text-lg text-zinc-600">페이지를 찾을 수 없습니다</p>
      <Link
        href="/"
        className="mt-6 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
