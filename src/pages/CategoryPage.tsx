import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { categoryOptions, type Gender } from '@/data/hairStyles';
import { ChevronLeft, Home } from 'lucide-react';


const CategoryPage = () => {
  const navigate = useNavigate();
  const { gender } = useParams<{ gender: string }>();
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const genderLabel = gender === 'male' ? '남성' : '여성';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
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
        <h1 className="text-[26px] font-bold text-foreground">
          {genderLabel} 스타일
        </h1>
        <p className="text-muted-foreground text-[15px] mt-1">
          원하는 스타일 카테고리를 선택해 주세요
        </p>
      </header>

      {/* Categories */}
      <main className="flex-1 px-5 pb-10">
        <div className="flex flex-col gap-3">
          {categoryOptions.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/styles/${gender}/${cat.id}${queryString ? `?${queryString}` : ''}`)}
              className="bg-card rounded-2xl p-5 border border-border hover:border-primary hover:bg-secondary transition-all duration-200 active:scale-[0.98] text-left group animate-fade-in flex items-center gap-4"
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
            >
              <span className="text-4xl">{cat.emoji}</span>
              <div>
                <span className="text-[17px] font-bold text-foreground group-hover:text-primary transition-colors block">
                  {cat.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {cat.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CategoryPage;
