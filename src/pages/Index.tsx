import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors } from 'lucide-react';

const genderChoices = [
  { id: 'male', label: '남성', emoji: '👨' },
  { id: 'female', label: '여성', emoji: '👩' },
];

const ageChoices = [
  { id: '20s', label: '20대' },
  { id: '30s', label: '30대' },
  { id: '40s', label: '40대' },
  { id: '50s', label: '50대' },
  { id: 'senior', label: '시니어' },
];

const ethnicityChoices = [
  { id: 'korean', label: '한국인' },
  { id: 'foreign', label: '외국인' },
];

const Index = () => {
  const navigate = useNavigate();
  const [gender, setGender] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [ethnicity, setEthnicity] = useState<string | null>(null);

  const canProceed = gender && age && ethnicity;

  const handleProceed = () => {
    if (canProceed) {
      navigate(`/category/${gender}?age=${age}&ethnicity=${ethnicity}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Scissors className="w-6 h-6 text-primary" />
          <span className="text-sm font-semibold text-primary">HAIR MODEL AI</span>
        </div>
        <h1 className="text-[28px] font-bold leading-tight text-foreground">
          AI 헤어 모델로<br />
          스타일을 미리 확인하세요
        </h1>
        <p className="text-muted-foreground text-[15px] mt-2">
          옵션을 선택하고 원하는 스타일을 골라보세요
        </p>
      </header>

      <main className="flex-1 px-5 pb-10 space-y-6">
        {/* 1. Gender */}
        <section>
          <h2 className="text-[15px] font-bold text-foreground mb-3">1. 성별</h2>
          <div className="grid grid-cols-2 gap-3">
            {genderChoices.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setGender(opt.id)}
                className={`rounded-2xl p-4 border transition-all duration-200 active:scale-[0.97] text-center ${
                  gender === opt.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                <span className="text-3xl block mb-2">{opt.emoji}</span>
                <span className="text-[15px] font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 2. Age */}
        <section>
          <h2 className="text-[15px] font-bold text-foreground mb-3">2. 연령대</h2>
          <div className="flex flex-wrap gap-2">
            {ageChoices.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAge(opt.id)}
                className={`rounded-xl px-5 py-2.5 border text-[14px] font-medium transition-all duration-200 active:scale-[0.97] ${
                  age === opt.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* 3. Ethnicity */}
        <section>
          <h2 className="text-[15px] font-bold text-foreground mb-3">3. 인종</h2>
          <div className="grid grid-cols-2 gap-3">
            {ethnicityChoices.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setEthnicity(opt.id)}
                className={`rounded-xl px-5 py-3 border text-[14px] font-medium transition-all duration-200 active:scale-[0.97] ${
                  ethnicity === opt.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Proceed Button */}
        <button
          onClick={handleProceed}
          disabled={!canProceed}
          className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-[16px] font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
        >
          스타일 선택하기
        </button>

        {/* Info Banner */}
        <div className="bg-secondary rounded-2xl p-5">
          <p className="text-sm font-semibold text-foreground mb-1">✨ AI가 생성하는 헤어 모델</p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            원하는 헤어스타일을 선택하면 AI가 해당 스타일의 헤어 모델 이미지를 생성합니다.
            미리보기 1장은 무료, 상세 4컷은 결제 후 확인할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
