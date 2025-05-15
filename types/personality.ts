export type PersonalityTrait = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export type PersonalityType = `${PersonalityTrait}${PersonalityTrait}${PersonalityTrait}${PersonalityTrait}`;

type OptionsType = {
  [K in PersonalityTrait]?: string;
};

export interface Question {
  id: number;
  text: string;
  options: OptionsType
}

export type ArtStyle = 
  '线稿' | '铅笔' | '水墨' | '复古漫画' | 
  '彩铅' | '蜡笔' | '点彩' | '水彩' | 
  '毛毡' | '毛线' | '粘土' | '纸艺' | 
  '像素' | '史努比' | 'riso印刷' | '写实';

export interface PersonalityResult {
  name: string;
  type: PersonalityType;
  details?: string;
  description: string;
  career?: string;
  artStyle?: ArtStyle;
}
