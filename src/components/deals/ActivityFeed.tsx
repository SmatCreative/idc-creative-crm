'use client';
import { useState } from 'react';
import type { Activity, ActivityType } from '@/lib/supabase/types';
import { ACTIVITY_TYPES } from '@/lib/supabase/types';
import { formatRelativeTime } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';
import { Textarea, Select, FormGroup, Label } from '@/components/ui/Input';
import { Mail, Phone, Presentation, Eye, StickyNote, CheckCircle2, Plus } from 'lucide-react';

const activityIcons: Record<ActivityType, React.ReactNode> = {
  Email: <Mail size={13} />,
  Call: <Phone size={13} />,
  'Pitch Meeting': <Presentation size={13} />,
  Review: <Eye size={13} />,
  Note: <StickyNote size={13} />,
  'Task Completed': <CheckCircle2 size={13} />,
};

const activityColors: Record<ActivityType, string> = {
  Email: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  Call: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Pitch Meeting': 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  Review: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  Note: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  'Task Completed': 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
};

interface ActivityFeedProps {
  activities: Activity[];
  dealId: string;
  onLog: (type: ActivityType, notes: string) => Promise<void>;
}

export function ActivityFeed({ activities, dealId, onLog }: ActivityFeedProps) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<ActivityType>('Note');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;
    setLoading(true);
    try {
      await onLog(type, notes);
      setNotes('');
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Activity</h4>
        <Button size="sm" variant="ghost" onClick={() => setShowForm(!showForm)}>
          <Plus size={13} /> Log activity
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
          <FormGroup>
            <Label>Type</Label>
            <Select value={type} onChange={(e) => setType(e.target.value as ActivityType)}>
              {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What happened?" />
          </FormGroup>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>{loading ? 'Saving…' : 'Log'}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {activities.length === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No activity logged yet</p>
        )}
        {activities.map((act) => (
          <div key={act.id} className="flex gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${activityColors[act.type]}`}>
              {activityIcons[act.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{act.type}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatRelativeTime(act.created_at)}</span>
              </div>
              {act.notes && <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{act.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
