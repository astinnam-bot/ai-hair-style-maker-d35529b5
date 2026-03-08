import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { allStyles } from '@/data/hairStyles';
import { ChevronLeft, Check, CreditCard, Sparkles, Loader2, Download, Home } from 'lucide-react';
import KakaoShareButton from '@/components/KakaoShareButton';
import { generateHairImage } from '@/lib/generateImage';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

const shotLabels = [
  { label: '정면 기본 컷', description: '얼굴 정면에서 본 스타일' },
  { label: '45도 측면 컷', description: '비스듬한 각도에서 본 스타일' },
  { label: '완전 측면', description: '옆모습에서 본 헤어라인' },
  { label: '후면 롱샷', description: '뒷모습에서 본 전체 스타일' },
];

const allShotLabels = [
  ...shotLabels,
  { label: '4컷 병합 이미지', description: '4가지 각도를 한 장에 담은 이미지' },
];

async function createMergedImage(images: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const imgElements: HTMLImageElement[] = [];
    let loaded = 0;
    images.forEach((src, i) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loaded++;
        if (loaded === images.length) {
          // 2x2 grid
          const cellW = imgElements[0].naturalWidth;
          const cellH = imgElements[0].naturalHeight;
          const canvas = document.createElement('canvas');
          canvas.width = cellW * 2;
          canvas.height = cellH * 2;
          const ctx = canvas.getContext('2d')!;
          imgElements.forEach((el, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            ctx.drawImage(el, col * cellW, row * cellH, cellW, cellH);
          });
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        }
      };
      img.onerror = reject;
      imgElements[i] = img;
      img.src = src;
    });
  });
}

