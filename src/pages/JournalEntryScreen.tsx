import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { IconButton } from '../components/IconButton';
import { ChildSidebar } from '../components/ChildSidebar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { ArrowLeft, Save, Sparkles, Mic, MicOff, Bold, Italic, Underline, Type, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Heart, MessageCircle, CheckCircle, Volume2, VolumeX, RefreshCw, RotateCcw } from 'lucide-react';
import { api, type JournalCreateResponse } from '../services/api';
import {
  formatConfidence,
  getJournalConfidence,
  getJournalFeedback,
  getJournalMoodLabel,
  getJournalSentiment,
  htmlToText,
  moodColor,
  moodEmoji,
} from '../services/journalAdapters';

interface JournalEntryScreenProps {
  onBack: () => void;
  onSave?: () => void;
  childName?: string;
  childId?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function JournalEntryScreen({ onBack, onSave, childName = 'Friend', childId, onNavigate, onLogout }: JournalEntryScreenProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasVoiceTranscript, setHasVoiceTranscript] = useState(false);
  const [fontSize, setFontSize] = useState('16');
  const [textAlign, setTextAlign] = useState('left');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStage, setSaveStage] = useState<'idle' | 'saving' | 'analyzing' | 'feedback'>('idle');
  const [saveResult, setSaveResult] = useState<JournalCreateResponse | null>(null);
  const [error, setError] = useState('');
  const [feedbackVoiceStatus, setFeedbackVoiceStatus] = useState<'idle' | 'loading' | 'playing' | 'ready' | 'unavailable'>('idle');
  const editorRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const feedbackAudioUrlRef = useRef<string | null>(null);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const handleSidebarNavigation = (page: string) => {
    if (page === 'home') {
      onBack();
    } else if (page === 'entry') {
      return; // Already here
    } else {
      onNavigate?.(page);
    }
  };

  const syncEditorContent = () => {
    setContent(editorRef.current?.innerHTML || '');
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const applyEditorCommand = (command: string, value?: string) => {
    focusEditor();
    document.execCommand(command, false, value);
    syncEditorContent();
  };

  const setEditorAlignment = (alignment: 'left' | 'center' | 'right') => {
    setTextAlign(alignment);
    const commandMap = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
    };

    applyEditorCommand(commandMap[alignment]);
  };

  useEffect(() => {
    return () => {
      feedbackAudioRef.current?.pause();
      if (feedbackAudioUrlRef.current) {
        URL.revokeObjectURL(feedbackAudioUrlRef.current);
      }
    };
  }, []);

  const sanitizeEditorHtml = (html: string) =>
    html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
      .replace(/\son\w+="[^"]*"/gi, '')
      .replace(/\son\w+='[^']*'/gi, '')
      .replace(/\shref=["']javascript:[^"']*["']/gi, '')
      .trim();

  const insertTextIntoEditor = (text: string) => {
    focusEditor();
    const html = text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${paragraph.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
      .join('');

    document.execCommand('insertHTML', false, html);
    syncEditorContent();
  };

  const stopMediaStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError('');

    try {
      const { transcript } = await api.voice.speechToText(audioBlob);
      const cleanTranscript = transcript.trim();

      if (!cleanTranscript) {
        setError('I could not hear any words in that recording. Please try again.');
        return;
      }

      if (htmlToText(content)) {
        insertTextIntoEditor(`\n\n${cleanTranscript}`);
      } else {
        setContent(`<p>${cleanTranscript.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`);
        if (editorRef.current) {
          editorRef.current.innerHTML = `<p>${cleanTranscript.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
        }
      }
      setHasVoiceTranscript(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speech-to-text failed.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Your browser does not support microphone recording.');
      return;
    }

    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        stopMediaStream();
        mediaRecorderRef.current = null;

        if (audioBlob.size > 0) {
          void transcribeAudio(audioBlob);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      stopMediaStream();
      setIsRecording(false);
      setError(err instanceof Error ? err.message : 'Could not access your microphone.');
    }
  };

  const handleSave = async () => {
    setError('');
    setSaveResult(null);
    feedbackAudioRef.current?.pause();
    feedbackAudioRef.current = null;
    if (feedbackAudioUrlRef.current) {
      URL.revokeObjectURL(feedbackAudioUrlRef.current);
      feedbackAudioUrlRef.current = null;
    }
    setFeedbackVoiceStatus('idle');

    if (!childId) {
      setError('Please log in as a child before saving an entry.');
      return;
    }

    if (!htmlToText(content)) {
      setError('Write a little something before saving.');
      return;
    }

    setIsSaving(true);
    setSaveStage('saving');
    let stageTimer: number | undefined;
    let feedbackTimer: number | undefined;
    try {
      const cleanContent = sanitizeEditorHtml(content);
      stageTimer = window.setTimeout(() => setSaveStage('analyzing'), 500);
      feedbackTimer = window.setTimeout(() => setSaveStage('feedback'), 1200);
      const data = await api.journals.create({
        childId,
        title: title.trim() || undefined,
        content: cleanContent,
        inputType: hasVoiceTranscript ? 'voice' : 'text',
        source: hasVoiceTranscript ? 'speech-to-text' : 'manual',
      });

      if (stageTimer) window.clearTimeout(stageTimer);
      if (feedbackTimer) window.clearTimeout(feedbackTimer);
      setSaveStage('feedback');
      setSaveResult(data);
    } catch (err) {
      if (stageTimer) window.clearTimeout(stageTimer);
      if (feedbackTimer) window.clearTimeout(feedbackTimer);
      setError(err instanceof Error ? err.message : 'Could not save this entry.');
    } finally {
      setIsSaving(false);
      setSaveStage('idle');
    }
  };

  const createdJournal = saveResult?.journal;
  const createdMood = saveResult?.mood;
  const createdFeedback = getJournalFeedback(createdJournal, saveResult?.aiFeedback || saveResult?.feedback);
  const createdMoodLabel = getJournalMoodLabel(createdJournal, createdMood);
  const createdSentiment = getJournalSentiment(createdJournal, createdMood);
  const createdConfidence = getJournalConfidence(createdJournal, createdMood);
  const feedbackUnavailable =
    Boolean(saveResult) &&
    (!createdFeedback || createdFeedback.source === 'safe-fallback' || createdMood?.status === 'failed');

  const getCreatedFeedbackText = () => {
    if (!createdFeedback) return '';

    return [
      createdFeedback.message,
      createdFeedback.reflectionPrompt ? `Reflection prompt: ${createdFeedback.reflectionPrompt}` : '',
      createdFeedback.suggestedAction ? `Suggested action: ${createdFeedback.suggestedAction}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  };

  const handlePlayCreatedFeedback = async () => {
    const feedbackText = getCreatedFeedbackText();
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

  const aiPrompts = [
    "Tell me about the best part of your day! 🌟",
    "What made you smile today?",
    "Did you learn something new?",
    "Who did you spend time with?",
    "What are you grateful for today?",
  ];

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
          activeItem="entry"
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
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                {!onNavigate && (
                  <IconButton variant="child-yellow" size="medium" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5" />
                  </IconButton>
                )}
                <h1 className="text-[#1a365d] text-xl sm:text-2xl lg:text-3xl">New Journal Entry ✍️</h1>
              </div>
              <Button 
                variant="child-yellow" 
                icon={<Save className="w-5 h-5" />}
                onClick={handleSave}
                size="medium"
                className="hidden sm:flex"
                disabled={isSaving || isRecording || isTranscribing}
              >
                {isSaving ? 'Saving...' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
          {/* Avatar Interaction */}
          <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-yellow)]/20">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[var(--child-peach)] flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-2xl sm:text-3xl">🌟</span>
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-[#2d3748] text-sm sm:text-base">
                  Hey {childName}! I'm excited to hear about your day. {aiPrompts[Math.floor(Math.random() * aiPrompts.length)]}
                </p>
                <p className="text-xs sm:text-sm text-[#64748b]">
                  💡 Tip: You can write or use the microphone to speak!
                </p>
              </div>
            </div>
          </Card>

          {/* Title Input */}
          <Card variant="child">
            <div className="space-y-3">
              <label className="text-[#2d3748] text-sm sm:text-base">Give your entry a title ✨</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Amazing Day..."
                className="w-full px-4 py-3 rounded-full border-2 border-[var(--child-blue)] focus:border-[var(--child-blue-dark)] focus:outline-none focus:ring-4 focus:ring-[var(--child-blue)]/20 bg-white transition-all text-sm sm:text-base"
              />
            </div>
          </Card>

          {/* Content Entry with Rich Text Tools */}
          <Card variant="child">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[#2d3748] text-sm sm:text-base">Tell me about your day 📖</label>
                <IconButton 
                  variant={isRecording ? "child-peach" : "child-blue"}
                  size="medium"
                  onClick={handleToggleRecording}
                  disabled={isTranscribing}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </IconButton>
              </div>

              {/* Rich Text Editing Toolbar */}
              <div className="bg-gray-50 rounded-2xl p-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                  <button
                    type="button"
                    onClick={() => applyEditorCommand('bold')}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4 text-[#64748b]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEditorCommand('italic')}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4 text-[#64748b]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEditorCommand('underline')}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4 text-[#64748b]" />
                  </button>
                </div>

                <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                  <Type className="w-4 h-4 text-[#64748b]" />
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-gray-300 text-xs bg-white"
                  >
                    <option value="12">Small</option>
                    <option value="16">Normal</option>
                    <option value="20">Large</option>
                    <option value="24">X-Large</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                  <button
                    type="button"
                    onClick={() => applyEditorCommand('insertUnorderedList')}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4 text-[#64748b]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEditorCommand('insertOrderedList')}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4 text-[#64748b]" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditorAlignment('left')}
                    className={`p-2 rounded-lg transition-colors ${textAlign === 'left' ? 'bg-white' : 'hover:bg-white'}`}
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4 text-[#64748b]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorAlignment('center')}
                    className={`p-2 rounded-lg transition-colors ${textAlign === 'center' ? 'bg-white' : 'hover:bg-white'}`}
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4 text-[#64748b]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorAlignment('right')}
                    className={`p-2 rounded-lg transition-colors ${textAlign === 'right' ? 'bg-white' : 'hover:bg-white'}`}
                    title="Align Right"
                  >
                    <AlignRight className="w-4 h-4 text-[#64748b]" />
                  </button>
                </div>
              </div>

              {isRecording && (
                <div className="bg-[var(--child-peach)]/20 border-2 border-[var(--child-peach)] rounded-[1.5rem] p-3 sm:p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <p className="text-[#7c2d12] text-xs sm:text-sm">Listening... Speak clearly into your microphone 🎤</p>
                  </div>
                </div>
              )}

              {isTranscribing && (
                <div className="bg-[var(--child-blue)]/15 border-2 border-[var(--child-blue)] rounded-[1.5rem] p-3 sm:p-4">
                  <p className="text-[#1a365d] text-xs sm:text-sm">Turning your voice into journal text...</p>
                </div>
              )}

              {isSaving && (
                <div className="bg-[var(--child-mint)]/20 border-2 border-[var(--child-mint)] rounded-[1.5rem] p-3 sm:p-4">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { id: 'saving', label: 'Saving journal' },
                      { id: 'analyzing', label: 'Analyzing mood' },
                      { id: 'feedback', label: 'Preparing feedback' },
                    ].map((stage) => {
                      const active =
                        saveStage === stage.id ||
                        (stage.id === 'saving' && ['analyzing', 'feedback'].includes(saveStage)) ||
                        (stage.id === 'analyzing' && saveStage === 'feedback');

                      return (
                        <div
                          key={stage.id}
                          className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs sm:text-sm ${
                            active ? 'bg-white text-[#065f46]' : 'bg-white/50 text-[#64748b]'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          {stage.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div
                ref={editorRef}
                contentEditable
                role="textbox"
                aria-label="Journal content"
                data-placeholder="Today was special because..."
                onInput={syncEditorContent}
                style={{
                  fontSize: `${fontSize}px`,
                  textAlign: textAlign,
                }}
                className="journal-rich-editor min-h-[16rem] w-full overflow-auto px-4 sm:px-6 py-3 sm:py-4 rounded-[1.5rem] border-2 border-[var(--child-blue)] focus:border-[var(--child-blue-dark)] focus:outline-none focus:ring-4 focus:ring-[var(--child-blue)]/20 bg-white transition-all"
              />

              <div className="flex items-center justify-between text-xs sm:text-sm text-[#64748b]">
                <span>{htmlToText(content).length} characters</span>
                <span>💡 No rush, take your time!</span>
              </div>
            </div>
          </Card>

          {/* AI Suggestions */}
          {false && content.length > 50 && (
            <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-mint)]/20">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--child-mint)] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-[#065f46]" fill="currentColor" />
                </div>
                <div className="flex-1 space-y-3">
                  <h4 className="text-[#2d3748] text-base sm:text-lg">Chime's Thoughts 💭</h4>
                  <p className="text-[#4a5568] text-sm sm:text-base">
                    Save your entry to see Chime's mood insight and feedback.
                  </p>
                  <Button
                    variant="child-mint"
                    size="small"
                    icon={<Sparkles className="w-4 h-4" fill="currentColor" />}
                    onClick={() => onNavigate?.('story-mode')}
                  >
                    Create Story
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {saveResult && createdJournal && (
            <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-mint)]/20">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className={`w-14 h-14 rounded-full bg-[var(--${moodColor(createdMoodLabel)})] flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <span className="text-2xl">{moodEmoji(createdMoodLabel)}</span>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="text-[#2d3748] text-base sm:text-lg">Chime's Thoughts</h4>
                      {createdFeedback && (
                        <Button
                          variant={feedbackVoiceStatus === 'unavailable' ? 'child-slate' : 'child-mint'}
                          size="small"
                          icon={
                            feedbackVoiceStatus === 'loading' ? <RefreshCw className="w-4 h-4 animate-spin" /> :
                            feedbackVoiceStatus === 'playing' ? <VolumeX className="w-4 h-4" /> :
                            feedbackVoiceStatus === 'ready' ? <RotateCcw className="w-4 h-4" /> :
                            <Volume2 className="w-4 h-4" />
                          }
                          onClick={handlePlayCreatedFeedback}
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
                      )}
                    </div>
                    <p className="text-sm text-[#64748b]">
                      Mood: <span className="capitalize">{createdMoodLabel}</span> - Sentiment: <span className="capitalize">{createdSentiment}</span> - Confidence: {formatConfidence(createdConfidence)}
                    </p>
                  </div>

                  {createdFeedback ? (
                    <div className="space-y-3">
                      <p className="text-[#4a5568] text-sm sm:text-base">{createdFeedback.message}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white p-4">
                          <div className="flex items-center gap-2 text-[#1a365d] mb-2">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm font-semibold">Reflection prompt</span>
                          </div>
                          <p className="text-sm text-[#4a5568]">{createdFeedback.reflectionPrompt}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-4">
                          <div className="flex items-center gap-2 text-[#065f46] mb-2">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm font-semibold">Suggested action</span>
                          </div>
                          <p className="text-sm text-[#4a5568]">{createdFeedback.suggestedAction}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#64748b]">Your journal was saved, but feedback is not available yet.</p>
                  )}

                  {feedbackUnavailable && (
                    <div className="rounded-2xl border-2 border-[var(--child-yellow)] bg-[var(--child-yellow)]/20 p-3 text-sm text-[#744210]">
                      Your entry was saved. Chime used gentle fallback feedback because AI feedback was unavailable or unsure.
                    </div>
                  )}

                  {feedbackVoiceStatus === 'unavailable' && (
                    <div className="rounded-2xl border-2 border-[var(--child-blue)] bg-[var(--child-blue)]/15 p-3 text-sm text-[#1a365d]">
                      Feedback voice is temporarily unavailable. Chime's text is still visible.
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="child-mint"
                      size="small"
                      icon={<Sparkles className="w-4 h-4" fill="currentColor" />}
                      onClick={() => onNavigate?.('story-mode')}
                    >
                      Create Story
                    </Button>
                    <Button variant="child-blue" size="small" onClick={onSave}>
                      Back Home
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {error && (
            <Card variant="child" className="border-2 border-red-200 bg-red-50">
              <p className="text-center text-sm text-red-700">{error}</p>
            </Card>
          )}

          {/* Save Button (Mobile) */}
          <div className="sm:hidden">
            <Button 
              variant="child-yellow" 
              size="large"
              icon={<Save className="w-5 h-5" />}
              onClick={handleSave}
              className="w-full"
              disabled={isSaving || isRecording || isTranscribing}
            >
              {isSaving ? 'Saving...' : 'Save My Entry'}
            </Button>
          </div>

          {/* Save Button (Bottom) - All Screens */}
          <div className="hidden sm:block pb-6">
            <Button 
              variant="child-yellow" 
              size="large"
              icon={<Save className="w-5 h-5" />}
              onClick={handleSave}
              className="w-full"
              disabled={isSaving || isRecording || isTranscribing}
            >
              {isSaving ? 'Saving...' : 'Save My Entry ✨'}
            </Button>
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
