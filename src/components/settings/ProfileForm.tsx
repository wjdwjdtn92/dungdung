'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { updateProfile, type ProfileFormValues } from '@/lib/settings/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const profileSchema = z.object({
  display_name: z.string().min(1, '이름을 입력해주세요').max(50),
  username: z
    .string()
    .min(3, '3자 이상이어야 합니다')
    .max(30)
    .regex(/^[a-z0-9_]+$/, '영문 소문자, 숫자, _만 가능합니다'),
  bio: z.string().max(200).optional(),
});

interface ProfileFormProps {
  initialValues: ProfileFormValues;
}

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
  });

  const onSubmit = (values: ProfileFormValues) => {
    startTransition(async () => {
      try {
        await updateProfile(values);
        toast.success('프로필이 업데이트됐습니다');
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '프로필 업데이트에 실패했습니다');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="display_name">표시 이름</Label>
        <Input id="display_name" {...register('display_name')} />
        {errors.display_name && (
          <p className="text-xs text-red-500">{errors.display_name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username">사용자명</Label>
        <div className="flex items-center gap-1">
          <span className="text-sm text-zinc-400">@</span>
          <Input id="username" {...register('username')} />
        </div>
        {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">
          자기소개 <span className="text-zinc-400 font-normal">(선택, 최대 200자)</span>
        </Label>
        <Textarea id="bio" {...register('bio')} rows={3} placeholder="간단한 자기소개" />
        {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            저장 중...
          </>
        ) : (
          '저장'
        )}
      </Button>
    </form>
  );
}
