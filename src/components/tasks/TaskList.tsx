'use client';
import { useState } from 'react';
import type { Task } from '@/lib/supabase/types';
import { Button } from '@/components/ui/Button';
import { Input, FormGroup, Label } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils/format';
import { Check, Trash2, Plus, Calendar, Circle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TaskListProps {
  tasks: Task[];
  dealId?: string;
  onCreate: (values: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'deal' | 'contact'>) => Promise<Task>;
  onToggle: (id: string, completed: boolean) => Promise<Task>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskList({ tasks, dealId, onCreate, onToggle, onDelete }: TaskListProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onCreate({
        title,
        description: null,
        deal_id: dealId ?? null,
        contact_id: null,
        due_date: dueDate || null,
        completed: false,
        completed_at: null,
      });
      setTitle('');
      setDueDate('');
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tasks</h4>
        <Button size="sm" variant="ghost" onClick={() => setShowForm(!showForm)}>
          <Plus size={13} /> Add task
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
          <FormGroup>
            <Label>Task</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Follow up on contract..." required />
          </FormGroup>
          <FormGroup>
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </FormGroup>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>{loading ? 'Adding…' : 'Add'}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-1.5">
        {pending.map((task) => <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />)}
        {done.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider pt-3 pb-1">Completed</p>
            {done.map((task) => <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />)}
          </>
        )}
        {tasks.length === 0 && !showForm && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No tasks yet</p>
        )}
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: (id: string, completed: boolean) => Promise<Task>; onDelete: (id: string) => Promise<void> }) {
  return (
    <div className={cn('flex items-start gap-2.5 p-2.5 rounded-xl group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors', task.completed && 'opacity-60')}>
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={cn(
          'mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors',
          task.completed
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-slate-300 dark:border-slate-600 hover:border-brand-400',
        )}
      >
        {task.completed && <Check size={10} strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm text-slate-700 dark:text-slate-300', task.completed && 'line-through text-slate-400')}>{task.title}</p>
        {task.due_date && (
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
            <Calendar size={10} />
            {formatDate(task.due_date)}
          </div>
        )}
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-all"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
