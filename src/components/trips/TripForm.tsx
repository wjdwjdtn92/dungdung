'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import type { Resolver } from 'react-hook-form';
import { createTrip, updateTrip, type TripFormValues } from '@/lib/trips/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VisibilitySelect } from '@/components/pins/VisibilitySelect';

const tripSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100),
  description: z.string().max(500).optional(),
  visibility: z.enum(['public', 'friends', 'private']).default('public'),
  started_at: z.string().optional(),
  ended_at: z.string().optional(),
});

interface TripFormProps {
  mode?: 'create' | 'edit';
  tripId?: string;
  initialValues?: Partial<TripFormValues>;
}

export function TripForm({ mode = 'create', tripId, initialValues }: TripFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema) as Resolver<TripFormValues>,
    defaultValues: {
      visibility: 'public',
      ...initialValues,
    },
  });

  const visibility = watch('visibility');

  const onSubmit = (values: TripFormValues) => {
    startTransition(async () => {
      try {
        if (mode === 'edit' && tripId) {
          await updateTrip(tripId, values);
          toast.success('트립이 수정됐습니다');
          router.push(`/trips/${tripId}`);
          router.refresh();
        } else {
          const trip = await createTrip(values);
          toast.success('트립이 생성됐습니다!');
          router.push(`/trips/${trip.id}`);
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '저장에 실패했습니다');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">
          제목 <span className="text-red-500">*</span>
        </Label>
        <Input id="title" {...register('title')} placeholder="여행 제목" />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">
          설명 <span className="text-zinc-400 font-normal">(선택)</span>
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          rows={3}
          placeholder="이 여행에 대한 간단한 설명"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="started_at">시작일</Label>
          <Input id="started_at" type="date" {...register('started_at')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ended_at">종료일</Label>
          <Input id="ended_at" type="date" {...register('ended_at')} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>공개 범위</Label>
        <VisibilitySelect
          value={visibility ?? 'public'}
          onChange={(v) => setValue('visibility', v)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            저장 중...
          </>
        ) : mode === 'edit' ? (
          '수정 완료'
        ) : (
          '트립 만들기'
        )}
      </Button>
    </form>
  );
}
