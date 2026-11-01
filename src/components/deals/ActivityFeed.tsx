'use client';
import { useState } from 'react';
import type { Activity, ActivityType } from '@/lib/supabase/types';
import { ACTIVITY_TYPES } from '@/lib/supabase/types';
import { MessageSquare, Phone, Users, Mail, StickyNote, RefreshCw, Send } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const typeConfig: Record<ActivityType, { icon: React.ReactNode; color: string; bg: string }> = {
  WhatsApp: { icon: <MessageSquare size={12} />, color: 'text-green-600', bg: 'bg-green-500' },
  Call:     { icon: <Phone size={12} />,         color: 'text-blue-600',  bg: 'bg-blue-500' },
  Meeting:  { icon: <Users size={12} />,         color: 'text-purple-600',bg: 'bg-purple-500' },
  Email:    { icon: <Mail size={12} />,          color: 'text-sky-600',   bg: 'bg-sky-500' },
  Note:     { icon: <StickyNote size={12} />,    color: 'text-amber-600', bg: 'bg-amber-500' },
  Update:   { icon: <RefreshCw size={12} />,     color: 'text-brand-600', bg: 'bg-brand-500' },
};

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString('en-ZW', { day: 'numeric', month: 'short' });
}

interface ActivityFeedProps {
  activities: Activity[];
  dealId: string;
  onLog: (type: ActivityType, notes: string) => Promise<void>;
}

export function ActivityFeed({ activities, dealId, onLog }: ActivityFeedProps) {
  const [type, setType] = useState<ActivityType>('Note');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await onLog(type, text.trim());
      setText('');
    } finally {
      setSending(false);
    }
  };

  const sorted = [...activities].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="flex flex-col h-full min-h-[420px]">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageSquare size={24} className="text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500">No messages yet</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">Log a WhatsApp, call, note…</p>
          </div>
        )}
        {sorted.map((activity) => {
          const cfg = typeConfig[activity.type];
          return (
            <div key={activity.id} className="flex items-start gap-2.5">
              <div className={cn('flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white mt-0.5', cfg.bg)}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">SmatCreative</span>
                  <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800', cfg.color)}>
                    {activity.type}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">{formatTime(activity.created_at)}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl rounded-tl-sm px-3 py-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {activity.notes || <span className="text-gray-400 italic">No details</span>}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compose bar */}
      <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
        {/* Type pills */}
        <div className="flex gap-1 flex-wrap mb-2">
          {ACTIVITY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all',
                type === t
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500',
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Log a ${type}…`}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex-shrink-0 w-10 h-10 self-end rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