const PurchasePage = () => {
  const navigate = useNavigate();
  const { styleId } = useParams<{ styleId: string }>();
  const location = useLocation();
  const previewImage = (location.state as any)?.previewImage as string | undefined;
  const style = allStyles.find(s => s.id === styleId);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [affiliation, setAffiliation] = useState('');
  const [initials, setInitials] = useState('');
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();
  const copyrightText = affiliation || initials
    ? `© ${currentYear}${affiliation ? ` ${affiliation}` : ''}${initials ? ` ${initials}` : ''}. All Rights Reserved.`
    : '';

  if (!style) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">스타일을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      const images = await generateHairImage(style.prompt, 4, previewImage, copyrightText || undefined);
      // Create merged 5th image from 4 shots
      let mergedUrl = '';
      try {
        mergedUrl = await createMergedImage(images);
      } catch (e) {
        console.error('Merge failed', e);
      }
      setGeneratedImages(mergedUrl ? [...images, mergedUrl] : images);
      setIsPurchased(true);
    } catch (err: any) {
      toast({
        title: "처리 실패",
        description: err.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            뒤로
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
            </button>
            <KakaoShareButton title={style?.name || '상세 컷 구매'} description="AI 헤어모델 상세 컷" />
          </div>
        </div>
        <h1 className="text-[24px] font-bold text-foreground">
          {isPurchased ? '구매 완료 🎉' : '상세 컷 구매'}
        </h1>
        <p className="text-muted-foreground text-[14px] mt-1">
          {style.name} · {style.gender === 'male' ? '남성' : '여성'}
        </p>
      </header>

      <main className="flex-1 px-5 pb-10">
        {!isPurchased ? (
          <div className="animate-fade-in">
            {/* Preview thumbnail if available */}
            {previewImage && (
              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden mb-5 watermark">
                <img src={previewImage} alt="미리보기" className="w-full h-full object-cover rounded-2xl" />
                <p className="text-[12px] text-muted-foreground mt-2 text-center">이 모델의 상세 4컷이 생성됩니다</p>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border p-5 mb-5">
              <p className="text-[15px] font-bold text-foreground mb-4">포함된 이미지 5장</p>
              <div className="flex flex-col gap-3">
                {allShotLabels.map((shot, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-foreground">{shot.label}</p>
                      <p className="text-[12px] text-muted-foreground">{shot.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Affiliation & Initials (optional) */}
            <div className="bg-card rounded-2xl border border-border p-5 mb-5">
              <p className="text-[15px] font-bold text-foreground mb-1">저작권 정보 <span className="text-muted-foreground font-normal text-[12px]">(선택사항)</span></p>
              <p className="text-[12px] text-muted-foreground mb-4">입력하시면 이미지 하단에 저작권 문구가 표시됩니다.</p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[13px] text-muted-foreground mb-1 block">소속</label>
                  <input
                    type="text"
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value.slice(0, 50))}
                    placeholder="예: Juno Hair"
                    className="w-full bg-secondary text-foreground rounded-xl px-4 py-3 text-[14px] placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-muted-foreground mb-1 block">이니셜 (지점명 등)</label>
                  <input
                    type="text"
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.slice(0, 30))}
                    placeholder="예: Suji"
                    className="w-full bg-secondary text-foreground rounded-xl px-4 py-3 text-[14px] placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
                {copyrightText && (
                  <div className="bg-secondary rounded-xl px-4 py-3">
                    <p className="text-[12px] text-muted-foreground">미리보기:</p>
                    <p className="text-[13px] text-foreground font-medium mt-1">{copyrightText}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-secondary rounded-2xl p-5 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-muted-foreground">결제 금액</span>
                <span className="text-[24px] font-bold text-foreground">₩5,500</span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-2">
                워터마크 없는 고화질 이미지 5장이 제공됩니다 (상세 4장 + 병합 1장)
              </p>
            </div>

            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-[16px] font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  이미지 생성 중... (5장)
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  ₩5,500 결제하기
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="animate-slide-up">
            {/* Merged image */}
            {generatedImages[4] && (
              <div className="mb-5 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'backwards' }}>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-2">
                  <img src={generatedImages[4]} alt="병합 이미지" className="w-full h-full object-cover rounded-2xl" />
                </div>
                <p className="text-[13px] font-semibold text-foreground">4컷 병합 이미지</p>
                <p className="text-[11px] text-muted-foreground">정면 · 45도 · 측면 · 후면 한눈에 보기</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-5">
              {shotLabels.map((shot, i) => (
                <div key={i} className="animate-fade-in" style={{ animationDelay: `${(i + 1) * 150}ms`, animationFillMode: 'backwards' }}>
                  <div className="w-full aspect-[3/4] rounded-2xl relative overflow-hidden mb-2">
                    {generatedImages[i] ? (
                      <img src={generatedImages[i]} alt={shot.label} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <div className="w-full h-full bg-secondary rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-muted-foreground opacity-40" />
                      </div>
                    )}
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">{shot.label}</p>
                  <p className="text-[11px] text-muted-foreground">{shot.description}</p>
                </div>
              ))}
            </div>

            <button
              onClick={async () => {
                try {
                  const zip = new JSZip();
                  await Promise.all(
                    generatedImages.map(async (img, i) => {
                      const res = await fetch(img);
                      const blob = await res.blob();
                      const ext = blob.type.includes("png") ? "png" : "jpg";
                      const label = i < 4 ? shotLabels[i].label : '4컷_병합';
                      zip.file(`${style.name}_${label}.${ext}`, blob);
                    })
                  );
                  const content = await zip.generateAsync({ type: "blob" });
                  const url = URL.createObjectURL(content);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${style.name}_전체이미지.zip`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                } catch {
                  toast({ title: "다운로드 실패", description: "잠시 후 다시 시도해주세요.", variant: "destructive" });
                }
              }}
              className="w-full mb-4 bg-primary text-primary-foreground rounded-2xl py-4 text-[16px] font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              전체 이미지 다운로드 *.zip
            </button>

            <div className="bg-secondary rounded-2xl p-4">
              <p className="text-[13px] text-foreground font-semibold mb-1">✅ 결제가 완료되었습니다</p>
              <p className="text-[12px] text-muted-foreground">
                {style.name} 스타일의 상세 5장이 생성되었습니다.
                고화질 워터마크 없는 이미지를 확인하세요.
              </p>
            </div>

            {copyrightText && (
              <div className="mt-4 text-center">
                <p className="text-[12px] text-muted-foreground">{copyrightText}</p>
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full mt-4 bg-secondary text-foreground rounded-2xl py-4 text-[15px] font-bold transition-all duration-200 active:scale-[0.98]"
            >
              다른 스타일 보기
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PurchasePage;
