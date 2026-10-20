'use client';
import { useState } from 'react';
import { useTasks } from '@/lib/hooks/useTasks';
import { useDeals } from '@/lib/hooks/useDeals';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, FormGroup, Label, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Task } from '@/lib/supabase/types';
import { formatDate, formatRelativeTime } from '@/lib/utils/format';
import { CheckSquare, Plus, Calendar, Briefcase, Check, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { isAfter, parseISO } from 'date-fns';

export default function TasksPage() {
  const { tasks, loading, create, toggle, remove } = useTasks();
  const { deals } = useDeals();
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [form, setForm] = useState({ title: '', due_date: '', deal_id: '' });
  const [saving, setSaving] = useState(false);

  const setField = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const overdue = filtered.filter((t) => !t.completed && t.due_date && isAfter(new Date(), parseISO(t.due_date)));
  const upcoming = filtered.filter((t) => !t.completed && (!t.due_date || !isAfter(new Date(), parseISO(t.due_date))));
  const done = filtered.filter((t) => t.completed);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await create({
        title: form.title,
        description: null,
        deal_id: form.deal_id || null,
        contact_id: null,
        due_date: form.due_date || null,
        completed: false,
        completed_at: null,
      });
      setForm({ title: '', due_date: '', deal_id: '' });
      setShowNew(false);
    } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        description={`${tasks.filter(t => !t.completed).length} open · ${tasks.filter(t => t.completed).length} completed`}
        action={<Button size="sm" onClick={() => setShowNew(true)}><Plus size={14} /> Add Task</Button>}
      />

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-5 w-fit">
        {(['pending', 'all', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 text-xs font-medium rounded-lg transition-all capitalize',
              filter === f
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks here" description={filter === 'pending' ? 'Add your first task to get started.' : 'Nothing to show.'} action={filter === 'pending' ? <Button size="sm" onClick={() => setShowNew(true)}><Plus size={14} /> Add Task</Button> : undefined} />
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <TaskSection title="Overdue" icon={<AlertCircle size={14} className="text-red-500" />} tasks={overdue} deals={deals} onToggle={toggle} onDelete={remove} />
          )}
          {upcoming.length > 0 && (
            <TaskSection title="Upcoming" icon={<Calendar size={14} className="text-brand-500" />} tasks={upcoming} deals={deals} onToggle={toggle} onDelete={remove} />
          )}
          {done.length > 0 && (
            <TaskSection title="Completed" icon={<Check size={14} className="text-emerald-500" />} tasks={done} deals={deals} onToggle={toggle} onDelete={remove} />
          )}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Add Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormGroup>
            <Label>Task *</Label>
            <Input required value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Follow up on contract…" />
          </FormGroup>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup>
              <Label>Due Date</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setField('due_date', e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Linked Deal</Label>
              <Select value={form.deal_id} onChange={(e) => setField('deal_id', e.target.value)}>
                <option value="">None</option>
                {deals.map((d) => <option key={d.id} value={d.id}>{d.deal_name}</option>)}
              </Select>
            </FormGroup>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Adding…' : 'Add Task'}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function TaskSection({
  title, icon, tasks, deals, onToggle, onDelete,
}: {
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  deals: ReturnType<typeof useDeals>['deals'];
  onToggle: (id: string, completed: boolean) => Promise<Task>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full px-1.5 py-0.5 font-semibold">{tasks.length}</span>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-50 dark:divide-slate-800">
        {tasks.map((task) => {
          const linkedDeal = task.deal_id ? deals.find(d => d.id === task.deal_id) : null;
          const overdue = !task.completed && task.due_date && isAfter(new Date(), parseISO(task.due_date));
          return (
            <div key={task.id} className={cn('flex items-center gap-3 px-4 py-3 group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors', task.completed && 'opacity-60')}>
              <button
                onClick={() => onToggle(task.id, !task.completed)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                  task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 hover:border-brand-400',
                )}
              >
                {task.completed && <Check size={11} strokeWidth={3} className="text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium text-slate-800 dark:text-slate-200', task.completed && 'line-through text-slate-400')}>{task.title}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {task.due_date && (
                    <span className={cn('flex items-center gap-1 text-xs', overdue ? 'text-red-500 font-medium' : 'text-slate-400 dark:text-slate-500')}>
                      <Calendar size={11} /> {formatDate(task.due_date)}
                      {overdue && ' · Overdue'}
                    </span>
                  )}
                  {linkedDeal && (
                    <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                      <Briefcase size={11} /> {linkedDeal.deal_name}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
