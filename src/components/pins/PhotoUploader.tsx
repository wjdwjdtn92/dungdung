'use client';

import { useCallback, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PhotoPreview } from '@/types/pin';

interface Props {
  photos: PhotoPreview[];
  onChange: (photos: PhotoPreview[]) => void;
  onExifLocation?: (lat: number, lng: number) => void;
  maxPhotos?: number;
}

const MAX_SIZE_MB = 10;
const MAX_OUTPUT_PX = 2048;

export function PhotoUploader({ photos, onChange, onExifLocation, maxPhotos = 10 }: Props) {
  const [processing, setProcessing] = useState(false);

  const processFiles = useCallback(
    async (files: File[]) => {
      const remaining = maxPhotos - photos.length;
      const toProcess = files.slice(0, remaining);
      if (toProcess.length === 0) return;

      setProcessing(true);
      const newPhotos: PhotoPreview[] = [];

      for (const file of toProcess) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) continue;
        if (!file.type.match(/^image\//)) continue;

        // EXIF 파싱 (동적 import로 번들 분리)
        let exifLat: number | undefined;
        let exifLng: number | undefined;
        try {
          const exifr = await import('exifr');
          const gps = await exifr.gps(file);
          if (gps?.latitude && gps?.longitude) {
            exifLat = gps.latitude;
            exifLng = gps.longitude;
          }
        } catch {
          /* EXIF 없으면 무시 */
        }

        // 압축 (동적 import)
        let compressed: File;
        try {
          const imageCompression = (await import('browser-image-compression')).default;
          compressed = await imageCompression(file, {
            maxWidthOrHeight: MAX_OUTPUT_PX,
            fileType: 'image/webp',
            useWebWorker: true,
            initialQuality: 0.85,
          });
        } catch {
          compressed = file;
        }

        const previewUrl = URL.createObjectURL(compressed);
        newPhotos.push({ file, previewUrl, exifLat, exifLng, compressed });
      }

      // 첫 번째 사진에 GPS가 있으면 위치 제안
      const firstWithGps = newPhotos.find((p) => p.exifLat && p.exifLng);
      if (firstWithGps?.exifLat && firstWithGps?.exifLng) {
        onExifLocation?.(firstWithGps.exifLat, firstWithGps.exifLng);
      }

      onChange([...photos, ...newPhotos]);
      setProcessing(false);
    },
    [photos, onChange, onExifLocation, maxPhotos],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    processFiles(Array.from(e.dataTransfer.files));
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(Array.from(e.target.files));
    e.target.value = '';
  }

  function removePhoto(index: number) {
    const updated = photos.filter((_, i) => i !== index);
    URL.revokeObjectURL(photos[index].previewUrl);
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {/* 사진 미리보기 그리드 */}
      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.previewUrl} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 영역 */}
      {photos.length < maxPhotos && (
        <label
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 py-8 text-sm text-zinc-400 transition-colors hover:border-zinc-300 hover:bg-zinc-50',
            processing && 'pointer-events-none opacity-60',
          )}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {processing ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>처리 중...</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span>
                사진 추가 ({photos.length}/{maxPhotos})
              </span>
              <span className="text-xs">JPEG, PNG, HEIC, WebP · 최대 10MB</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInput}
            disabled={processing}
          />
        </label>
      )}
    </div>
  );
}
