'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Trip {
  id: string;
  title: string;
}

interface TripSelectProps {
  value: string | null | undefined;
  onChange: (tripId: string | null) => void;
}

export function TripSelect({ value, onChange }: TripSelectProps) {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('trips')
        .select('id, title')
        .order('created_at', { ascending: false });
      setTrips(data ?? []);
    }
    load();
  }, []);

  if (trips.length === 0) return null;

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
    >
      <option value="">트립 없음</option>
      {trips.map((trip) => (
        <option key={trip.id} value={trip.id}>
          {trip.title}
        </option>
      ))}
    </select>
  );
}
