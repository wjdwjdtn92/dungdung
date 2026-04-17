import dynamic from 'next/dynamic';
import { GlobeSkeleton } from './GlobeSkeleton';
import type { GlobeOptions, GlobePinMarker } from './GlobeEngine';

export interface DynamicLeafletProps extends GlobeOptions {
  pins?: GlobePinMarker[];
  className?: string;
}

const LeafletMap = dynamic(() => import('./LeafletMap').then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => <GlobeSkeleton />,
});

export function DynamicLeaflet(props: DynamicLeafletProps) {
  return <LeafletMap {...props} />;
}
