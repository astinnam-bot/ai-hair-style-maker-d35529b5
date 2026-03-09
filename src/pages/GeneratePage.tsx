import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { allStyles } from '@/data/hairStyles';
import { ChevronLeft, Sparkles, Loader2, Home } from 'lucide-react';
import { generateHairImage } from '@/lib/generateImage';

import { useToast } from '@/hooks/use-toast';

const GeneratePage = () => {
  const navigate = useNavigate();
  const { styleId } = useParams<{ styleId: string }>();
  const [searchParams] = useSearchParams();
  const age = searchParams.get('age') || '20s';
  const ethnicity = searchParams.get('ethnicity') || 'korean';
  const style = allStyles.find(s => s.id === styleId);
  const [isGenerating, setIsGenerating] = useState(false);
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
    try {
      const ageDesc = ageMap[age] || 'in their 20s';
      const ethnicityDesc = ethnicityMap[ethnicity] || 'Korean';
      const bgOption = backgroundOptions.find(b => b.id === background)!;
      const finalPrompt = `${style.prompt}, ${ethnicityDesc} person ${ageDesc}`;
      const images = await generateHairImage(finalPrompt, 1, undefined, undefined, bgOption.prompt);
      if (images.length > 0) {
        navigate(`/purchase/${style.id}`, {
          state: {
            previewImage: images[0],
            backgroundPrompt: bgOption.prompt,
          },
        });
        return;
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
        <div className="animate-fade-in">
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
                AI 헤어모델 생성해요
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default GeneratePage;
