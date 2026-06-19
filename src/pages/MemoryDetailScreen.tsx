import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';
import { ArrowLeft, Edit, Trash2, Heart, MessageCircle, Volume2, VolumeX, RefreshCw, RotateCcw, Wand2, Save, X } from 'lucide-react';
import { formatConfidence, htmlToText, readingTime, sanitizeRichTextHtml, wordCount } from '../services/journalAdapters';
import { api, type JournalFeedback, type Story } from '../services/api';
import { toast } from 'sonner';
import { useVoicePlayback } from '../hooks/useVoicePlayback';
import { funVoiceOptions, type FunVoiceCharacter } from '../services/voiceOptions';

export interface Memory {
  id: string;
  kind: 'journal' | 'story';
  journalId?: string;
  childId?: string;
  title: string;
  preview: string;
  content: string;
  mood: string;
  moodEmoji: string;
  date: string;
  time: string;
  createdAt: string;
  updatedAt?: string;
  tag: string;
  color: string;
  wordCount: number;
  readingTime: string;
  sentiment?: string;
  confidence?: number | null;
  aiFeedback?: JournalFeedback;
  moral?: string;
  theme?: string;
  storyLength?: string;
  model?: string;
  provider?: string;
}

const formatDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
};

interface MemoryDetailScreenProps {
  memory: Memory;
  onBack: () => void;
  onUpdated: (memory: Memory) => void;
  onDelete: (memoryId: string) => void;
  onStoryCreated?: (story: Story) => void;
  childName?: string;
}

