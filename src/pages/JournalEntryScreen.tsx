import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { IconButton } from '../components/IconButton';
import { ChildSidebar } from '../components/ChildSidebar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { ArrowLeft, Smile, Meh, Frown, Heart, Star, BookOpen, Save, Sparkles, Mic, MicOff, Bold, Italic, Underline, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { api } from '../services/api';

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
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [fontSize, setFontSize] = useState('16');
  const [textAlign, setTextAlign] = useState('left');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

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

  const applyFormat = (formatType: 'bold' | 'italic' | 'underline') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) return;

    let formattedText = '';
    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
  };

  const handleSave = async () => {
    setError('');

    if (!childId) {
      setError('Please log in as a child before saving an entry.');
      return;
    }

    if (!content.trim()) {
      setError('Write a little something before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const data = await api.journals.create({
        childId,
        title: title.trim() || undefined,
        content,
        inputType: isRecording ? 'voice' : 'text',
        source: isRecording ? 'speech-to-text' : 'manual',
      });

      await api.mood.analyze(data.journal.id).catch(() => undefined);
      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this entry.');
    } finally {
      setIsSaving(false);
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
                disabled={isSaving}
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
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </IconButton>
              </div>

              {/* Rich Text Editing Toolbar */}
              <div className="bg-gray-50 rounded-2xl p-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                  <button
                    onClick={() => applyFormat('bold')}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4 text-[#64748b]" />
                  </button>
                  <button
                    onClick={() => applyFormat('italic')}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4 text-[#64748b]" />
                  </button>
                  <button
                    onClick={() => applyFormat('underline')}
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

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTextAlign('left')}
                    className={`p-2 rounded-lg transition-colors ${textAlign === 'left' ? 'bg-white' : 'hover:bg-white'}`}
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4 text-[#64748b]" />
                  </button>
                  <button
                    onClick={() => setTextAlign('center')}
                    className={`p-2 rounded-lg transition-colors ${textAlign === 'center' ? 'bg-white' : 'hover:bg-white'}`}
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4 text-[#64748b]" />
                  </button>
                  <button
                    onClick={() => setTextAlign('right')}
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

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Today was special because..."
                rows={10}
                style={{
                  fontSize: `${fontSize}px`,
                  textAlign: textAlign,
                }}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-[1.5rem] border-2 border-[var(--child-blue)] focus:border-[var(--child-blue-dark)] focus:outline-none focus:ring-4 focus:ring-[var(--child-blue)]/20 bg-white transition-all resize-none"
              />

              <div className="flex items-center justify-between text-xs sm:text-sm text-[#64748b]">
                <span>{content.length} characters</span>
                <span>💡 No rush, take your time!</span>
              </div>
            </div>
          </Card>

          {/* AI Suggestions */}
          {content.length > 50 && (
            <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-mint)]/20">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--child-mint)] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-[#065f46]" fill="currentColor" />
                </div>
                <div className="flex-1 space-y-3">
                  <h4 className="text-[#2d3748] text-base sm:text-lg">Chime's Thoughts 💭</h4>
                  <p className="text-[#4a5568] text-sm sm:text-base">
                    That sounds wonderful! I can sense you're feeling {selectedMood || 'thoughtful'} today. Would you like me to help turn this into a creative story?
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
              disabled={isSaving}
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
              disabled={isSaving}
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
