import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PinForm } from '@/components/pins/PinForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '핀 만들기' }

export default async function NewPinPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">핀 만들기</h1>
          <p className="text-sm text-zinc-500 mt-1">여행의 순간을 지도 위에 남겨보세요</p>
        </div>
        <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-6">
          <PinForm />
        </div>
      </div>
    </div>
  )
}