export function MemoryDetailScreen({
  memory,
  onBack,
  onUpdated,
  onDelete,
  onStoryCreated,
  childName = 'Friend',
}: MemoryDetailScreenProps) {
  const [feedbackVoiceStatus, setFeedbackVoiceStatus] = useState<'idle' | 'loading' | 'playing' | 'ready' | 'unavailable'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftTitle, setDraftTitle] = useState(memory.title);
  const [generatedStory, setGeneratedStory] = useState<Story | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [selectedStoryVoice, setSelectedStoryVoice] = useState<FunVoiceCharacter>('storyteller');
  const storyVoice = useVoicePlayback();
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const feedbackAudioUrlRef = useRef<string | null>(null);
  const editContentRef = useRef<HTMLDivElement | null>(null);

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

  const startEditing = () => {
    if (memory.kind === 'story') return;
    setDraftTitle(memory.title);
    setIsEditing(true);
    setActionMessage('');
  };

  const cancelEditing = () => {
    setDraftTitle(memory.title);
    setIsEditing(false);
    setActionMessage('');
  };

  const saveEditing = async () => {
    if (memory.kind === 'story') return;
    const title = draftTitle.trim();
    const content = sanitizeRichTextHtml(editContentRef.current?.innerHTML || '').trim();

    if (!title || !htmlToText(content)) {
      setActionMessage('A title and journal text are required.');
      return;
    }

    setIsSaving(true);
    setActionMessage('');

    try {
      const { journal } = await api.journals.update(memory.id, { title, content });
      const updatedMemory: Memory = {
        ...memory,
        title: journal.title,
        content: journal.content,
        preview: htmlToText(journal.content).slice(0, 120),
        wordCount: wordCount(journal.content),
        readingTime: readingTime(journal.content),
      };
      onUpdated(updatedMemory);
      setIsEditing(false);
      setActionMessage('Memory updated successfully.');
      toast.success('Memory updated.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update this memory.';
      setActionMessage(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const turnIntoStory = async () => {
    if (memory.kind === 'story') return;
    setIsGeneratingStory(true);
    setActionMessage('');

    try {
      const { story } = await api.stories.generate({
        journalId: memory.id,
        theme: memory.mood || 'imagination',
        length: 'short',
      });
      setGeneratedStory(story);
      onStoryCreated?.(story);
      setActionMessage('Your story was generated and saved.');
      toast.success('Your story is ready.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not generate a story.';
      setActionMessage(message);
      toast.error(message);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handlePlayStory = async () => {
    const text = htmlToText(memory.content).trim();
    if (!text) {
      setActionMessage('This saved story has no text to read aloud.');
      return;
    }

    const voice = funVoiceOptions.find((option) => option.id === selectedStoryVoice);
    if (!voice) return;

    setActionMessage('');
    await storyVoice.play(
      `${memory.id}:${selectedStoryVoice}:${text}`,
      () => api.voice.funVoice({
        text,
        voiceStyle: voice.style,
        character: voice.id,
      }),
      'Story voice is temporarily unavailable. You can still read the story.'
    );
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
              <p className="text-sm text-[#1a365d]/70">
                {memory.kind === 'story' ? 'Story' : 'Memory'} detail for {childName}
              </p>
              {memory.kind === 'journal' && isEditing ? (
                <input
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  className="w-full rounded-xl border border-[#bfdbfe] bg-white px-3 py-2 text-2xl font-bold text-[#1a365d] outline-none focus:ring-2 focus:ring-[var(--child-blue)]"
                  disabled={isSaving}
                />
              ) : (
                <h1 className="text-3xl font-bold text-[#1a365d]">{memory.title}</h1>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {memory.kind === 'journal' && isEditing ? (
              <>
                <Button variant="child-slate" size="small" onClick={cancelEditing} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button variant="child-blue" size="small" onClick={saveEditing} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : memory.kind === 'journal' ? (
              <Button variant="child-blue" size="small" onClick={startEditing}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
            ) : null}
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
                {memory.mood && (
                  <span className="rounded-full bg-[#e2effb] px-3 py-1 text-sm text-[#1a365d]">
                    {memory.moodEmoji} {memory.mood}
                  </span>
                )}
              </div>
              <p className="text-sm text-[#475569]">
                {memory.date} - {memory.time} - {memory.readingTime}
              </p>
              {memory.kind === 'journal' && (
                <p className="text-sm text-[#475569]">
                  Sentiment: <span className="capitalize">{memory.sentiment || 'not available'}</span> - Confidence: {formatConfidence(memory.confidence)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#1a365d]/80">
              <span>{memory.wordCount} words</span>
            </div>
          </div>

          <div className="rounded-3xl border border-[#dbeafe] bg-white p-6 text-[#0f172a] shadow-sm">
            {memory.kind === 'story' ? (
              <div className="whitespace-pre-line leading-7 text-[#0f172a]">
                {htmlToText(memory.content)}
              </div>
            ) : isEditing ? (
              <div
                ref={editContentRef}
                contentEditable={!isSaving}
                suppressContentEditableWarning
                className="journal-rich-content min-h-48 rounded-2xl border border-[#bfdbfe] p-4 leading-7 outline-none focus:ring-2 focus:ring-[var(--child-blue)]"
                dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(memory.content) }}
              />
            ) : (
              <div
                className="journal-rich-content leading-7"
                dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(memory.content) }}
              />
            )}
          </div>

          {memory.kind === 'story' && (
            <div className="rounded-3xl border border-[#ddd6fe] bg-gradient-to-br from-white to-[#faf5ff] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-[#5b21b6]">Listen to this story</h3>
                  <label className="mb-1 block text-sm text-[#64748b]" htmlFor="saved-story-voice">
                    Choose a fun voice
                  </label>
                  <select
                    id="saved-story-voice"
                    value={selectedStoryVoice}
                    onChange={(event) => {
                      storyVoice.reset();
                      setSelectedStoryVoice(event.target.value as FunVoiceCharacter);
                    }}
                    className="w-full rounded-xl border border-[#ddd6fe] bg-white px-3 py-2 text-sm text-[#334155] sm:max-w-xs"
                  >
                    {funVoiceOptions.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.emoji} {voice.name} — {voice.description}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant={storyVoice.status === 'unavailable' ? 'child-slate' : 'child-lavender'}
                  size="small"
                  icon={
                    storyVoice.status === 'loading' ? <RefreshCw className="h-4 w-4 animate-spin" /> :
                    storyVoice.status === 'playing' ? <VolumeX className="h-4 w-4" /> :
                    storyVoice.status === 'ready' ? <RotateCcw className="h-4 w-4" /> :
                    <Volume2 className="h-4 w-4" />
                  }
                  onClick={handlePlayStory}
                  disabled={storyVoice.status === 'loading' || !htmlToText(memory.content).trim()}
                >
                  {storyVoice.status === 'loading'
                    ? 'Generating Voice...'
                    : storyVoice.status === 'playing'
                    ? 'Stop Audio'
                    : storyVoice.status === 'ready'
                    ? 'Replay Story'
                    : 'Listen to Story'}
                </Button>
              </div>
              {storyVoice.error && (
                <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{storyVoice.error}</p>
              )}
            </div>
          )}

          {memory.kind === 'story' && memory.moral && (
            <div className="rounded-3xl border border-[#fde68a] bg-[#fffbeb] p-5">
              <h3 className="mb-2 text-lg font-semibold text-[#92400e]">Story lesson</h3>
              <p className="text-sm text-[#78350f]">{memory.moral}</p>
            </div>
          )}

          {memory.kind === 'story' && (
            <div className="rounded-3xl border border-[#ddd6fe] bg-[#faf5ff] p-5">
              <h3 className="mb-3 text-lg font-semibold text-[#5b21b6]">Story details</h3>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {memory.theme && (
                  <div><dt className="text-[#6d28d9]">Theme</dt><dd className="capitalize text-[#334155]">{memory.theme}</dd></div>
                )}
                {memory.storyLength && (
                  <div><dt className="text-[#6d28d9]">Length</dt><dd className="capitalize text-[#334155]">{memory.storyLength}</dd></div>
                )}
                <div><dt className="text-[#6d28d9]">Created</dt><dd className="text-[#334155]">{memory.date} at {memory.time}</dd></div>
                {memory.updatedAt && memory.updatedAt !== memory.createdAt && formatDateTime(memory.updatedAt) && (
                  <div>
                    <dt className="text-[#6d28d9]">Last updated</dt>
                    <dd className="text-[#334155]">{formatDateTime(memory.updatedAt)}</dd>
                  </div>
                )}
                {childName && (
                  <div><dt className="text-[#6d28d9]">Child</dt><dd className="text-[#334155]">{childName}</dd></div>
                )}
                {memory.journalId && (
                  <div><dt className="text-[#6d28d9]">Source</dt><dd className="text-[#334155]">Journal memory</dd></div>
                )}
                {memory.provider && (
                  <div><dt className="text-[#6d28d9]">Generated with</dt><dd className="capitalize text-[#334155]">{memory.provider}</dd></div>
                )}
                {memory.model && (
                  <div><dt className="text-[#6d28d9]">Model</dt><dd className="break-words text-[#334155]">{memory.model}</dd></div>
                )}
              </dl>
            </div>
          )}

          {memory.kind === 'journal' && memory.aiFeedback && (
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

          {memory.kind === 'journal' && (
          <div className="rounded-3xl border border-[#ddd6fe] bg-[#faf5ff] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#5b21b6]">Turn this memory into a story</h3>
                <p className="text-sm text-[#6d28d9]">Generate and read the story here without leaving the memory.</p>
              </div>
              <Button
                variant="child-lavender"
                size="small"
                icon={isGeneratingStory ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                onClick={turnIntoStory}
                disabled={isGeneratingStory}
              >
                {isGeneratingStory ? 'Creating...' : generatedStory ? 'Generate Again' : 'Turn into Story'}
              </Button>
            </div>

            {generatedStory && (
              <div className="mt-4 rounded-2xl bg-white p-5">
                <h4 className="mb-3 text-xl font-semibold text-[#2d3748]">{generatedStory.title}</h4>
                <p className="whitespace-pre-line text-sm leading-7 text-[#475569]">{generatedStory.content}</p>
              </div>
            )}
          </div>
          )}
        </Card>

        <div className="mt-6 flex gap-3 flex-wrap">
          <Button onClick={onBack}>Back to memories</Button>
        </div>
        {actionMessage && (
          <p className="mt-3 text-center text-sm text-[#1a365d]">{actionMessage}</p>
        )}
      </div>
    </div>
  );
}
