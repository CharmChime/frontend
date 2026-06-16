import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { ChildSidebar } from '../components/ChildSidebar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { MemoryDetailScreen, type Memory } from './MemoryDetailScreen';
import { ArrowLeft, Search, Filter, Calendar, Star, Heart, BookOpen, Sparkles, ChevronDown, Volume2, VolumeX, Smile, Edit, Trash2, RefreshCw, RotateCcw } from 'lucide-react';
import { api, type Journal } from '../services/api';
import {
  formatDate,
  getJournalConfidence,
  getJournalFeedback,
  getJournalMoodLabel,
  getJournalSentiment,
  htmlToText,
  moodColor,
  moodEmoji,
  readingTime,
  wordCount,
} from '../services/journalAdapters';
import { toast } from 'sonner';

interface MemoriesScreenProps {
  onBack: () => void;
  childName?: string;
  childId?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  onViewEntry?: (entryId: string) => void;
}

export function MemoriesScreen({ onBack, childName = 'Friend', childId, onNavigate, onLogout, onViewEntry }: MemoriesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [readingMemoryId, setReadingMemoryId] = useState<string | null>(null);
  const [memoryVoiceStatus, setMemoryVoiceStatus] = useState<'idle' | 'loading' | 'playing' | 'ready' | 'unavailable'>('idle');
  const memoryAudioRef = useRef<HTMLAudioElement | null>(null);
  const memoryAudioUrlRef = useRef<string | null>(null);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const handleSidebarNavigation = (page: string) => {
    if (page === 'memories') return; // Already here
    if (page === 'home') {
      onBack();
    } else {
      onNavigate?.(page);
    }
  };

  useEffect(() => {
    if (!childId) {
      setJournals([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError('');

    api.journals
      .list({ childId, search: searchQuery })
      .then((data) => {
        if (isMounted) setJournals(data.journals);
      })
      .catch((err) => {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Could not load memories.';
          setError(message);
          toast.error(message);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [childId, searchQuery]);

  useEffect(() => {
    return () => {
      memoryAudioRef.current?.pause();
      if (memoryAudioUrlRef.current) {
        URL.revokeObjectURL(memoryAudioUrlRef.current);
      }
    };
  }, []);

  const allMemories: Memory[] = useMemo(
    () =>
      journals.map((journal) => {
        const mood = getJournalMoodLabel(journal);
        return {
          id: journal.id,
          title: journal.title,
          preview: htmlToText(journal.content).slice(0, 120),
          content: journal.content,
          mood,
          moodEmoji: moodEmoji(mood),
          date: formatDate(journal.createdAt),
          time: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(journal.createdAt)),
          tag: journal.inputType === 'voice' ? 'Voice' : 'Journal',
          color: moodColor(mood),
          wordCount: wordCount(journal.content),
          readingTime: readingTime(journal.content),
          sentiment: getJournalSentiment(journal),
          confidence: getJournalConfidence(journal),
          aiFeedback: getJournalFeedback(journal),
        };
      }),
    [journals]
  );
  const getFilteredMemories = () => {
    let filtered = allMemories;

    // Apply mood filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(memory => memory.mood === selectedFilter);
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(memory => 
        memory.title.toLowerCase().includes(query) ||
        memory.preview.toLowerCase().includes(query) ||
        memory.tag.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredMemories = getFilteredMemories();
  const memoryStats = useMemo(() => {
    const days = new Set(
      journals
        .map((journal) => new Date(journal.createdAt))
        .filter((date) => !Number.isNaN(date.getTime()))
        .map((date) => date.toISOString().slice(0, 10))
    );
    let streak = 0;
    const cursor = new Date();

    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const moodCounts = allMemories.reduce<Record<string, number>>((counts, memory) => {
      counts[memory.mood] = (counts[memory.mood] || 0) + 1;
      return counts;
    }, {});
    const topMood = Object.entries(moodCounts).sort((first, second) => second[1] - first[1])[0]?.[0] || 'None';
    const voiceEntries = journals.filter((journal) => journal.inputType === 'voice' || journal.source === 'speech-to-text').length;

    return {
      streak,
      topMood,
      voiceEntries,
    };
  }, [allMemories, journals]);

  // Calculate filter counts
  const getFilterCount = (filterId: string) => {
    if (filterId === 'all') return allMemories.length;
    return allMemories.filter(m => m.mood === filterId).length;
  };

  const filters = [
    { id: 'all', label: 'All Memories', count: getFilterCount('all') },
    { id: 'happy', label: 'Happy', count: getFilterCount('happy') },
    { id: 'creative', label: 'Creative', count: getFilterCount('creative') },
    { id: 'calm', label: 'Calm', count: getFilterCount('calm') },
  ];

  const handleMemoryClick = (memoryId: string) => {
    const memory = allMemories.find(m => m.id === memoryId);
    if (memory) {
      setSelectedMemory(memory);
    }
  };

  const handleBackToList = () => {
    setSelectedMemory(null);
  };

  const handleEditMemory = (memory: Memory) => {
    onViewEntry?.(memory.id);
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      await api.journals.remove(memoryId);
      setJournals((current) => current.filter((journal) => journal.id !== memoryId));
      setSelectedMemory(null);
      toast.success('Memory deleted.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete memory.');
    }
  };

  const handleReadMemory = async (memory: Memory) => {
    if (memoryAudioRef.current && readingMemoryId === memory.id && memoryVoiceStatus === 'playing') {
      memoryAudioRef.current.pause();
      memoryAudioRef.current.currentTime = 0;
      setMemoryVoiceStatus('ready');
      return;
    }

    memoryAudioRef.current?.pause();
    memoryAudioRef.current = null;
    if (memoryAudioUrlRef.current) {
      URL.revokeObjectURL(memoryAudioUrlRef.current);
      memoryAudioUrlRef.current = null;
    }

    setReadingMemoryId(memory.id);
    setMemoryVoiceStatus('loading');
    setError('');

    try {
      const audioBlob = await api.voice.textToSpeech({ text: htmlToText(memory.content) });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      memoryAudioUrlRef.current = audioUrl;
      memoryAudioRef.current = audio;

      audio.onended = () => setMemoryVoiceStatus('ready');
      audio.onerror = () => {
        setMemoryVoiceStatus('unavailable');
        setError('Voice is temporarily unavailable. Your memory text is still visible.');
      };

      await audio.play();
      setMemoryVoiceStatus('playing');
      toast.info('Playing your memory.');
    } catch (err) {
      setMemoryVoiceStatus('unavailable');
      const message = err instanceof Error ? err.message : 'Voice is temporarily unavailable.';
      setError(message);
      toast.error(message);
    }
  };

  const toggleFavorite = (memoryId: string) => {
    const isFavorite = favoriteIds.includes(memoryId);
    setFavoriteIds((current) =>
      current.includes(memoryId)
        ? current.filter((id) => id !== memoryId)
        : [...current, memoryId]
    );
    toast.success(isFavorite ? 'Removed from favorites.' : 'Added to favorites.');
  };

  // If a memory is selected, show the detail view
  if (selectedMemory) {
    return (
      <MemoryDetailScreen
        memory={selectedMemory}
        onBack={handleBackToList}
        onEdit={handleEditMemory}
        onDelete={handleDeleteMemory}
        childName={childName}
      />
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
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!onNavigate && (
                    <IconButton variant="child-yellow" size="medium" onClick={onBack}>
                      <ArrowLeft className="w-5 h-5" />
                    </IconButton>
                  )}
                  <h1 className="text-[#1a365d] text-xl sm:text-2xl lg:text-3xl">My Memory Book 📖</h1>
                </div>
                <IconButton variant="child-yellow" size="medium" onClick={() => setSelectedFilter('all')}>
                  <Filter className="w-5 h-5" />
                </IconButton>
              </div>

              {/* Search Bar */}
              <div className="bg-white rounded-full shadow-lg">
                <Input
                  placeholder="Search your memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="child"
                  icon={<Search className="w-5 h-5" />}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card variant="child" padding="small">
              <div className="text-center space-y-2">
                <div className="text-2xl sm:text-3xl">📝</div>
                <div className="text-xl sm:text-2xl text-[#2d3748]">{allMemories.length}</div>
                <p className="text-xs sm:text-sm text-[#64748b]">Total Entries</p>
              </div>
            </Card>

            <Card variant="child" padding="small">
              <div className="text-center space-y-2">
                <div className="text-2xl sm:text-3xl">🔥</div>
                <div className="text-xl sm:text-2xl text-[#2d3748]">{memoryStats.streak}</div>
                <p className="text-xs sm:text-sm text-[#64748b]">Day Streak</p>
              </div>
            </Card>

            <Card variant="child" padding="small">
              <div className="text-center space-y-2">
                <div className="text-2xl sm:text-3xl">😊</div>
                <div className="text-xl sm:text-2xl text-[#2d3748] capitalize">{memoryStats.topMood}</div>
                <p className="text-xs sm:text-sm text-[#64748b]">Top Mood</p>
              </div>
            </Card>

            <Card variant="child" padding="small">
              <div className="text-center space-y-2">
                <div className="text-2xl sm:text-3xl">✨</div>
                <div className="text-xl sm:text-2xl text-[#2d3748]">{memoryStats.voiceEntries}</div>
                <p className="text-xs sm:text-sm text-[#64748b]">Voice Entries</p>
              </div>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`
                  px-4 sm:px-5 py-2 rounded-full text-sm sm:text-base
                  transition-all duration-200
                  ${selectedFilter === filter.id
                    ? 'bg-[var(--child-blue)] text-[#1a365d] shadow-lg scale-105'
                    : 'bg-white text-[#4a5568] hover:bg-gray-50 hover:scale-105'
                  }
                `}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* Memory Grid */}
          {isLoading && (
            <Card variant="child" className="text-center py-10">
              <p className="text-[#64748b]">Loading your memories...</p>
            </Card>
          )}

          {error && (
            <Card variant="child" className="border-2 border-red-200 bg-red-50 text-center py-8">
              <p className="text-sm text-red-700">{error}</p>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {filteredMemories.map(memory => (
              <Card 
                key={memory.id} 
                variant="child" 
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
                onClick={() => handleMemoryClick(memory.id)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[#2d3748] mb-1 text-base sm:text-lg truncate">{memory.title}</h4>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-[#64748b]">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{memory.date}</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--${memory.color})] flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <span className="text-xl sm:text-2xl">{memory.moodEmoji}</span>
                    </div>
                  </div>

                  {/* Preview */}
                  <p className="text-[#4a5568] line-clamp-2 text-sm sm:text-base">
                    {memory.preview}
                  </p>

                  {/* Tags & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <Badge variant={memory.color as any}>
                      {memory.tag}
                    </Badge>
                    <div className="flex gap-1">
                      <IconButton 
                        variant="child-blue" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReadMemory(memory);
                        }}
                      >
                        {readingMemoryId === memory.id && memoryVoiceStatus === 'loading' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : readingMemoryId === memory.id && memoryVoiceStatus === 'playing' ? (
                          <VolumeX className="w-4 h-4" />
                        ) : readingMemoryId === memory.id && memoryVoiceStatus === 'ready' ? (
                          <RotateCcw className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </IconButton>
                      <IconButton 
                        variant="child-yellow" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(memory.id);
                        }}
                      >
                        <Star
                          className="w-4 h-4"
                          fill={favoriteIds.includes(memory.id) ? 'currentColor' : 'none'}
                        />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State (if no results) */}
          {filteredMemories.length === 0 && (
            <Card variant="child" className="text-center py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-[var(--child-blue)]/20 flex items-center justify-center">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--child-blue)]" />
              </div>
              <h3 className="text-[#2d3748] mb-2 text-lg sm:text-xl">No memories found</h3>
              <p className="text-[#64748b] text-sm sm:text-base">
                {searchQuery 
                  ? 'Try searching with different words' 
                  : `No ${selectedFilter} memories yet. Start writing!`
                }
              </p>
            </Card>
          )}

          {/* Inspirational Message */}
          <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-lavender)]/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[var(--child-peach)] flex items-center justify-center shadow-lg flex-shrink-0">
                <Sparkles className="w-7 h-7 text-[#744210]" fill="currentColor" />
              </div>
              <div className="flex-1">
                <p className="text-[#4a5568] text-sm sm:text-base">
                  You've been doing great! {allMemories.length} memories saved. Every entry is a precious moment captured forever. Keep writing! ✨
                </p>
              </div>
            </div>
          </Card>
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

