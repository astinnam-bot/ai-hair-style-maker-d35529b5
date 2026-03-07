import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KakaoShareButtonProps {
  title?: string;
  description?: string;
}

const KakaoShareButton = ({ title = '헤어모델 AI', description = '상용가능한 나만의 헤어모델 만들기' }: KakaoShareButtonProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: '링크가 복사되었습니다', description: '카카오톡에 붙여넣기 해주세요.' });
      } catch {
        toast({ title: '공유 실패', description: '브라우저에서 공유를 지원하지 않습니다.', variant: 'destructive' });
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 bg-[#FEE500] text-[#3C1E1E] rounded-xl px-4 py-2 text-[13px] font-semibold hover:brightness-95 active:scale-[0.97] transition-all"
      aria-label="카카오톡 공유"
    >
      <Share2 className="w-4 h-4" />
      공유하기
    </button>
  );
};

export default KakaoShareButton;
