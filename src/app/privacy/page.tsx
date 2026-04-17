import { AppHeader } from '@/components/layout/AppHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '개인정보처리방침' };

export default function PrivacyPage() {
  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <article className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-6 text-sm text-zinc-700 leading-relaxed">
            <h1 className="text-2xl font-bold text-zinc-900">개인정보처리방침</h1>
            <p className="text-xs text-zinc-400">최종 수정일: 2026년 4월 17일</p>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">1. 수집하는 개인정보</h2>
              <p>둥둥(이하 &ldquo;서비스&rdquo;)은 다음 정보를 수집합니다.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Google 계정 정보: 이메일, 이름, 프로필 사진</li>
                <li>사용자가 직접 입력한 정보: 표시 이름, 사용자명, 자기소개</li>
                <li>여행 기록: 핀 제목, 본문, 위치(위도/경도), 장소명, 사진</li>
                <li>사진 EXIF 메타데이터: GPS 좌표 (사용자 동의 하에 추출)</li>
                <li>서비스 이용 기록: 접속 로그, 기기 정보</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">2. 개인정보 이용 목적</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>회원 관리 및 서비스 제공</li>
                <li>여행 기록 저장 및 지도 시각화</li>
                <li>소셜 기능 (피드, 팔로우, 좋아요, 댓글)</li>
                <li>서비스 개선 및 통계 분석</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">3. 개인정보 보유 및 파기</h2>
              <p>
                회원 탈퇴 시 개인정보는 즉시 파기됩니다. 단, 관련 법령에 따라 일정 기간 보존이
                필요한 정보는 해당 기간 동안 보관 후 파기합니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">4. 제3자 제공</h2>
              <p>
                서비스는 사용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의
                경우는 예외입니다.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>법령에 의한 요청이 있는 경우</li>
                <li>사용자가 공개 설정한 콘텐츠의 경우</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">5. 위탁 처리</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Supabase (데이터베이스, 파일 저장, 인증)</li>
                <li>Vercel (웹 호스팅)</li>
                <li>Google (OAuth 인증)</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">6. 이용자의 권리</h2>
              <p>
                사용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있으며, 회원 탈퇴를 통해
                개인정보 처리 정지를 요청할 수 있습니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">7. 문의</h2>
              <p>개인정보 관련 문의는 서비스 내 설정 페이지를 통해 연락해주세요.</p>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}
