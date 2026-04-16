import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-zinc-50">
      <div className="text-center">
        <p className="text-zinc-500 text-sm">로그인됨: {user.email}</p>
        <h1 className="text-2xl font-bold mt-2">피드 (준비 중)</h1>
      </div>
    </main>
  )
}
