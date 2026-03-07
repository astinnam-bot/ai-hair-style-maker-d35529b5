export type Gender = 'male' | 'female';
export type Category = 'cut' | 'perm' | 'color';

export interface HairStyle {
  id: string;
  name: string;
  gender: Gender;
  category: Category;
  prompt: string;
}

export const genderOptions = [
  { id: 'male' as Gender, label: '남성', emoji: '👨', description: '남성 헤어스타일' },
  { id: 'female' as Gender, label: '여성', emoji: '👩', description: '여성 헤어스타일' },
];

export const categoryOptions = [
  { id: 'cut' as Category, label: '컷 스타일', emoji: '✂️', description: '커팅 스타일을 선택하세요' },
  { id: 'perm' as Category, label: '펌 스타일', emoji: '🌀', description: '펌 스타일을 선택하세요' },
  { id: 'color' as Category, label: '염색 스타일', emoji: '🎨', description: '염색 컬러를 선택하세요' },
];

const maleCuts: HairStyle[] = [
  '투블럭 컷', '텍스처 크롭', '리젠트컷', '가르마펌', '쉐도우펌',
  '다운펌', '애즈펌', '아이비리그컷', '포마드컷', '슬릭백',
].map((name, i) => ({
  id: `mc-${i}`,
  name,
  gender: 'male',
  category: 'cut',
  prompt: `A professional Korean male hair model with a ${name} hairstyle, studio lighting, front view, bright sheer curtain background, high quality portrait photography, editorial style`,
}));

const femaleCuts: HairStyle[] = [
  '허쉬컷 (Hush Cut)', '레이어드 롱컷', '모던 보브컷', '내추럴 웨이브 롱헤어', '숏 레이어드 컷',
].map((name, i) => ({
  id: `fc-${i}`,
  name,
  gender: 'female',
  category: 'cut',
  prompt: `A professional Korean female hair model with a ${name} hairstyle, studio lighting, front view, bright sheer curtain background, high quality portrait photography, editorial style`,
}));

const malePerms: HairStyle[] = [
  '가르마펌', '애즈펌', '쉐도우펌', '볼륨펌', '다운펌',
  '리프펌', '아이롱펌', '스핀스왈로펌', '히피펌', '베이비펌',
  '리젠트펌', '내추럴펌', '텍스처펌', '볼륨매직', '쉐도우 가르마펌',
].map((name, i) => ({
  id: `mp-${i}`,
  name,
  gender: 'male',
  category: 'perm',
  prompt: `A professional Korean male hair model with a ${name} perm hairstyle, natural texture, studio lighting, front view, bright sheer curtain background, high quality portrait photography`,
}));

const femalePerms: HairStyle[] = [
  'C컬펌', 'S컬펌', '빌드펌', '셋팅펌', '디지털펌',
  '바디펌', '루즈펌', '히피펌', '볼륨매직', '매직펌',
  '뿌리펌', '앞머리펌', '글램펌', '엘리자벳펌', '웨이브펌',
].map((name, i) => ({
  id: `fp-${i}`,
  name,
  gender: 'female',
  category: 'perm',
  prompt: `A professional Korean female hair model with a ${name} perm hairstyle, elegant texture, studio lighting, front view, bright sheer curtain background, high quality portrait photography`,
}));

const maleColors: HairStyle[] = [
  '애쉬브라운', '애쉬그레이', '블루블랙', '다크브라운', '카키브라운',
  '애쉬카키', '실버그레이', '다크애쉬', '하이라이트', '투톤컬러',
].map((name, i) => ({
  id: `mco-${i}`,
  name,
  gender: 'male',
  category: 'color',
  prompt: `A professional Korean male hair model with ${name} hair color, beautiful color tones, studio lighting, front view, bright sheer curtain background, high quality portrait photography`,
}));

const femaleColors: HairStyle[] = [
  '애쉬브라운', '애쉬베이지', '밀크티베이지', '로즈골드', '핑크브라운',
  '초코브라운', '애쉬그레이', '카키브라운', '발레아쥬', '옴브레',
  '하이라이트', '컬러멜팅', '바이올렛브라운',
  '체리레드', '보라빛 레드', '레드브라운', '레드바이올렛', '핑크레드',
].map((name, i) => ({
  id: `fco-${i}`,
  name,
  gender: 'female',
  category: 'color',
  prompt: `A professional Korean female hair model with ${name} hair color, beautiful color tones, studio lighting, front view, bright sheer curtain background, high quality portrait photography`,
}));

export const allStyles: HairStyle[] = [
  ...maleCuts, ...femaleCuts,
  ...malePerms, ...femalePerms,
  ...maleColors, ...femaleColors,
];

export function getStyles(gender: Gender, category: Category): HairStyle[] {
  return allStyles.filter(s => s.gender === gender && s.category === category);
}
