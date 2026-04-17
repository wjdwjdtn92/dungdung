import { AppHeader } from '@/components/layout/AppHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '이용약관' };

export default function TermsPage() {
  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <article className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-6 text-sm text-zinc-700 leading-relaxed">
            <h1 className="text-2xl font-bold text-zinc-900">이용약관</h1>
            <p className="text-xs text-zinc-400">최종 수정일: 2026년 4월 17일</p>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">제1조 (목적)</h2>
              <p>
                본 약관은 둥둥(이하 &ldquo;서비스&rdquo;)이 제공하는 여행 기록 서비스의 이용에 관한
                조건 및 절차, 이용자와 서비스 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">제2조 (서비스 내용)</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>3D 지구본 기반 여행 기록 저장 및 시각화</li>
                <li>사진 업로드 및 위치 정보 연동</li>
                <li>소셜 기능 (팔로우, 좋아요, 댓글, 피드)</li>
                <li>트립 관리 및 공유</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">제3조 (회원가입)</h2>
              <p>
                서비스는 Google 계정을 통한 가입을 지원합니다. 가입 시 사용자는 본 약관 및
                개인정보처리방침에 동의한 것으로 간주합니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">제4조 (이용자 의무)</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>타인의 저작권을 침해하는 콘텐츠를 업로드하지 않아야 합니다.</li>
                <li>타인을 비방하거나 불쾌감을 주는 콘텐츠를 게시하지 않아야 합니다.</li>
                <li>서비스를 악용하여 스팸이나 악성 행위를 하지 않아야 합니다.</li>
                <li>계정 정보를 안전하게 관리해야 합니다.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">제5조 (콘텐츠 권리)</h2>
              <p>
                사용자가 업로드한 콘텐츠(텍스트, 사진 등)의 저작권은 사용자에게 있습니다. 단,
                서비스는 서비스 운영 및 개선 목적으로 해당 콘텐츠를 이용할 수 있는 비독점적 라이선스를
                갖습니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">제6조 (서비스 변경 및 중단)</h2>
              <p>
                서비스는 운영상의 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.
                중요한 변경 시 사전에 공지합니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">제7조 (면책)</h2>
              <p>
                서비스는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 서비스
                제공이 불가능한 경우 책임을 지지 않습니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">제8조 (탈퇴 및 자격 상실)</h2>
              <p>
                사용자는 언제든지 설정 페이지에서 회원 탈퇴를 요청할 수 있습니다. 약관 위반 시 서비스는
                사전 통보 후 이용을 제한하거나 자격을 상실시킬 수 있습니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-900">제9조 (분쟁 해결)</h2>
              <p>
                본 약관에 관한 분쟁은 대한민국 법률에 따르며, 관할법원은 서비스 운영자의 소재지를
                관할하는 법원으로 합니다.
              </p>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}
