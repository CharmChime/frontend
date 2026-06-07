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

export const htmlToText = (content = '') => {
  const withLineBreaks = content
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n')
    .replace(/<\s*\/div\s*>/gi, '\n');

  const withoutTags = withLineBreaks.replace(/<[^>]*>/g, ' ');

  return withoutTags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

export const isRichTextContent = (content = '') => /<[^>]+>/.test(content);

export const sanitizeRichTextHtml = (content = '') => {
  if (!isRichTextContent(content)) {
    return content.replace(/\n/g, '<br />');
  }

  return content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/\shref=["']javascript:[^"']*["']/gi, '');
};

export const wordCount = (content: string) =>
  htmlToText(content).trim() ? htmlToText(content).trim().split(/\s+/).length : 0;

export const readingTime = (content: string) => {
  const minutes = Math.max(1, Math.ceil(wordCount(content) / 180));
  return `${minutes} min`;
};
