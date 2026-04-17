import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MapClient } from './MapClient'
import type { GlobePinMarker } from '@/components/globe/GlobeEngine'

export default async function MapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: pins } = await supabase
    .from('pins')
    .select('id, title, lat, lng, visited_at')
    .eq('user_id', user.id)
    .order('visited_at', { ascending: false })

  const markers: GlobePinMarker[] = (pins ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    lat: p.lat,
    lng: p.lng,
    visitedAt: p.visited_at,
  }))

  return <MapClient pins={markers} />
}
