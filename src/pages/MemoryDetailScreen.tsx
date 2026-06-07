import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { sanitizeRichTextHtml } from '../services/journalAdapters';

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
                <Badge variant={memory.color}>{memory.tag}</Badge>
                <span className="rounded-full bg-[#e2effb] px-3 py-1 text-sm text-[#1a365d]">
                  {memory.moodEmoji} {memory.mood}
                </span>
              </div>
              <p className="text-sm text-[#475569]">{memory.date} · {memory.time} · {memory.readingTime}</p>
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
        </Card>

        <div className="mt-6 flex gap-3 flex-wrap">
          <Button onClick={onBack}>Back to memories</Button>
        </div>
      </div>
    </div>
  );
}
