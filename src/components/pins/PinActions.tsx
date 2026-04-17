'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deletePin } from '@/lib/pins/actions'

interface PinActionsProps {
  pinId: string
}

export function PinActions({ pinId }: PinActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('핀을 삭제할까요? 이 작업은 되돌릴 수 없습니다.')) return

    startTransition(async () => {
      try {
        await deletePin(pinId)
        toast.success('핀이 삭제됐습니다')
        router.push('/map')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '삭제에 실패했습니다')
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/pins/${pinId}/edit`)}
        disabled={isPending}
      >
        <Pencil className="h-3.5 w-3.5 mr-1" />
        수정
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
      >
        <Trash2 className="h-3.5 w-3.5 mr-1" />
        삭제
      </Button>
    </div>
  )
}
