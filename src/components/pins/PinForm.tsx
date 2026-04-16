'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import type { Resolver } from 'react-hook-form'
import { pinSchema, type PinFormValues, type PhotoPreview } from '@/types/pin'
import { createPin, createPinPhotos } from '@/lib/pins/actions'
import { createClient } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LocationPicker } from './LocationPicker'
import { PhotoUploader } from './PhotoUploader'
import { TagInput } from './TagInput'
import { VisibilitySelect } from './VisibilitySelect'

export function PinForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [photos, setPhotos] = useState<PhotoPreview[]>([])

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PinFormValues>({
    resolver: zodResolver(pinSchema) as Resolver<PinFormValues>,
    defaultValues: { visibility: 'public', tags: [], place_name: '' },
  })

  const [placeName, lat, lng, tags, visibility] = watch(['place_name', 'lat', 'lng', 'tags', 'visibility'])

  function handleLocationSelect(result: { placeName: string; lat: number; lng: number; countryCode?: string; city?: string }) {
    setValue('place_name', result.placeName, { shouldValidate: true })
    setValue('lat', result.lat, { shouldValidate: true })
    setValue('lng', result.lng, { shouldValidate: true })
    if (result.countryCode) setValue('country_code', result.countryCode)
    if (result.city) setValue('city', result.city)
  }

  function handleExifLocation(exifLat: number, exifLng: number) {
    // 이미 위치가 설정된 경우 덮어쓰지 않음
    if (lat) return
    toast.info('사진 GPS 정보로 위치가 자동 설정됐습니다. 검색으로 변경할 수 있어요.')
    setValue('lat', exifLat, { shouldValidate: true })
    setValue('lng', exifLng, { shouldValidate: true })
    setValue('place_name', `${exifLat.toFixed(5)}, ${exifLng.toFixed(5)}`)
  }

  const onSubmit = (values: PinFormValues) => {
    startTransition(async () => {
      try {
        // 1. 핀 생성
        const pin = await createPin(values)

        // 2. 사진 업로드
        if (photos.length > 0) {
          const supabase = createClient()
          const uploadedPhotos: Array<{ storagePath: string; order: number; exifLat?: number; exifLng?: number }> = []

          await Promise.allSettled(
            photos.map(async (photo, index) => {
              const file = photo.compressed ?? photo.file
              const ext = 'webp'
              const path = `${pin.user_id}/${pin.id}/${Date.now()}-${index}.${ext}`

              const { error } = await supabase.storage.from('pin-photos').upload(path, file, {
                contentType: 'image/webp',
                upsert: false,
              })

              if (!error) {
                uploadedPhotos.push({
                  storagePath: path,
                  order: index,
                  exifLat: photo.exifLat,
                  exifLng: photo.exifLng,
                })
              }
            })
          )

          if (uploadedPhotos.length > 0) {
            await createPinPhotos(pin.id, uploadedPhotos)
          }
        }

        toast.success('핀이 생성됐습니다!')
        router.push(`/pins/${pin.id}`)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '핀 생성에 실패했습니다')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 사진 */}
      <div className="space-y-1.5">
        <Label>사진 <span className="text-zinc-400 font-normal">(선택, 최대 10장)</span></Label>
        <PhotoUploader
          photos={photos}
          onChange={setPhotos}
          onExifLocation={handleExifLocation}
        />
      </div>

      {/* 제목 */}
      <div className="space-y-1.5">
        <Label htmlFor="title">제목 <span className="text-red-500">*</span></Label>
        <Input id="title" {...register('title')} placeholder="이 장소의 제목" />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      {/* 위치 */}
      <div className="space-y-1.5">
        <Label>장소 <span className="text-red-500">*</span></Label>
        <LocationPicker
          placeName={placeName}
          lat={lat}
          lng={lng}
          onSelect={handleLocationSelect}
          error={errors.place_name?.message}
        />
      </div>

      {/* 내용 */}
      <div className="space-y-1.5">
        <Label htmlFor="body">내용 <span className="text-zinc-400 font-normal">(선택)</span></Label>
        <Textarea id="body" {...register('body')} placeholder="이 장소에서의 기억을 남겨보세요" rows={5} />
      </div>

      {/* 태그 */}
      <div className="space-y-1.5">
        <Label>태그</Label>
        <TagInput value={tags ?? []} onChange={(t) => setValue('tags', t)} />
      </div>

      {/* 공개 범위 */}
      <div className="space-y-1.5">
        <Label>공개 범위</Label>
        <VisibilitySelect
          value={visibility ?? 'public'}
          onChange={(v) => setValue('visibility', v)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />저장 중...</> : '핀 만들기'}
      </Button>
    </form>
  )
}
