import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getStyles, categoryOptions, type Gender, type Category } from '@/data/hairStyles';
import { ChevronLeft, Sparkles, Loader2, ImagePlus, RefreshCw, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';


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

  const generateThumbnail = async (styleId: string, prompt: string, forceRegenerate = false) => {
    setGenerating(prev => ({ ...prev, [styleId]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('generate-thumbnails', {
        body: { styleId, prompt, forceRegenerate },
      });
      if (data?.url) {
        setThumbnails(prev => ({ ...prev, [styleId]: `${data.url}?t=${Date.now()}` }));
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

  const regenerateAllThumbnails = async () => {
    setBulkGenerating(true);
    for (const style of styles) {
      await generateThumbnail(style.id, style.prompt, true);
    }
    setBulkGenerating(false);
  };

  const missingCount = styles.filter(s => !thumbnails[s.id]).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/category/${gender}`)}
            className="flex items-center gap-1 text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
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
          {genderLabel} · {catLabel}
        </h1>
        <p className="text-muted-foreground text-[14px] mt-1">
          스타일을 선택하고 AI 모델을 생성해 보세요
        </p>
      </header>

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
