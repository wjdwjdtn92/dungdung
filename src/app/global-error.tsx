'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4">
        <h1 className="text-6xl font-bold text-zinc-200">500</h1>
        <p className="mt-4 text-lg text-zinc-600">문제가 발생했습니다</p>
        <button
          onClick={reset}
          className="mt-6 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
