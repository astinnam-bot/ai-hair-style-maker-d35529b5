import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" /> 돌아가기
        </button>

        <h1 className="text-2xl font-bold mb-8">서비스 이용약관</h1>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">

          <section className="bg-card border border-border rounded-xl p-4">
            <h2 className="text-base font-semibold text-foreground mb-3">사업자 정보</h2>
            <div className="space-y-1">
              <p><span className="text-foreground font-medium">상호명:</span> 주식회사 아스타테크</p>
              <p><span className="text-foreground font-medium">대표자:</span> 이재우</p>
              <p><span className="text-foreground font-medium">사업자등록번호:</span> 360-81-00221</p>
              <p><span className="text-foreground font-medium">주소:</span> 서울시 강남구 영동대로 602, 6층 SG98호 (미켈란 107, 삼성동)</p>
              <p><span className="text-foreground font-medium">연락처:</span> 070-4063-9888</p>
              <p><span className="text-foreground font-medium">이메일:</span> aihairmuse@gmail.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">제1조 (목적)</h2>
            <p>이 약관은 주식회사 아스타테크(이하 "회사")가 제공하는 "AI 헤어 스타일" 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">제2조 (서비스의 정의)</h2>
            <p>① "서비스"란 헤어모델을 AI 기반으로 생성하여 제공하는 디지털 콘텐츠 서비스를 의미합니다.</p>
            <p>② "콘텐츠"란 이용자가 선택한 헤어스타일을 바탕으로 AI가 생성하는 디지털 이미지를 의미합니다.</p>
            <p>③ "이용자"란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">제3조 (약관의 효력 및 변경)</h2>
            <p>① 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</p>
            <p>② 회사는 관련 법령에 위배되지 않는 범위 내에서 약관을 변경할 수 있으며, 변경 시 적용일자 및 변경사유를 명시하여 서비스 내에 7일 전부터 공지합니다.</p>
            <p>③ 이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">제4조 (서비스 내용 및 제한)</h2>
            <p>① 본 서비스는 AI 기반 헤어모델 이미지 생성 및 판매를 목적으로 제공됩니다.</p>
            <p>② 서비스를 통해 생성된 이미지는 참고용이며, 실제 시술 결과와 다를 수 있습니다.</p>
            <p>③ 회사는 서비스의 품질 향상을 위해 사전 공지 후 서비스 내용을 변경할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">제5조 (결제)</h2>
            <p>① 콘텐츠 이용권은 1회 결제당 1회 사용할 수 있는 소모성 디지털 상품입니다.</p>
            <p>② 결제 금액 및 결제 방법은 서비스 내 안내를 따릅니다.</p>
            <p>③ 결제는 토스페이먼츠를 통해 처리되며, 결제 완료 후 콘텐츠가 즉시 생성됩니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">제6조 (청약철회 및 환불 정책)</h2>
            <p className="font-medium text-foreground mt-2">1. 환불이 가능한 경우</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>결제 완료 후 시스템 오류로 콘텐츠가 정상적으로 생성되지 않은 경우</li>
              <li>동일한 결제가 중복으로 처리된 경우</li>
            </ul>
            <p className="font-medium text-foreground mt-3">2. 환불이 제한되는 경우 (전자상거래법 제17조 제2항)</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>콘텐츠를 이미 다운로드한 경우 (디지털 콘텐츠 특성상 복제가 가능하므로)</li>
              <li>단순 변심에 의한 환불 요청</li>
              <li>이용자의 선택 오류로 인한 결과 불만족</li>
            </ul>
            <p className="font-medium text-foreground mt-3">3. 환불 절차</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>환불 요청은 결제일로부터 7일 이내에 해주세요.</li>
              <li>이메일(aihairmuse@gmail.com) 또는 전화(070-4063-9888)로 환불 사유와 함께 문의해주세요.</li>
              <li>확인 후 3~5영업일 이내에 결제 수단으로 환불 처리됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">제7조 (이용자의 의무)</h2>
            <p>① 이용자는 서비스 이용 시 정확한 정보를 제공해야 합니다.</p>
            <p>② 이용자는 타인의 정보를 무단으로 사용하여 서비스를 이용할 수 없습니다.</p>
            <p>③ 이용자는 서비스를 통해 얻은 콘텐츠를 무단 복제, 배포할 수 없습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">제8조 (회사의 의무)</h2>
            <p>① 회사는 관련 법령과 본 약관이 금지하는 행위를 하지 않으며, 지속적이고 안정적으로 서비스를 제공하기 위해 노력합니다.</p>
            <p>② 회사는 이용자의 개인정보를 보호하기 위해 보안 시스템을 갖추며, 개인정보처리방침을 공시하고 준수합니다.</p>
            <p>③ 회사는 이용자로부터 제기되는 의견이나 불만이 정당하다고 인정할 경우 적절한 절차를 거쳐 처리합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">제9조 (면책조항)</h2>
            <p>① 회사는 AI가 생성한 이미지의 정확성이나 특정 목적에의 적합성에 대해 보증하지 않습니다.</p>
            <p>② 이용자가 서비스를 통해 얻은 콘텐츠를 근거로 내린 결정에 대해 회사는 책임지지 않습니다.</p>
            <p>③ 천재지변, 시스템 장애 등 불가항력적인 사유로 인한 서비스 중단에 대해 책임지지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">제10조 (개인정보 보호)</h2>
            <p>① 회사는 이용자의 개인정보를 「개인정보 보호법」 등 관련 법령에 따라 보호합니다.</p>
            <p>② 수집하는 정보: 결제 정보 (토스페이먼츠를 통해 처리)</p>
            <p>③ 수집 목적: AI 헤어모델 이미지 생성 및 서비스 제공</p>
            <p>④ 보관 기간: 콘텐츠 생성 후 30일간 보관 후 자동 삭제 (단, 관련 법령에 따른 보관 의무가 있는 경우 해당 기간까지 보관)</p>
            <p>⑤ 수집된 개인정보는 제3자에게 제공하지 않습니다. (단, 법령에 의한 경우 제외)</p>
            <p>⑥ 이용자는 언제든지 이메일(aihairmuse@gmail.com)을 통해 개인정보 열람, 수정, 삭제를 요청할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">제11조 (저작권 및 지식재산권)</h2>
            <p>① 서비스 및 서비스를 통해 생성된 콘텐츠에 대한 저작권은 회사에 있습니다.</p>
            <p>② 이용자는 결제를 통해 획득한 콘텐츠를 개인적·상업적 용도로 이용할 수 있으나, 서비스 자체를 복제하거나 재배포할 수 없습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">제12조 (분쟁해결)</h2>
            <p>① 서비스 이용과 관련한 분쟁은 상호 협의를 통해 해결합니다.</p>
            <p>② 협의가 이루어지지 않는 경우, 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령에 따른 분쟁해결 절차를 따릅니다.</p>
            <p>③ 관할 법원은 민사소송법에 따른 관할 법원으로 합니다.</p>
          </section>

          <section className="border-t border-border pt-4">
            <h2 className="text-base font-semibold text-foreground mb-2">고객센터 안내</h2>
            <p>• 이메일: aihairmuse@gmail.com</p>
            <p>• 전화: 070-4063-9222</p>
            <p>• 운영시간: 평일 10:00 ~ 18:00 (주말·공휴일 휴무)</p>
          </section>

          <p className="pt-4 text-xs text-muted-foreground/70">본 약관은 2026년 2월 4일부터 시행됩니다.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
