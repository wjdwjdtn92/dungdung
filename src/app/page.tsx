import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 여부와 무관하게 지도로 이동
  // 비로그인: /map에서 공개 핀 탐색 가능
  // 로그인: /map에서 개인화 피드 + 내 핀 사용 가능
  redirect('/map');
}
