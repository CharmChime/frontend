import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';
import { ChildSidebar } from '../components/ChildSidebar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { ChildPageLoader } from '../components/PageLoaders';
import { ArrowLeft, Volume2, VolumeX, Star, Share2, Trash2, Edit, Calendar, Heart, Sparkles, Wand2, RefreshCw, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import {
  formatConfidence,
  formatDate,
  getJournalConfidence,
  getJournalFeedback,
  getJournalMoodLabel,
  getJournalSentiment,
  htmlToText,
  moodColor,
  moodEmoji,
  readingTime,
  sanitizeRichTextHtml,
  wordCount,
} from '../services/journalAdapters';

interface JournalDetailScreenProps {
  onBack: () => void;
  childName?: string;
  childAvatar?: string;
  childId?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  entryId?: string;
}

export function JournalDetailScreen({ 
  onBack, 
  childName = 'Friend', 
  childAvatar,
  childId,
  onNavigate,
  onLogout,
  entryId = ''
}: JournalDetailScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [entry, setEntry] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [entryVoiceStatus, setEntryVoiceStatus] = useState<'idle' | 'loading' | 'playing' | 'ready' | 'unavailable'>('idle');
  const [feedbackVoiceStatus, setFeedbackVoiceStatus] = useState<'idle' | 'loading' | 'playing' | 'ready' | 'unavailable'>('idle');
  const entryAudioRef = useRef<HTMLAudioElement | null>(null);
  const entryAudioUrlRef = useRef<string | null>(null);
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const feedbackAudioUrlRef = useRef<string | null>(null);
  const editContentRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const handleSidebarNavigation = (page: string) => {
    if (page === 'memories') {
      onBack();
    } else if (page === 'home') {
      onNavigate?.('home');
    } else {
      onNavigate?.(page);
    }
  };

  useEffect(() => {
    if (!entryId) {
      setEntry(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError('');

    api.journals
      .get(entryId)
      .then(({ journal }) => {
        const mood = getJournalMoodLabel(journal);
        if (isMounted) {
          setEntry({
            id: journal.id,
            title: journal.title,
            content: journal.content,
            mood,
            sentiment: getJournalSentiment(journal),
            confidence: getJournalConfidence(journal),
            aiFeedback: getJournalFeedback(journal),
            moodEmoji: moodEmoji(mood),
            date: formatDate(journal.createdAt),
            time: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(journal.createdAt)),
            tag: journal.inputType === 'voice' ? 'Voice' : 'Journal',
            color: moodColor(mood),
            wordCount: wordCount(journal.content),
            readingTime: readingTime(journal.content),
          });
        }
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'Could not load this journal entry.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [entryId]);

  useEffect(() => {
    return () => {
      entryAudioRef.current?.pause();
      feedbackAudioRef.current?.pause();
      if (entryAudioUrlRef.current) URL.revokeObjectURL(entryAudioUrlRef.current);
      if (feedbackAudioUrlRef.current) URL.revokeObjectURL(feedbackAudioUrlRef.current);
    };
  }, []);

  const voices = [
    {
      id: 'cheerful',
      name: 'Cheerful Charlie',
      emoji: '😄',
      description: 'Happy and energetic!',
      color: 'from-yellow-400 to-orange-400',
      icon: '🌟'
    },
    {
      id: 'calm',
      name: 'Calm Casey',
      emoji: '😌',
      description: 'Soothing and gentle',
      color: 'from-blue-400 to-cyan-400',
      icon: '🌊'
    },
    {
      id: 'storyteller',
      name: 'Story Sam',
      emoji: '📚',
      description: 'Dramatic storyteller',
      color: 'from-purple-400 to-pink-400',
      icon: '✨'
    },
    {
      id: 'robot',
      name: 'Robot Rosie',
      emoji: '🤖',
      description: 'Funny robot voice',
      color: 'from-gray-400 to-slate-500',
      icon: '⚡'
    },
    {
      id: 'pirate',
      name: 'Pirate Pete',
      emoji: '🏴‍☠️',
      description: 'Arrr matey!',
      color: 'from-amber-600 to-red-600',
      icon: '⚓'
    },
    {
      id: 'fairy',
      name: 'Fairy Flora',
      emoji: '🧚',
      description: 'Magical and sweet',
      color: 'from-pink-400 to-rose-400',
      icon: '🪄'
    },
  ];

  const getVoiceStyle = (voiceId: string): 'normal' | 'fun' | 'story' => {
    if (['storyteller', 'fairy'].includes(voiceId)) return 'story';
    if (['robot', 'pirate'].includes(voiceId)) return 'fun';
    return 'normal';
  };

  const handlePlayVoice = async (voiceId: string) => {
    if (!entry) return;

    if (entryAudioRef.current && selectedVoice === voiceId && entryVoiceStatus === 'playing') {
      entryAudioRef.current.pause();
      entryAudioRef.current.currentTime = 0;
      setEntryVoiceStatus('ready');
      return;
    }

    entryAudioRef.current?.pause();
    if (entryAudioUrlRef.current) {
      URL.revokeObjectURL(entryAudioUrlRef.current);
      entryAudioUrlRef.current = null;
    }
    entryAudioRef.current = null;
    setSelectedVoice(voiceId);
    setIsPlaying(true);
    setEntryVoiceStatus('loading');
    setActionMessage('');

    try {
      const audioBlob = await api.voice.funVoice({
        text: htmlToText(entry.content),
        voiceStyle: getVoiceStyle(voiceId),
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      entryAudioUrlRef.current = audioUrl;
      entryAudioRef.current = audio;
      audio.onended = () => {
        setIsPlaying(false);
        setEntryVoiceStatus('ready');
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setEntryVoiceStatus('unavailable');
        setActionMessage('Voice is temporarily unavailable. Your journal text is still here to read.');
      };

      await audio.play();
      setEntryVoiceStatus('playing');
    } catch (err) {
      setIsPlaying(false);
      setEntryVoiceStatus('unavailable');
      setActionMessage(err instanceof Error ? err.message : 'Voice is temporarily unavailable.');
    }
  };

  const handleStopVoice = () => {
    entryAudioRef.current?.pause();
    if (entryAudioRef.current) entryAudioRef.current.currentTime = 0;
    setIsPlaying(false);
    setEntryVoiceStatus('ready');
  };

  const getFeedbackText = () => {
    if (!entry?.aiFeedback) return '';

    return [
      entry.aiFeedback.message,
      entry.aiFeedback.reflectionPrompt ? `Reflection prompt: ${entry.aiFeedback.reflectionPrompt}` : '',
      entry.aiFeedback.suggestedAction ? `Suggested action: ${entry.aiFeedback.suggestedAction}` : '',
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
    setActionMessage('');

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
        audio.onerror = () => {
          setFeedbackVoiceStatus('unavailable');
          setActionMessage("Feedback voice is temporarily unavailable. Chime's text is still visible.");
        };
      }

      feedbackAudioRef.current.currentTime = 0;
      await feedbackAudioRef.current.play();
      setFeedbackVoiceStatus('playing');
    } catch (err) {
      setFeedbackVoiceStatus('unavailable');
      setActionMessage(err instanceof Error ? err.message : 'Feedback voice is temporarily unavailable.');
    }
  };

  const handleShareEntry = async () => {
    const shareText = `${entry.title}\n\n${htmlToText(entry.content)}`;

    if (navigator.share) {
      await navigator.share({ title: entry.title, text: shareText }).catch(() => undefined);
      return;
    }

    await navigator.clipboard?.writeText(shareText);
    setActionMessage('Entry copied so you can share it with family.');
  };

  const handleDeleteEntry = async () => {
    await api.journals.remove(entry.id);
    onBack();
  };

  const handleEditEntry = () => {
    setDraftTitle(entry.title);
    setIsEditing(true);
    setActionMessage('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraftTitle('');
    setActionMessage('');
  };

  const handleSaveEdit = async () => {
    const cleanTitle = draftTitle.trim();
    const cleanContent = sanitizeRichTextHtml(editContentRef.current?.innerHTML || '').trim();

    if (!cleanTitle || !htmlToText(cleanContent)) {
      setActionMessage('A title and journal text are required.');
      return;
    }

    setIsSavingEdit(true);
    setActionMessage('');

    try {
      const { journal } = await api.journals.update(entry.id, {
        title: cleanTitle,
        content: cleanContent,
      });
      setEntry((current: any) => ({
        ...current,
        title: journal.title,
        content: journal.content,
        wordCount: wordCount(journal.content),
        readingTime: readingTime(journal.content),
      }));
      setIsEditing(false);
      setActionMessage('Journal entry updated successfully.');
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Could not update this journal entry.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCreateStory = () => {
    onNavigate?.('story-mode');
  };

  if (isLoading || error || !entry) {
    return (
      <div className="min-h-screen bg-[var(--child-bg)] flex items-center justify-center p-6">
        {isLoading ? (
          <div className="w-full max-w-2xl">
            <ChildPageLoader
              childName={childName}
              childAvatar={childAvatar}
              message="Opening your memory and getting the story details ready."
            />
          </div>
        ) : (
        <Card variant="child" className="max-w-lg text-center">
          <div className="space-y-4">
            <h2 className="text-[#2d3748]">
              {error ? 'Memory unavailable' : 'Memory not found'}
            </h2>
            <p className="text-[#64748b]">
              {error || 'This journal entry could not be found.'}
            </p>
            <Button variant="child-blue" onClick={onBack}>
              Back to memories
            </Button>
          </div>
        </Card>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--child-bg)] flex">
      {/* Mobile Menu Button */}
      {onNavigate && onLogout && (
        <MobileMenuButton onClick={() => setIsSidebarOpen(true)} />
      )}

      {/* Sidebar */}
      {onNavigate && onLogout && (
        <ChildSidebar 
          childName={childName}
          childAvatar={childAvatar}
          childId={childId}
          activeItem="memories"
          onNavigate={handleSidebarNavigation}
          onLogout={() => setShowLogoutConfirm(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogoClick={onBack}
        />
      )}

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-[var(--child-blue)] to-[var(--child-mint)] shadow-lg sticky top-0 z-10">
          <div className="pl-20 pr-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <IconButton variant="child-yellow" size="medium" onClick={onBack}>
                  <ArrowLeft className="w-5 h-5" />
                </IconButton>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={draftTitle}
                      onChange={(event) => setDraftTitle(event.target.value)}
                      disabled={isSavingEdit}
                      className="w-full max-w-xl rounded-lg border border-white/70 bg-white px-3 py-2 text-xl text-[#1a365d] outline-none focus:ring-2 focus:ring-[var(--child-yellow)] sm:text-2xl"
                      aria-label="Journal title"
                    />
                  ) : (
                    <h1 className="text-[#1a365d] text-xl sm:text-2xl lg:text-3xl truncate">{entry.title}</h1>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="child-yellow" className="text-xs sm:text-sm">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {entry.date}
                    </Badge>
                    <Badge variant="child-slate" className="text-xs sm:text-sm">
                      {entry.wordCount} words
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <IconButton 
                  variant={isFavorite ? "child-yellow" : "child-blue"}
                  size="medium"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Star className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
                </IconButton>
                <IconButton variant="child-mint" size="medium" onClick={handleShareEntry}>
                  <Share2 className="w-5 h-5" />
                </IconButton>
                <IconButton variant="child-peach" size="medium" onClick={handleEditEntry}>
                  <Edit className="w-5 h-5" />
                </IconButton>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
          {/* Mood & Info */}
          <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-yellow)]/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--${entry.color})] flex items-center justify-center shadow-lg flex-shrink-0`}>
                <span className="text-3xl sm:text-4xl">{entry.moodEmoji}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[#2d3748] mb-2 text-lg sm:text-xl">Feeling {entry.mood} today!</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="child-blue">{entry.tag}</Badge>
                  <Badge variant="child-slate">{entry.time}</Badge>
                  <Badge variant="child-mint">📖 {entry.readingTime} read</Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-mint)]/20">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="child-blue">Mood: {entry.mood}</Badge>
                <Badge variant="child-lavender">Sentiment: {entry.sentiment}</Badge>
                <Badge variant="child-yellow">Confidence: {formatConfidence(entry.confidence)}</Badge>
              </div>
              {entry.aiFeedback ? (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-[#065f46]" fill="currentColor" />
                      <h3 className="text-[#2d3748] text-lg sm:text-xl">Chime's Thoughts</h3>
                    </div>
                    <Button
                      variant={feedbackVoiceStatus === 'unavailable' ? 'child-slate' : 'child-mint'}
                      size="small"
                      icon={
                        feedbackVoiceStatus === 'loading' ? <RefreshCw className="w-4 h-4 animate-spin" /> :
                        feedbackVoiceStatus === 'playing' ? <VolumeX className="w-4 h-4" /> :
                        feedbackVoiceStatus === 'ready' ? <RotateCcw className="w-4 h-4" /> :
                        <Volume2 className="w-4 h-4" />
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
                  <p className="text-[#4a5568] text-sm sm:text-base">{entry.aiFeedback.message}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="mb-2 text-sm font-semibold text-[#1a365d]">Reflection prompt</p>
                      <p className="text-sm text-[#4a5568]">{entry.aiFeedback.reflectionPrompt}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="mb-2 text-sm font-semibold text-[#065f46]">Suggested action</p>
                      <p className="text-sm text-[#4a5568]">{entry.aiFeedback.suggestedAction}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#64748b]">AI feedback is not available for this journal yet.</p>
              )}
            </div>
          </Card>

          {/* Fun Voice Selection */}
          <Card variant="child">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-6 h-6 text-[var(--child-lavender)]" />
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Choose a Fun Voice! 🎭</h3>
              </div>
              <p className="text-[#64748b] text-sm sm:text-base">
                Pick a voice to read your journal entry aloud. Each one sounds different and fun!
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => handlePlayVoice(voice.id)}
                    disabled={entryVoiceStatus === 'loading'}
                    className={`
                      p-3 sm:p-4 rounded-[1.5rem]
                      transition-all duration-200
                      flex flex-col items-center gap-2
                      ${selectedVoice === voice.id && isPlaying
                        ? `bg-gradient-to-br ${voice.color} shadow-lg scale-105 text-white animate-pulse`
                        : selectedVoice === voice.id
                        ? `bg-gradient-to-br ${voice.color} shadow-lg text-white`
                        : 'bg-gray-50 hover:bg-gray-100'
                      }
                      ${entryVoiceStatus === 'loading' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}
                  >
                    <span className="text-2xl sm:text-3xl">{voice.emoji}</span>
                    <div className="text-center">
                      <p className={`text-xs sm:text-sm ${selectedVoice === voice.id ? 'text-white font-semibold' : 'text-[#2d3748]'}`}>
                        {voice.name}
                      </p>
                      <p className={`text-xs ${selectedVoice === voice.id ? 'text-white/90' : 'text-[#64748b]'}`}>
                        {voice.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Play Controls */}
              {selectedVoice && (
                <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[var(--child-lavender)]/20 to-[var(--child-peach)]/20 rounded-[1.5rem]">
                  {entryVoiceStatus === 'loading' || entryVoiceStatus === 'playing' ? (
                    <>
                      <div className="flex items-center gap-2 text-[#2d3748]">
                        <div className="flex gap-1">
                          <div className="w-1 h-4 bg-[var(--child-lavender)] rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 h-4 bg-[var(--child-lavender)] rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1 h-4 bg-[var(--child-lavender)] rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm sm:text-base">
                          {entryVoiceStatus === 'loading'
                            ? `Generating ${voices.find(v => v.id === selectedVoice)?.name}...`
                            : `Playing with ${voices.find(v => v.id === selectedVoice)?.name}...`}
                        </span>
                      </div>
                      <Button 
                        variant="child-peach" 
                        size="small" 
                        icon={<VolumeX className="w-4 h-4" />}
                        onClick={handleStopVoice}
                      >
                        Stop
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm sm:text-base text-[#2d3748]">
                        {entryVoiceStatus === 'unavailable'
                          ? 'Voice is unavailable right now.'
                          : `Ready with ${voices.find(v => v.id === selectedVoice)?.name}!`}
                      </span>
                      <Button 
                        variant="child-lavender" 
                        size="small" 
                        icon={entryVoiceStatus === 'ready' ? <RotateCcw className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        onClick={() => handlePlayVoice(selectedVoice)}
                      >
                        {entryVoiceStatus === 'ready' ? 'Replay Audio' : 'Try Again'}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Journal Content */}
          <Card variant="child">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--child-blue)]" fill="currentColor" />
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Your Story</h3>
              </div>
              {isEditing ? (
                <div className="space-y-3">
                  <div
                    ref={editContentRef}
                    contentEditable={!isSavingEdit}
                    suppressContentEditableWarning
                    className="journal-rich-content min-h-48 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-[#2d3748] outline-none focus:ring-2 focus:ring-[var(--child-blue)] sm:text-base lg:text-lg"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(entry.content) }}
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="child-slate"
                      size="small"
                      onClick={handleCancelEdit}
                      disabled={isSavingEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="child-blue"
                      size="small"
                      onClick={handleSaveEdit}
                      disabled={isSavingEdit}
                    >
                      {isSavingEdit ? 'Saving...' : 'Save Entry'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-lg max-w-none">
                  <div
                    className="journal-rich-content text-[#2d3748] leading-relaxed text-sm sm:text-base lg:text-lg"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(entry.content) }}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-mint)]/10">
            <div className="space-y-4">
              <h4 className="text-[#2d3748] text-base sm:text-lg">What would you like to do?</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="child-lavender" 
                  size="medium"
                  icon={<Wand2 className="w-5 h-5" />}
                  className="w-full"
                  onClick={handleCreateStory}
                >
                  Turn into a Story
                </Button>
                <Button 
                  variant="child-blue" 
                  size="medium"
                  icon={<Share2 className="w-5 h-5" />}
                  className="w-full"
                  onClick={handleShareEntry}
                >
                  Share with Family
                </Button>
                <Button 
                  variant="child-peach" 
                  size="medium"
                  icon={<Edit className="w-5 h-5" />}
                  className="w-full"
                  onClick={handleEditEntry}
                >
                  Edit Entry
                </Button>
                <Button 
                  variant="child-slate" 
                  size="medium"
                  icon={<Trash2 className="w-5 h-5" />}
                  className="w-full"
                  onClick={handleDeleteEntry}
                >
                  Delete Entry
                </Button>
              </div>
              {actionMessage && (
                <p className="text-center text-sm text-[#065f46]">{actionMessage}</p>
              )}
            </div>
          </Card>

          {/* Memory Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card variant="child" padding="small">
              <div className="text-center">
                <span className="text-2xl mb-1 block">👀</span>
                <p className="text-lg sm:text-xl text-[#2d3748]">12</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Times Read</p>
              </div>
            </Card>
            <Card variant="child" padding="small">
              <div className="text-center">
                <span className="text-2xl mb-1 block">💭</span>
                <p className="text-lg sm:text-xl text-[#2d3748]">{entry.wordCount}</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Words</p>
              </div>
            </Card>
            <Card variant="child" padding="small">
              <div className="text-center">
                <span className="text-2xl mb-1 block">⏱️</span>
                <p className="text-lg sm:text-xl text-[#2d3748]">12m</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Time Spent</p>
              </div>
            </Card>
            <Card variant="child" padding="small">
              <div className="text-center">
                <span className="text-2xl mb-1 block">❤️</span>
                <p className="text-lg sm:text-xl text-[#2d3748] capitalize">{entry.mood}</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Mood</p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Logout Confirmation */}
      {onLogout && (
        <LogoutConfirmation 
          isOpen={showLogoutConfirm}
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
          variant="child"
        />
      )}
    </div>
  );
}

