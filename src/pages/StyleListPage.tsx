import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getStyles, categoryOptions, type Gender, type Category } from '@/data/hairStyles';
import { ChevronLeft, Sparkles } from 'lucide-react';

const StyleListPage = () => {
  const navigate = useNavigate();
  const { gender, category } = useParams<{ gender: string; category: string }>();
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();

  const styles = getStyles(gender as Gender, category as Category);
  const genderLabel = gender === 'male' ? '남성' : '여성';
  const catLabel = categoryOptions.find(c => c.id === category)?.label || '';

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
      </header>

      {/* Styles Grid */}
      <main className="flex-1 px-5 pb-10">
        <div className="grid grid-cols-2 gap-3">
          {styles.map((style, index) => (
            <button
              key={style.id}
              onClick={() => navigate(`/generate/${style.id}${queryString ? `?${queryString}` : ''}`)}
              className="bg-card rounded-2xl p-4 border border-border hover:border-primary hover:shadow-md transition-all duration-200 active:scale-[0.97] text-left group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
              <div className="w-full aspect-square rounded-xl bg-secondary flex items-center justify-center mb-3">
                <Sparkles className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
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
