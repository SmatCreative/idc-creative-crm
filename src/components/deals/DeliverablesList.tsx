'use client';
import { useState } from 'react';
import type { Deliverable, DeliverableStatus } from '@/lib/supabase/types';
import { useDeliverables } from '@/lib/hooks/useDeliverables';
import { formatDate } from '@/lib/utils/format';
import { Plus, Trash2, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const statusConfig: Record<DeliverableStatus, { icon: React.ReactNode; label: string; next: DeliverableStatus; color: string }> = {
  pending:     { icon: <Circle size={16} />,        label: 'Pending',     next: 'in_progress', color: 'text-gray-400' },
  in_progress: { icon: <Clock size={16} />,         label: 'In Progress', next: 'done',        color: 'text-amber-500' },
  done:        { icon: <CheckCircle2 size={16} />,  label: 'Done',        next: 'pending',     color: 'text-emerald-500' },
};

interface DeliverablesListProps {
  dealId: string;
}

export function DeliverablesList({ dealId }: DeliverablesListProps) {
  const { deliverables, loading, create, updateStatus, remove } = useDeliverables(dealId);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDue, setNewDue] = useState('');

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await create({ title: newTitle.trim(), due_date: newDue || undefined });
    setNewTitle('');
    setNewDue('');
    setAdding(false);
  };

  const done = deliverables.filter((d) => d.status === 'done').length;
  const total = deliverables.length;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      {total > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">{done}/{total} complete</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{Math.round((done / total) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Items */}
      <div className="space-y-1.5">
        {deliverables.map((d) => {
          const cfg = statusConfig[d.status];
          return (
            <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 group">
              <button
                onClick={() => updateStatus(d.id, cfg.next)}
                className={cn('flex-shrink-0 transition-colors hover:opacity-70', cfg.color)}
              >
                {cfg.icon}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium text-gray-800 dark:text-gray-200', d.status === 'done' && 'line-through text-gray-400 dark:text-gray-500')}>
                  {d.title}
                </p>
                {d.due_date && (
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                    <Calendar size={10} />
                    <span>{formatDate(d.due_date)}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => remove(d.id)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-brand-500 dark:hover:text-brand-400 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add form */}
      {adding ? (
        <div className="p-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 space-y-2">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="Deliverable title (e.g. Branded Gazebo, Pull-up Banner…)"
            className="w-full text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button onClick={handleAdd} className="ml-auto text-xs font-medium px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
              Add
            </button>
            <button onClick={() => setAdding(false)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-400 dark:text-gray-500 hover:border-brand-400 dark:hover:border-brand-600 hover:text-brand-500 dark:hover:text-brand-400 transition-all"
        >
          <Plus size={14} />
          Add deliverable
        </button>
      )}
    </div>
  );
}
