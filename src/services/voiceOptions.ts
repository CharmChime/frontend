export type FunVoiceCharacter =
  | 'cheerful'
  | 'calm'
  | 'storyteller'
  | 'robot'
  | 'pirate'
  | 'fairy';

export type FunVoiceOption = {
  id: FunVoiceCharacter;
  name: string;
  emoji: string;
  description: string;
  color: string;
  style: 'normal' | 'fun' | 'story';
};

export const funVoiceOptions: FunVoiceOption[] = [
  { id: 'cheerful', name: 'Cheerful Charlie', emoji: '😄', description: 'Happy and energetic!', color: 'from-yellow-400 to-orange-400', style: 'normal' },
  { id: 'calm', name: 'Calm Casey', emoji: '😌', description: 'Soothing and gentle', color: 'from-blue-400 to-cyan-400', style: 'normal' },
  { id: 'storyteller', name: 'Story Sam', emoji: '📚', description: 'Dramatic storyteller', color: 'from-purple-400 to-pink-400', style: 'story' },
  { id: 'robot', name: 'Robot Rosie', emoji: '🤖', description: 'Funny robot voice', color: 'from-gray-400 to-slate-500', style: 'fun' },
  { id: 'pirate', name: 'Pirate Pete', emoji: '🏴‍☠️', description: 'Arrr matey!', color: 'from-amber-600 to-red-600', style: 'fun' },
  { id: 'fairy', name: 'Fairy Flora', emoji: '🧚', description: 'Magical and sweet', color: 'from-pink-400 to-rose-400', style: 'story' },
];
