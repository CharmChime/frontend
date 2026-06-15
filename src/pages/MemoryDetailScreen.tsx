import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';
import { ArrowLeft, Edit, Trash2, Heart, MessageCircle, Volume2, VolumeX, RefreshCw, RotateCcw } from 'lucide-react';
import { formatConfidence, sanitizeRichTextHtml } from '../services/journalAdapters';
import { api, type JournalFeedback } from '../services/api';

export interface Memory {
  id: string;
  title: string;
  preview: string;
  content: string;
  mood: string;
  moodEmoji: string;
  date: string;
  time: string;
  tag: string;
  color: string;
  wordCount: number;
  readingTime: string;
  sentiment?: string;
  confidence?: number | null;
  aiFeedback?: JournalFeedback;
}

interface MemoryDetailScreenProps {
  memory: Memory;
  onBack: () => void;
  onEdit: (memory: Memory) => void;
  onDelete: (memoryId: string) => void;
  childName?: string;
}

export function MemoryDetailScreen({
  memory,
  onBack,
  onEdit,
  onDelete,
  childName = 'Friend',
}: MemoryDetailScreenProps) {
  const [feedbackVoiceStatus, setFeedbackVoiceStatus] = useState<'idle' | 'loading' | 'playing' | 'ready' | 'unavailable'>('idle');
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const feedbackAudioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      feedbackAudioRef.current?.pause();
      if (feedbackAudioUrlRef.current) {
        URL.revokeObjectURL(feedbackAudioUrlRef.current);
      }
    };
  }, []);

  const getFeedbackText = () => {
    if (!memory.aiFeedback) return '';

    return [
      memory.aiFeedback.message,
      memory.aiFeedback.reflectionPrompt ? `Reflection prompt: ${memory.aiFeedback.reflectionPrompt}` : '',
      memory.aiFeedback.suggestedAction ? `Suggested action: ${memory.aiFeedback.suggestedAction}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  };

  const handlePlayFeedback = async () => {
    const feedbackText = getFeedbackText();
    if (!feedbackText) return;

    if (feedbackAudioRef.current && feedbackVoiceStatus === 'playing') {
      feedbackAudioRef.current.pause();
      feedbackAudioRef.current.currentTime = 0;
      setFeedbackVoiceStatus('ready');
      return;
    }

    setFeedbackVoiceStatus('loading');

    try {
      if (!feedbackAudioRef.current) {
        const audioBlob = await api.voice.feedbackTts({ text: feedbackText });
        if (feedbackAudioUrlRef.current) {
          URL.revokeObjectURL(feedbackAudioUrlRef.current);
        }
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        feedbackAudioUrlRef.current = audioUrl;
        feedbackAudioRef.current = audio;

        audio.onended = () => setFeedbackVoiceStatus('ready');
        audio.onerror = () => setFeedbackVoiceStatus('unavailable');
      }

      feedbackAudioRef.current.currentTime = 0;
      await feedbackAudioRef.current.play();
      setFeedbackVoiceStatus('playing');
    } catch {
      setFeedbackVoiceStatus('unavailable');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--child-bg)] flex items-center justify-center py-8">
      <div className="w-full max-w-4xl px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <IconButton variant="child-yellow" size="medium" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </IconButton>
            <div>
              <p className="text-sm text-[#1a365d]/70">Memory detail for {childName}</p>
              <h1 className="text-3xl font-bold text-[#1a365d]">{memory.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="child-blue" size="small" onClick={() => onEdit(memory)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button variant="child-peach" size="small" onClick={() => onDelete(memory.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        <Card className="space-y-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={memory.color as any}>{memory.tag}</Badge>
                <span className="rounded-full bg-[#e2effb] px-3 py-1 text-sm text-[#1a365d]">
                  {memory.moodEmoji} {memory.mood}
                </span>
              </div>
              <p className="text-sm text-[#475569]">
                {memory.date} - {memory.time} - {memory.readingTime}
              </p>
              <p className="text-sm text-[#475569]">
                Sentiment: <span className="capitalize">{memory.sentiment || 'not available'}</span> - Confidence: {formatConfidence(memory.confidence)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#1a365d]/80">
              <span>{memory.wordCount} words</span>
            </div>
          </div>

          <div className="rounded-3xl border border-[#dbeafe] bg-white p-6 text-[#0f172a] shadow-sm">
            <div
              className="journal-rich-content leading-7"
              dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(memory.content) }}
            />
          </div>

          {memory.aiFeedback && (
            <div className="rounded-3xl border border-[#bbf7d0] bg-[#f0fdf4] p-5">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-[#065f46]">Chime's Thoughts</h3>
                <Button
                  variant={feedbackVoiceStatus === 'unavailable' ? 'child-slate' : 'child-mint'}
                  size="small"
                  icon={
                    feedbackVoiceStatus === 'loading' ? <RefreshCw className="h-4 w-4 animate-spin" /> :
                    feedbackVoiceStatus === 'playing' ? <VolumeX className="h-4 w-4" /> :
                    feedbackVoiceStatus === 'ready' ? <RotateCcw className="h-4 w-4" /> :
                    <Volume2 className="h-4 w-4" />
                  }
                  onClick={handlePlayFeedback}
                  disabled={feedbackVoiceStatus === 'loading'}
                >
                  {feedbackVoiceStatus === 'loading'
                    ? 'Generating Voice...'
                    : feedbackVoiceStatus === 'playing'
                    ? 'Stop Audio'
                    : feedbackVoiceStatus === 'ready'
                    ? 'Replay Feedback'
                    : 'Listen to Feedback'}
                </Button>
              </div>
              <p className="mb-4 text-sm text-[#166534]">{memory.aiFeedback.message}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#1a365d]">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Reflection prompt</span>
                  </div>
                  <p className="text-sm text-[#475569]">{memory.aiFeedback.reflectionPrompt}</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#065f46]">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm font-semibold">Suggested action</span>
                  </div>
                  <p className="text-sm text-[#475569]">{memory.aiFeedback.suggestedAction}</p>
                </div>
              </div>
              {feedbackVoiceStatus === 'unavailable' && (
                <p className="mt-3 rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-3 text-sm text-[#1a365d]">
                  Feedback voice is temporarily unavailable. Chime's text is still visible.
                </p>
              )}
            </div>
          )}
        </Card>

        <div className="mt-6 flex gap-3 flex-wrap">
          <Button onClick={onBack}>Back to memories</Button>
        </div>
      </div>
    </div>
  );
}
