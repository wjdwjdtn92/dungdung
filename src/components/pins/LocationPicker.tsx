'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchPlaces, parseFeature, type GeocodingFeature } from '@/lib/mapbox/geocoding'
import { cn } from '@/lib/utils'

interface Props {
  placeName: string
  lat?: number
  lng?: number
  onSelect: (result: { placeName: string; lat: number; lng: number; countryCode?: string; city?: string }) => void
  error?: string
}

export function LocationPicker({ placeName, lat, lng, onSelect, error }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodingFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const features = await searchPlaces(query)
        setResults(features)
        setIsOpen(true)
      } catch {
        // 검색 실패 시 조용히 처리
      } finally {
        setIsLoading(false)
      }
    }, 350)
  }, [query])

  function handleSelect(feature: GeocodingFeature) {
    const result = parseFeature(feature)
    onSelect(result)
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      {/* 선택된 장소 표시 */}
      {placeName && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-sm text-blue-800">
          <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
          <span className="truncate">{placeName}</span>
          {lat && lng && (
            <span className="ml-auto shrink-0 text-xs text-blue-400">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
          )}
        </div>
      )}

      {/* 검색 입력 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeName ? '다른 장소 검색...' : '장소를 검색해주세요'}
          className={cn('pl-9', error && !placeName && 'border-red-400')}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-zinc-400" />
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && results.length > 0 && (
        <ul className="rounded-lg border border-zinc-200 bg-white shadow-md divide-y divide-zinc-100 overflow-hidden">
          {results.map((feature) => (
            <li key={feature.id}>
              <button
                type="button"
                onClick={() => handleSelect(feature)}
                className="w-full flex items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-zinc-50 transition-colors"
              >
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-zinc-400" />
                <span className="text-zinc-700">{feature.place_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && !placeName && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
