import { z } from 'zod'

export const pinSchema = z.object({
  title: z.string({ message: '제목을 입력해주세요' }).min(1, '제목을 입력해주세요').max(100),
  body: z.string().max(10000).optional(),
  place_name: z.string({ message: '장소를 선택해주세요' }).min(1, '장소를 선택해주세요'),
  lat: z.number({ message: '장소를 선택해주세요' }),
  lng: z.number({ message: '장소를 선택해주세요' }),
  country_code: z.string().length(2).optional().nullable(),
  city: z.string().optional().nullable(),
  visited_tz: z.string().optional().nullable(),
  visibility: z.enum(['public', 'friends', 'private']).default('public'),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  trip_id: z.string().uuid().optional().nullable(),
})

export type PinFormValues = z.infer<typeof pinSchema>

export interface PhotoPreview {
  file: File
  previewUrl: string
  exifLat?: number
  exifLng?: number
  compressed?: File
}
