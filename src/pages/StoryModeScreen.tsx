import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';
import { ChildSidebar } from '../components/ChildSidebar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { ArrowLeft, Wand2, Sparkles, BookOpen, Send, Volume2, Play, Pause, RotateCcw, Save, CheckCircle, RefreshCw, Star } from 'lucide-react';
import { api, type Journal } from '../services/api';
import { formatShortDate } from '../services/journalAdapters';
import { toast } from 'sonner';

interface StoryModeScreenProps {
  onBack: () => void;
  childName?: string;
  childAvatar?: string;
  childId?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function StoryModeScreen({ onBack, childName = 'Friend', childAvatar, childId, onNavigate, onLogout }: StoryModeScreenProps) {
  const [creationMode, setCreationMode] = useState<'journal' | 'prompt'>('prompt');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [storyPrompt, setStoryPrompt] = useState('');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [generatedStory, setGeneratedStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState<Journal[]>([]);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [storyVoiceStatus, setStoryVoiceStatus] = useState<'idle' | 'loading' | 'playing' | 'ready' | 'unavailable'>('idle');
  const storyAudioRef = useRef<HTMLAudioElement | null>(null);
  const storyAudioUrlRef = useRef<string | null>(null);
  const isReadingStory = storyVoiceStatus === 'loading' || storyVoiceStatus === 'playing';

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const handleSidebarNavigation = (page: string) => {
    if (page === 'story-mode') return; // Already here
    if (page === 'home') {
      onBack();
    } else {
      onNavigate?.(page);
    }
  };

  const themes = [
    { id: 'adventure', label: 'Adventure', emoji: '🗺️', icon: <Wand2 className="w-5 h-5" />, color: 'child-peach' },
    { id: 'fantasy', label: 'Fantasy', emoji: '🏰', icon: <BookOpen className="w-5 h-5" />, color: 'child-lavender' },
    { id: 'friendship', label: 'Friendship', emoji: '👫', icon: <Sparkles className="w-5 h-5" fill="currentColor" />, color: 'child-yellow' },
    { id: 'mystery', label: 'Mystery', emoji: '🔍', icon: <Sparkles className="w-5 h-5" fill="currentColor" />, color: 'child-blue' },
    { id: 'dragons', label: 'Dragons', emoji: '🐉', icon: <Sparkles className="w-5 h-5" />, color: 'child-mint' },
    { id: 'space', label: 'Space', emoji: '🚀', icon: <Wand2 className="w-5 h-5" />, color: 'child-peach' },
  ];

  useEffect(() => {
    if (!childId) {
      setJournalEntries([]);
      return;
    }

    api.journals
      .list({ childId })
      .then((data) => setJournalEntries(data.journals))
      .catch(() => setJournalEntries([]));
  }, [childId]);

  useEffect(() => {
    return () => {
      storyAudioRef.current?.pause();
      if (storyAudioUrlRef.current) {
        URL.revokeObjectURL(storyAudioUrlRef.current);
      }
    };
  }, []);

  const getMoodEmoji = (mood: string) => {
    switch(mood) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'calm': return '😌';
      case 'sad': return '😢';
      default: return '😐';
    }
  };

  const toggleEntrySelection = (id: string) => {
    setSelectedEntries(prev => 
      prev.includes(id) ? prev.filter(entryId => entryId !== id) : [...prev, id]
    );
  };

  const handleGenerateStory = async () => {
    if (!childId) {
      setError('Please log in as a child before generating a story.');
      toast.error('Please log in as a child before generating a story.');
      return;
    }

    setError('');
    setIsGenerating(true);
    storyAudioRef.current?.pause();
    storyAudioRef.current = null;
    if (storyAudioUrlRef.current) {
      URL.revokeObjectURL(storyAudioUrlRef.current);
      storyAudioUrlRef.current = null;
    }
    setStoryVoiceStatus('idle');
    try {
      let journalId = selectedEntries[0];

      if (creationMode === 'prompt') {
        const created = await api.journals.create({
          childId,
          title: storyPrompt.slice(0, 48),
          content: storyPrompt,
          inputType: 'text',
          source: 'manual',
        });
        journalId = created.journal.id;
      }

      const data = await api.stories.generate({
        journalId,
        theme: selectedTheme,
        length: 'short',
      });

      setGeneratedStory(data.story.content);
      toast.success('Your story is ready.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not generate a story.';
      setError(message);
      toast.error(message);
    } finally {
      if (creationMode === 'journal' && selectedEntries.length > 0) {
        setSelectedEntries((current) => current.slice(0, 1));
      }
      setIsGenerating(false);
    }
  };

  const canGenerate = creationMode === 'prompt' 
    ? selectedTheme && storyPrompt 
    : selectedTheme && selectedEntries.length > 0;

  const handleReadGeneratedStory = async () => {
    if (!generatedStory) return;

    if (storyAudioRef.current && storyVoiceStatus === 'playing') {
      storyAudioRef.current.pause();
      storyAudioRef.current.currentTime = 0;
      setStoryVoiceStatus('ready');
      return;
    }

    setError('');
    setActionMessage('');
    setStoryVoiceStatus('loading');

    try {
      if (!storyAudioRef.current) {
        const audioBlob = await api.voice.storyTts({ text: generatedStory });

        if (storyAudioUrlRef.current) {
          URL.revokeObjectURL(storyAudioUrlRef.current);
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        storyAudioUrlRef.current = audioUrl;
        storyAudioRef.current = audio;

        audio.onended = () => setStoryVoiceStatus('ready');
        audio.onerror = () => {
          setStoryVoiceStatus('unavailable');
          setError('Story voice is temporarily unavailable. You can still read the story below.');
        };
      }

      storyAudioRef.current.currentTime = 0;
      await storyAudioRef.current.play();
      setStoryVoiceStatus('playing');
      toast.info('Playing your story.');
    } catch (err) {
      setStoryVoiceStatus('unavailable');
      const message = err instanceof Error ? err.message : 'Story voice is temporarily unavailable. You can still read the story below.';
      setError(message);
      toast.error(message);
    }
  };

  const handleSaveStory = () => {
    setActionMessage('Story saved by the backend when it was generated.');
    toast.success('Story is saved in your memories.');
  };

  const handleContinueStory = () => {
    setCreationMode('prompt');
    setStoryPrompt(`${generatedStory}\n\nContinue this story with another magical scene.`);
    setGeneratedStory('');
    storyAudioRef.current?.pause();
    storyAudioRef.current = null;
    setStoryVoiceStatus('idle');
    setActionMessage('');
    toast.info('Ready to continue your story.');
  };

  const handleNewStory = () => {
    storyAudioRef.current?.pause();
    storyAudioRef.current = null;
    if (storyAudioUrlRef.current) {
      URL.revokeObjectURL(storyAudioUrlRef.current);
      storyAudioUrlRef.current = null;
    }
    setStoryVoiceStatus('idle');
    setGeneratedStory('');
    toast.info('Started a new story.');
  };

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
          activeItem="story-mode"
          onNavigate={handleSidebarNavigation}
          onLogout={() => setShowLogoutConfirm(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogoClick={onBack}
        />
      )}

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-[var(--child-lavender)] to-[var(--child-peach)] shadow-lg sticky top-0 z-10">
          <div className="pl-20 pr-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {!onNavigate && (
                  <IconButton variant="child-yellow" size="medium" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5" />
                  </IconButton>
                )}
                <div>
                  <h1 className="text-[#5b21b6] text-xl sm:text-2xl lg:text-3xl">AI Story Time ✨</h1>
                  <p className="text-[#7c3aed] text-sm sm:text-base mt-1">Create magical stories with AI!</p>
                </div>
              </div>
              {generatedStory && (
                <div className="flex flex-wrap gap-2">
                  <IconButton variant="child-blue" size="medium">
                    <Volume2 className="w-5 h-5" />
                  </IconButton>
                  <Button variant="child-yellow" size="small" icon={<Save className="w-5 h-5" />} onClick={handleSaveStory}>
                    Save Story
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
          {/* Avatar Introduction */}
          <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-lavender)]/20">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--child-lavender)] to-[var(--child-peach)] flex items-center justify-center shadow-lg flex-shrink-0 animate-bounce" style={{ animationDuration: '3s' }}>
                <Wand2 className="w-8 h-8 text-[#5b21b6]" />
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Let's Create Magic Together! 🪄</h3>
                <p className="text-[#4a5568] text-sm sm:text-base">
                  I can help you create amazing stories in two ways! You can use your saved journal entries to inspire a story, 
                  or tell me your own story idea. Pick a theme, and I'll weave a magical tale just for you!
                </p>
              </div>
            </div>
          </Card>

          {/* Creation Mode Selection */}
          <Card variant="child">
            <div className="space-y-4">
              <h3 className="text-[#2d3748] text-lg sm:text-xl">How would you like to create your story?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => setCreationMode('journal')}
                  className={`
                    p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem]
                    transition-all duration-200
                    flex flex-col items-center gap-3
                    ${creationMode === 'journal'
                      ? 'bg-[var(--child-blue)] shadow-[0_8px_24px_rgba(0,0,0,0.1)] scale-105'
                      : 'bg-gray-50 hover:bg-gray-100'
                    }
                  `}
                >
                  <BookOpen className={`w-8 h-8 sm:w-12 sm:h-12 ${creationMode === 'journal' ? 'text-[#1a365d]' : 'text-[#64748b]'}`} />
                  <div className="text-center">
                    <h4 className={`mb-1 text-base sm:text-lg ${creationMode === 'journal' ? 'text-[#1a365d]' : 'text-[#2d3748]'}`}>
                      From My Journal 📖
                    </h4>
                    <p className={`text-xs sm:text-sm ${creationMode === 'journal' ? 'text-[#2d5f7e]' : 'text-[#64748b]'}`}>
                      Turn my journal entries into a story
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setCreationMode('prompt')}
                  className={`
                    p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem]
                    transition-all duration-200
                    flex flex-col items-center gap-3
                    ${creationMode === 'prompt'
                      ? 'bg-[var(--child-lavender)] shadow-[0_8px_24px_rgba(0,0,0,0.1)] scale-105'
                      : 'bg-gray-50 hover:bg-gray-100'
                    }
                  `}
                >
                  <Sparkles className={`w-8 h-8 sm:w-12 sm:h-12 ${creationMode === 'prompt' ? 'text-[#5b21b6]' : 'text-[#64748b]'}`} />
                  <div className="text-center">
                    <h4 className={`mb-1 text-base sm:text-lg ${creationMode === 'prompt' ? 'text-[#5b21b6]' : 'text-[#2d3748]'}`}>
                      Custom Idea ✍️
                    </h4>
                    <p className={`text-xs sm:text-sm ${creationMode === 'prompt' ? 'text-[#7c3aed]' : 'text-[#64748b]'}`}>
                      Create a story from my own idea
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </Card>

          {/* Theme Selection */}
          <Card variant="child">
            <div className="space-y-4">
              <h3 className="text-[#2d3748] text-lg sm:text-xl">Choose Your Story Theme 🎨</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`
                      p-3 sm:p-4 rounded-[1.5rem]
                      transition-all duration-200
                      flex flex-col items-center gap-2
                      ${selectedTheme === theme.id 
                        ? `bg-[var(--${theme.color})] shadow-[0_8px_24px_rgba(0,0,0,0.1)] scale-105` 
                        : 'bg-gray-50 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="text-2xl sm:text-3xl">{theme.emoji}</span>
                    <span className="text-xs sm:text-sm">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Journal Entries Selection */}
          {creationMode === 'journal' && (
            <Card variant="child">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#2d3748] text-lg sm:text-xl">Select Journal Entries 📚</h3>
                  <Badge variant="child-blue">{selectedEntries.length} selected</Badge>
                </div>
                <p className="text-[#64748b] text-sm sm:text-base">
                  Pick one or more journal entries. I'll use them to create a magical story!
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {journalEntries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => toggleEntrySelection(entry.id)}
                      className={`
                        w-full p-3 sm:p-4 rounded-[1.5rem] text-left
                        transition-all duration-200
                        flex items-start gap-3
                        ${selectedEntries.includes(entry.id)
                          ? 'bg-[var(--child-blue)] shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100'
                        }
                      `}
                    >
                      <div className={`
                        w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0
                        ${selectedEntries.includes(entry.id)
                          ? 'bg-white/20'
                          : 'bg-white'
                        }
                      `}>
                        {selectedEntries.includes(entry.id) ? (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#1a365d]" />
                        ) : (
                          <span className="text-xl sm:text-2xl">
                            {getMoodEmoji(entry.moodStatus || 'thoughtful')}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className={`text-sm sm:text-base ${selectedEntries.includes(entry.id) ? 'text-[#1a365d]' : 'text-[#2d3748]'}`}>
                            {entry.title}
                          </h4>
                          <Badge variant={selectedEntries.includes(entry.id) ? 'child-yellow' : 'child-slate'} className="text-xs">
                            {formatShortDate(entry.createdAt)}
                          </Badge>
                        </div>
                        <p className={`text-xs sm:text-sm ${selectedEntries.includes(entry.id) ? 'text-[#2d5f7e]' : 'text-[#64748b]'}`}>
                          {entry.content.slice(0, 120)}
                        </p>
                      </div>
                    </button>
                  ))}
                  {journalEntries.length === 0 && (
                    <p className="rounded-[1.5rem] bg-gray-50 p-4 text-center text-sm text-[#64748b]">
                      Save a journal entry first, then it will appear here for story generation.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Custom Prompt Input */}
          {creationMode === 'prompt' && (
            <Card variant="child">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--child-lavender)]" fill="currentColor" />
                  <h3 className="text-[#2d3748] text-lg sm:text-xl">Tell me about your story idea</h3>
                </div>
                <textarea
                  value={storyPrompt}
                  onChange={(e) => setStoryPrompt(e.target.value)}
                  placeholder="Example: I want a story about a brave kid who discovers a magical garden where animals can talk..."
                  rows={4}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-[1.5rem] border-2 border-[var(--child-lavender)] focus:border-[var(--child-lavender)]/80 focus:outline-none focus:ring-4 focus:ring-[var(--child-lavender)]/20 bg-white transition-all resize-none text-sm sm:text-base"
                />
                
                {/* Story Prompts/Ideas */}
                <div className="space-y-3">
                  <h4 className="text-[#2d3748] text-sm sm:text-base">Need inspiration? Try these! 💡</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setStoryPrompt("A kid who can talk to books and goes on library adventures")}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-full bg-white hover:bg-[var(--child-mint)]/20 transition-colors text-[#4a5568] text-xs sm:text-sm"
                    >
                      "A kid who can talk to books and goes on library adventures"
                    </button>
                    <button 
                      onClick={() => setStoryPrompt("A magical pet that grants wishes but in funny ways")}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-full bg-white hover:bg-[var(--child-mint)]/20 transition-colors text-[#4a5568] text-xs sm:text-sm"
                    >
                      "A magical pet that grants wishes but in funny ways"
                    </button>
                    <button 
                      onClick={() => setStoryPrompt("A superhero who gets their powers from being kind")}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-full bg-white hover:bg-[var(--child-mint)]/20 transition-colors text-[#4a5568] text-xs sm:text-sm"
                    >
                      "A superhero who gets their powers from being kind"
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Generate Button */}
          {error && (
            <Card variant="child" className="border-2 border-red-200 bg-red-50">
              <p className="text-center text-sm text-red-700">{error}</p>
            </Card>
          )}

          {/* Generate Button */}
          {!generatedStory && (
            <Button 
              variant="child-lavender"
              size="large"
              icon={<Wand2 className="w-5 h-5" />}
              onClick={handleGenerateStory}
              className="w-full"
              disabled={!canGenerate || isGenerating}
            >
              {isGenerating ? 'Creating Your Story...' : 'Generate Story ✨'}
            </Button>
          )}

          {/* Loading State */}
          {isGenerating && (
            <Card variant="child" className="bg-gradient-to-br from-[var(--child-lavender)]/20 to-[var(--child-peach)]/20">
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--child-lavender)] to-[var(--child-peach)] flex items-center justify-center animate-spin">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" />
                </div>
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Sprinkling magic dust... ✨</h3>
                <p className="text-[#4a5568] text-sm sm:text-base">
                  {creationMode === 'journal' 
                    ? 'Weaving your memories into a magical tale!' 
                    : 'Creating your personalized story!'}
                </p>
              </div>
            </Card>
          )}

          {/* Generated Story */}
          {generatedStory && !isGenerating && (
            <Card variant="child">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="child-lavender" icon={<Star className="w-4 h-4" fill="currentColor" />}>
                      {selectedTheme}
                    </Badge>
                    {creationMode === 'journal' && (
                      <Badge variant="child-blue" icon={<BookOpen className="w-4 h-4" />}>
                        From {selectedEntries.length} {selectedEntries.length === 1 ? 'Entry' : 'Entries'}
                      </Badge>
                    )}
                    <h3 className="text-[#2d3748] text-lg sm:text-xl">Your Magical Story</h3>
                  </div>
                  <IconButton variant="child-blue" size="small" onClick={handleGenerateStory}>
                    <RefreshCw className="w-4 h-4" />
                  </IconButton>
                </div>

                <div className="prose prose-lg max-w-none">
                  <div className="text-[#2d3748] leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {generatedStory}
                  </div>
                </div>

                {/* Story Actions */}
                <div className="pt-4 border-t-2 border-gray-100 flex flex-wrap gap-2 sm:gap-3">
                  <Button
                    variant="child-blue"
                    icon={
                      storyVoiceStatus === 'loading' ? <RefreshCw className="w-5 h-5 animate-spin" /> :
                      storyVoiceStatus === 'playing' ? <Pause className="w-5 h-5" /> :
                      storyVoiceStatus === 'ready' ? <RotateCcw className="w-5 h-5" /> :
                      <Volume2 className="w-5 h-5" />
                    }
                    size="medium"
                    onClick={handleReadGeneratedStory}
                    disabled={!generatedStory || storyVoiceStatus === 'loading'}
                  >
                    {storyVoiceStatus === 'loading'
                      ? 'Generating Voice...'
                      : storyVoiceStatus === 'playing'
                      ? 'Stop Audio'
                      : storyVoiceStatus === 'ready'
                      ? 'Replay Audio'
                      : 'Listen'}
                  </Button>
                  <Button variant="child-mint" icon={<Sparkles className="w-5 h-5" fill="currentColor" />} size="medium" onClick={handleContinueStory}>
                    Continue Story
                  </Button>
                  <Button variant="child-yellow" icon={<Save className="w-5 h-5" />} size="medium" onClick={handleSaveStory}>
                    Save to Memories
                  </Button>
                  <Button variant="child-peach" icon={<Wand2 className="w-5 h-5" />} size="medium" onClick={handleNewStory}>
                    New Story
                  </Button>
                </div>
                {actionMessage && (
                  <p className="text-center text-sm text-[#065f46]">{actionMessage}</p>
                )}
              </div>
            </Card>
          )}
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
