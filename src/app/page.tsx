import { createClient } from '@/lib/supabase/server'
import { LoginButton } from '@/components/auth/LoginButton'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 로그인 상태면 피드로
  if (user) redirect('/feed')

  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-[#0a0f1e]">
      <div className="flex flex-col items-center gap-8 text-center px-6">
        {/* 로고 */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-5xl">
            🌍
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">둥둥</h1>
          <p className="text-zinc-400 text-lg max-w-xs leading-relaxed">
            3D 지구본 위에 나만의<br />여행 지도를 완성하세요
          </p>
        </div>

        {/* 로그인 */}
        <div className="flex flex-col items-center gap-3">
          <LoginButton />
          <p className="text-zinc-600 text-sm">
            로그인하면 이용약관 및 개인정보처리방침에 동의하게 됩니다
          </p>
        </div>
      </div>
    </main>
  )
}
