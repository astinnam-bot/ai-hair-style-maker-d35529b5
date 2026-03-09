import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { allStyles } from '@/data/hairStyles';
import { ChevronLeft, Sparkles, Loader2, Lock, Download, RefreshCw, Home } from 'lucide-react';
import { generateHairImage } from '@/lib/generateImage';
import KakaoShareButton from '@/components/KakaoShareButton';
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
  const [background, setBackground] = useState<'cafe' | 'hairshop' | 'sns'>('cafe');
  const { toast } = useToast();

  const backgroundOptions = [
    { id: 'cafe' as const, label: '☕ 카페배경', prompt: 'cozy stylish cafe atmosphere with warm ambient lighting' },
    { id: 'hairshop' as const, label: '💇 헤어샵배경', prompt: 'modern clean hair salon interior with professional lighting and mirrors' },
    { id: 'sns' as const, label: '📸 일상SNS', prompt: 'casual everyday outdoor street scene, natural daylight, urban lifestyle background' },
  ];

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
        <p className="text-muted-foreground">스타일을 찾을 수 없어요.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const ageDesc = ageMap[age] || 'in their 20s';
      const ethnicityDesc = ethnicityMap[ethnicity] || 'Korean';
      const bgOption = backgroundOptions.find(b => b.id === background)!;
      const finalPrompt = `${style.prompt}, ${ethnicityDesc} person ${ageDesc}`;
      const images = await generateHairImage(finalPrompt, 1, undefined, undefined, bgOption.prompt);
      if (images.length > 0) {
        setGeneratedImage(images[0]);
      }
    } catch (err: any) {
      toast({
        title: "이미지 생성 실패",
        description: err.message || "잠시 후 다시 시도해 주세요.",
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
              className="flex items-center gap-1 bg-primary text-primary-foreground text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Home className="w-4 h-4" />
              첫화면으로
            </button>
            <KakaoShareButton title={style.name} description="AI 헤어모델 생성" />
          </div>
        </div>
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
              <p className="text-muted-foreground text-sm font-medium">AI 모델 이미지가 여기에 표시돼요</p>
            </div>

            {/* Background Options */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-foreground mb-3">배경 선택</p>
              <div className="flex gap-2">
                {backgroundOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setBackground(opt.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-[13px] font-medium transition-all duration-200 border ${
                      background === opt.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-transparent hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
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

            {/* Action buttons */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 bg-secondary text-foreground rounded-2xl py-3 text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                다시 생성
              </button>
              <button
                onClick={() => downloadImageWithWatermark(generatedImage, `${style.name}_preview.jpg`)}
                className="flex-1 bg-secondary text-foreground rounded-2xl py-3 text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                이미지 저장
              </button>
            </div>

            {/* Info */}
            <div className="bg-secondary rounded-2xl p-4 mb-4">
              <p className="text-[13px] text-muted-foreground">
                ⚠️ 미리보기 이미지에는 워터마크가 포함되어 있어요.
              </p>
            </div>

            {/* Purchase CTA - pass preview image via state */}
            <button
              onClick={() => navigate(`/purchase/${style.id}`, { state: { previewImage: generatedImage, backgroundPrompt: backgroundOptions.find(b => b.id === background)!.prompt } })}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-[16px] font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              상세 4컷 보기
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
