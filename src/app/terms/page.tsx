import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '서비스 이용약관 - 마음젤리',
};

export default function TermsPage() {
  return (
    <div className="bg-background text-on-surface min-h-screen px-[20px] py-[40px] max-w-[640px] mx-auto">
      <h1 className="font-gowun text-2xl font-bold text-primary mb-[8px]">서비스 이용약관</h1>
      <p className="font-gowun text-sm text-on-surface-variant mb-[32px]">시행일: 2026년 5월 15일</p>

      <section className="space-y-[24px] font-gowun text-[15px] text-on-surface leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-on-surface mb-[8px]">제1조 (목적)</h2>
          <p>
            본 약관은 마음젤리(이하 &quot;서비스&quot;)가 제공하는 감정 기록 및 마음 챙김 서비스의 이용에 관한
            조건 및 절차, 이용자와 서비스 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-on-surface mb-[8px]">제2조 (용어의 정의)</h2>
          <ul className="space-y-[8px] pl-[16px] list-disc text-[14px]">
            <li>&quot;서비스&quot;란 마음젤리가 제공하는 감정 기록, 젤리 성장, 친구와의 감정 공유 등 모든 기능을 말합니다.</li>
            <li>&quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 모든 자를 말합니다.</li>
            <li>&quot;콘텐츠&quot;란 이용자가 서비스 내에 작성·등록한 일기, 감정 기록 등 모든 데이터를 말합니다.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-on-surface mb-[8px]">제3조 (서비스 이용)</h2>
          <ul className="space-y-[8px] pl-[16px] list-disc text-[14px]">
            <li>서비스는 토스 앱인토스(Apps in Toss) 플랫폼을 통해 제공됩니다.</li>
            <li>이용자는 서비스를 통해 일일 감정을 기록하고 젤리를 성장시킬 수 있습니다.</li>
            <li>친구 기능 이용 시 초대코드를 통해 상대방의 동의를 받아야 합니다.</li>
            <li>서비스는 만 14세 이상 이용 가능합니다.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-on-surface mb-[8px]">제4조 (개인정보 처리)</h2>
          <p className="mb-[8px]">
            서비스는 이용자의 개인정보를 아래와 같이 처리합니다.
          </p>
          <ul className="space-y-[8px] pl-[16px] list-disc text-[14px]">
            <li>수집 항목: 이름 (토스 로그인 이용 시)</li>
            <li>수집 목적: 서비스 이용자 식별</li>
            <li>보유 기간: 서비스 탈퇴 또는 연결 해제 시까지</li>
            <li>제3자 제공: 서비스 운영에 필요한 최소한의 범위 내에서만 처리하며, 외부 제공 없음</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-on-surface mb-[8px]">제5조 (이용자의 의무)</h2>
          <ul className="space-y-[8px] pl-[16px] list-disc text-[14px]">
            <li>이용자는 타인의 개인정보를 무단으로 수집·이용해서는 안 됩니다.</li>
            <li>서비스를 이용하여 불법적이거나 타인에게 해를 끼치는 행위를 해서는 안 됩니다.</li>
            <li>서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-on-surface mb-[8px]">제6조 (서비스 변경 및 중단)</h2>
          <p>
            서비스는 운영상 필요에 따라 서비스 내용을 변경하거나 중단할 수 있으며,
            이 경우 이용자에게 사전 공지합니다. 단, 불가피한 사정이 있는 경우 사후 공지할 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-on-surface mb-[8px]">제7조 (면책조항)</h2>
          <ul className="space-y-[8px] pl-[16px] list-disc text-[14px]">
            <li>서비스는 이용자의 콘텐츠에 대한 법적 책임을 지지 않습니다.</li>
            <li>이용자 간 분쟁에 대해 서비스는 개입하지 않으며 책임지지 않습니다.</li>
            <li>천재지변, 서버 장애 등 불가항력적인 사유로 인한 서비스 중단에 대해 책임지지 않습니다.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-on-surface mb-[8px]">제8조 (약관 변경)</h2>
          <p>
            서비스는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지 후
            7일이 경과한 날부터 효력이 발생합니다.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-on-surface mb-[8px]">제9조 (문의)</h2>
          <p className="text-[14px]">
            서비스 이용 관련 문의사항은 앱 내 도움말 메뉴를 통해 접수해주세요.
          </p>
        </div>
      </section>

      <div className="mt-[48px] pt-[24px] border-t border-white/20">
        <p className="font-gowun text-sm text-on-surface-variant text-center">
          마음젤리 서비스 이용약관 v1.0
        </p>
      </div>
    </div>
  );
}
