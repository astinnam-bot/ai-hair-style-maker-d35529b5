import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getStyles, categoryOptions, type Gender, type Category } from '@/data/hairStyles';
import { ChevronLeft, Sparkles, Loader2, ImagePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const StyleListPage = () => {
  const navigate = useNavigate();
  const { gender, category } = useParams<{ gender: string; category: string }>();
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();

  const styles = getStyles(gender as Gender, category as Category);
  const genderLabel = gender === 'male' ? '남성' : '여성';
  const catLabel = categoryOptions.find(c => c.id === category)?.label || '';

  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [bulkGenerating, setBulkGenerating] = useState(false);

  // Load existing thumbnails from storage on mount
  useEffect(() => {
    loadExistingThumbnails();
  }, [gender, category]);

  const loadExistingThumbnails = async () => {
    const thumbMap: Record<string, string> = {};
    const { data: files } = await supabase.storage.from('hair-images').list('thumbnails');
    if (files) {
      for (const style of styles) {
        const match = files.find(f => f.name.startsWith(style.id + '.'));
        if (match) {
          const { data: urlData } = supabase.storage.from('hair-images').getPublicUrl(`thumbnails/${match.name}`);
          thumbMap[style.id] = urlData.publicUrl;
        }
      }
    }
    setThumbnails(thumbMap);
  };

  const generateThumbnail = async (styleId: string, prompt: string) => {
    setGenerating(prev => ({ ...prev, [styleId]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('generate-thumbnails', {
        body: { styleId, prompt },
      });
      if (data?.url) {
        setThumbnails(prev => ({ ...prev, [styleId]: data.url }));
      }
      if (error) console.error('Thumbnail gen error:', error);
    } catch (err) {
      console.error('Thumbnail gen failed:', err);
    } finally {
      setGenerating(prev => ({ ...prev, [styleId]: false }));
    }
  };

  const generateAllThumbnails = async () => {
    setBulkGenerating(true);
    const missing = styles.filter(s => !thumbnails[s.id]);
    for (const style of missing) {
      await generateThumbnail(style.id, style.prompt);
    }
    setBulkGenerating(false);
  };

  const missingCount = styles.filter(s => !thumbnails[s.id]).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <button
          onClick={() => navigate(`/category/${gender}`)}
          className="flex items-center gap-1 text-muted-foreground text-sm mb-4 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          뒤로
        </button>
        <h1 className="text-[24px] font-bold text-foreground">
          {genderLabel} · {catLabel}
        </h1>
        <p className="text-muted-foreground text-[14px] mt-1">
          스타일을 선택하고 AI 모델을 생성하세요
        </p>

        {/* Bulk generate button */}
        {missingCount > 0 && (
          <button
            onClick={generateAllThumbnails}
            disabled={bulkGenerating}
            className="mt-3 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-[13px] font-semibold flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {bulkGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                썸네일 생성 중...
              </>
            ) : (
              <>
                <ImagePlus className="w-4 h-4" />
                전체 썸네일 생성 ({missingCount}개)
              </>
            )}
          </button>
        )}
      </header>

      {/* Styles Grid */}
      <main className="flex-1 px-5 pb-10">
        <div className="grid grid-cols-2 gap-3">
          {styles.map((style, index) => (
            <button
              key={style.id}
              onClick={() => navigate(`/generate/${style.id}${queryString ? `?${queryString}` : ''}`)}
              className="bg-card rounded-2xl p-3 border border-border hover:border-primary hover:shadow-md transition-all duration-200 active:scale-[0.97] text-left group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
              <div className="w-full aspect-square rounded-xl bg-secondary flex items-center justify-center mb-2 overflow-hidden relative">
                {thumbnails[style.id] ? (
                  <img
                    src={thumbnails[style.id]}
                    alt={style.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : generating[style.id] ? (
                  <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                ) : (
                  <Sparkles className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>
              <span className="text-[14px] font-semibold text-foreground group-hover:text-primary transition-colors leading-tight block">
                {style.name}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StyleListPage;
