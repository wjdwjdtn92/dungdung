export interface GeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  place_type: string[];
  context?: Array<{ id: string; text: string }>;
}

export interface GeocodingResult {
  placeName: string;
  lat: number;
  lng: number;
  countryCode?: string;
  city?: string;
}

/** Mapbox Geocoding API 텍스트 검색 */
export async function searchPlaces(query: string): Promise<GeocodingFeature[]> {
  if (!query.trim()) return [];

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN이 설정되지 않았습니다');

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&language=ko&limit=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('장소 검색에 실패했습니다');

  const data = await res.json();
  return data.features ?? [];
}

/** GeocodingFeature → GeocodingResult 변환 */
export function parseFeature(feature: GeocodingFeature): GeocodingResult {
  const [lng, lat] = feature.center;
  const context = feature.context ?? [];

  const countryCtx = context.find((c) => c.id.startsWith('country'));
  const regionCtx = context.find((c) => c.id.startsWith('place') || c.id.startsWith('region'));

  // ISO 국가 코드 추출 (context id에 포함된 경우)
  const countryCode = countryCtx?.id.split('.')[1]?.slice(0, 2).toUpperCase();

  return {
    placeName: feature.place_name,
    lat,
    lng,
    countryCode,
    city: regionCtx?.text,
  };
}
