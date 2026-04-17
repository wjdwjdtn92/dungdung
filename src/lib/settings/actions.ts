'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const profileSchema = z.object({
  display_name: z.string().min(1, '이름을 입력해주세요').max(50),
  username: z
    .string()
    .min(3, '3자 이상이어야 합니다')
    .max(30)
    .regex(/^[a-z0-9_]+$/, '영문 소문자, 숫자, _만 가능합니다'),
  bio: z.string().max(200).optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export async function updateProfile(values: ProfileFormValues) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const { error } = await supabase
    .from('users')
    .update({
      display_name: parsed.data.display_name,
      username: parsed.data.username,
      bio: parsed.data.bio ?? null,
    })
    .eq('id', user.id);

  if (error) {
    if (error.code === '23505') throw new Error('이미 사용 중인 사용자명입니다');
    throw new Error(error.message);
  }
}
