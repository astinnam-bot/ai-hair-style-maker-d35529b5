import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { allStyles } from '@/data/hairStyles';
import { ChevronLeft, Sparkles, Loader2, Lock, Download } from 'lucide-react';
import { generateHairImage } from '@/lib/generateImage';
import { downloadImageWithWatermark } from '@/lib/downloadImage';
import { useToast } from '@/hooks/use-toast';

const GeneratePage = () => {
  const navigate = useNavigate();
  const { styleId } = useParams<{ styleId: string }>();
  const [searchParams] = useSearchParams();
  const age = searchParams.get('age') || '20s';
  const ethnicity = searchParams.get('ethnicity') || 'korean';
  const style = allStyles.find(s => s.id === styleId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const ageMap: Record<string, string> = {
    '20s': 'in their 20s',
    '30s': 'in their 30s',
    '40s': 'in their 40s',
    '50s': 'in their 50s',
    'senior': 'senior aged (60+)',
  };
  const ethnicityMap: Record<string, string> = {
    'korean': 'Korean',
    'foreign': 'Western/Caucasian',
  };


  if (!style) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">스타일을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const ageDesc = ageMap[age] || 'in their 20s';
      const ethnicityDesc = ethnicityMap[ethnicity] || 'Korean';
      const finalPrompt = `${style.prompt}, ${ethnicityDesc} person ${ageDesc}`;
      const images = await generateHairImage(finalPrompt, 1);
      if (images.length > 0) {
        setGeneratedImage(images[0]);
      }
    } catch (err: any) {
      toast({
        title: "이미지 생성 실패",
        description: err.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const genderLabel = style.gender === 'male' ? '남성' : '여성';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-muted-foreground text-sm mb-4 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          뒤로
        </button>
        <h1 className="text-[24px] font-bold text-foreground">
          {style.name}
        </h1>
        <p className="text-muted-foreground text-[14px] mt-1">
          {genderLabel} · AI 헤어모델 생성
        </p>
      </header>

      <main className="flex-1 px-5 pb-10">
        {!generatedImage ? (
          <div className="animate-fade-in">
            {/* Preview placeholder */}
            <div className="w-full aspect-[3/4] rounded-2xl bg-secondary flex flex-col items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm font-medium">AI 모델 이미지가 여기에 표시됩니다</p>
            </div>


            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-[16px] font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI 모델 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  AI 헤어모델 생성하기
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="animate-slide-up">
            {/* Generated image with watermark */}
            <div className="w-full aspect-[3/4] rounded-2xl relative overflow-hidden mb-4 watermark">
              <img
                src={generatedImage}
                alt={style.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            {/* Download preview */}
            <button
              onClick={() => downloadImageWithWatermark(generatedImage, `${style.name}_preview.jpg`)}
              className="w-full mb-3 bg-secondary text-foreground rounded-2xl py-3 text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              미리보기 이미지 저장
            </button>

            {/* Info */}
            <div className="bg-secondary rounded-2xl p-4 mb-4">
              <p className="text-[13px] text-muted-foreground">
                ⚠️ 미리보기 이미지에는 워터마크가 포함되어 있습니다.
              </p>
            </div>

            {/* Purchase CTA - pass preview image via state */}
            <button
              onClick={() => navigate(`/purchase/${style.id}`, { state: { previewImage: generatedImage } })}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-[16px] font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              상세 4컷 보기 · ₩5,500
            </button>

            <p className="text-center text-muted-foreground text-[12px] mt-3">
              정면 기본컷 · 45도 측면컷 · 완전 측면 · 후면 롱샷
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default GeneratePage;
