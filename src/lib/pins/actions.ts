'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { PinFormValues } from '@/types/pin'

export async function createPin(values: PinFormValues) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { tags, ...pinValues } = values

  // 핀 생성 (visited_at은 서버에서 오늘 날짜로 자동 설정)
  const today = new Date().toISOString().split('T')[0]
  const { data: pin, error } = await supabase
    .from('pins')
    .insert({ ...pinValues, user_id: user.id, visited_at: today })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // 태그 처리 (upsert → 연결)
  if (tags.length > 0) {
    const tagNames = tags.map((t) => t.toLowerCase().trim())

    await supabase
      .from('tags')
      .upsert(tagNames.map((name) => ({ name })), { onConflict: 'name', ignoreDuplicates: true })

    const { data: tagRows } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', tagNames)

    if (tagRows && tagRows.length > 0) {
      await supabase
        .from('pin_tags')
        .insert(tagRows.map((t) => ({ pin_id: pin.id, tag_id: t.id })))
    }
  }

  return pin
}

export async function createPinPhotos(
  pinId: string,
  photos: Array<{ storagePath: string; order: number; exifLat?: number; exifLng?: number }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('pin_photos').insert(
    photos.map((p) => ({
      pin_id: pinId,
      storage_path: p.storagePath,
      order: p.order,
      exif_lat: p.exifLat ?? null,
      exif_lng: p.exifLng ?? null,
    }))
  )

  if (error) throw new Error(error.message)
}

export async function updatePin(pinId: string, values: Partial<PinFormValues>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { tags, ...pinValues } = values

  const { error } = await supabase
    .from('pins')
    .update(pinValues)
    .eq('id', pinId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
}

export async function deletePin(pinId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { error } = await supabase
    .from('pins')
    .delete()
    .eq('id', pinId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  redirect('/map')
}
