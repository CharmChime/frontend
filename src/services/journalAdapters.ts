import type { Journal, MoodAnalysis } from './api';

export const moodEmoji = (mood?: string) => {
  switch ((mood || '').toLowerCase()) {
    case 'happy':
    case 'joy':
    case 'positive':
      return '😊';
    case 'excited':
      return '🤩';
    case 'calm':
      return '😌';
    case 'sad':
    case 'negative':
      return '😢';
    case 'creative':
      return '🎨';
    default:
      return '✨';
  }
};

export const moodColor = (mood?: string) => {
  switch ((mood || '').toLowerCase()) {
    case 'happy':
    case 'joy':
    case 'positive':
      return 'child-yellow';
    case 'excited':
      return 'child-peach';
    case 'calm':
      return 'child-mint';
    case 'creative':
      return 'child-lavender';
    default:
      return 'child-blue';
  }
};

export const formatDate = (value?: string) => {
  if (!value) return 'Unknown date';
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

export const formatShortDate = (value?: string) => {
  if (!value) return 'Unknown date';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

export const getMoodLabel = (analysis?: MoodAnalysis) =>
  analysis?.mood || analysis?.label || analysis?.sentiment || 'thoughtful';

export const wordCount = (content: string) =>
  content.trim() ? content.trim().split(/\s+/).length : 0;

export const readingTime = (content: string) => {
  const minutes = Math.max(1, Math.ceil(wordCount(content) / 180));
  return `${minutes} min`;
};

