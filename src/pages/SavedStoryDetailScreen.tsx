import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ChildPageLoader } from '../components/PageLoaders';
import { api, type Story } from '../services/api';
import { formatDate, htmlToText, readingTime, wordCount } from '../services/journalAdapters';
import { MemoryDetailScreen, type Memory } from './MemoryDetailScreen';

interface SavedStoryDetailScreenProps {
  storyId: string;
  childName: string;
  childAvatar?: string;
  onBack: () => void;
}

const mapStoryToMemory = (story: Story): Memory => ({
  id: story.id,
  kind: 'story',
  journalId: story.journalId || undefined,
  childId: story.childId,
  title: story.title || 'Untitled story',
  preview: htmlToText(story.content || '').slice(0, 120),
  content: story.content || '',
  mood: '',
  moodEmoji: '📖',
  date: formatDate(story.createdAt),
  time: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(story.createdAt)),
  createdAt: story.createdAt,
  updatedAt: story.updatedAt,
  tag: 'Story',
  color: 'child-lavender',
  wordCount: wordCount(story.content || ''),
  readingTime: readingTime(story.content || ''),
  moral: story.moral,
  theme: story.theme,
  storyLength: story.length,
  model: story.model,
  provider: story.provider,
});

export function SavedStoryDetailScreen({
  storyId,
  childName,
  childAvatar,
  onBack,
}: SavedStoryDetailScreenProps) {
  const [memory, setMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');

    api.stories
      .get(storyId)
      .then(({ story }) => {
        if (isMounted) setMemory(mapStoryToMemory(story));
      })
      .catch((requestError) => {
        if (isMounted) {
          setMemory(null);
          setError(requestError instanceof Error ? requestError.message : 'This story is unavailable.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [storyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--child-bg)] p-6">
        <ChildPageLoader childName={childName} childAvatar={childAvatar} message="Opening your saved story..." />
      </div>
    );
  }

  if (!memory || error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--child-bg)] p-6">
        <Card variant="child" className="max-w-lg text-center">
          <h2 className="mb-2 text-xl text-[#2d3748]">Story unavailable</h2>
          <p className="mb-4 text-sm text-[#64748b]">
            {error || 'This story may have been deleted or is no longer available.'}
          </p>
          <Button variant="child-blue" onClick={onBack}>Back to memories</Button>
        </Card>
      </div>
    );
  }

  return (
    <MemoryDetailScreen
      memory={memory}
      childName={childName}
      onBack={onBack}
      onUpdated={setMemory}
      onDelete={async () => {
        try {
          await api.stories.remove(memory.id);
          onBack();
        } catch (deleteError) {
          setError(deleteError instanceof Error ? deleteError.message : 'Could not delete this story.');
        }
      }}
    />
  );
}
