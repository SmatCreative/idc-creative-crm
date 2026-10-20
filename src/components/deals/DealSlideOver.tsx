'use client';
import { useState } from 'react';
import { SlideOver } from '@/components/ui/SlideOver';
import { StageBadge, ProjectTypeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ActivityFeed } from './ActivityFeed';
import { TaskList } from '@/components/tasks/TaskList';
import type { Deal, Account, ActivityType } from '@/lib/supabase/types';
import { useActivities } from '@/lib/hooks/useActivities';
import { useTasks } from '@/lib/hooks/useTasks';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Building2, Calendar, DollarSign, Edit2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const tabs = ['Overview', 'Activity', 'Tasks'] as const;
type Tab = typeof tabs[number];

interface DealSlideOverProps {
  deal: Deal | null;
  accounts: Account[];
  open: boolean;
  onClose: () => void;
  onEdit?: (deal: Deal) => void;
}

export function DealSlideOver({ deal, accounts, open, onClose, onEdit }: DealSlideOverProps) {
  const [tab, setTab] = useState<Tab>('Overview');
  const { activities, create: logActivity } = useActivities(deal?.id);
  const { tasks, create: createTask, toggle: toggleTask, remove: removeTask } = useTasks(deal?.id);

  if (!deal) return null;

  const handleLog = async (type: ActivityType, notes: string) => {
    await logActivity({ type, notes, deal_id: deal.id, contact_id: null });
  };

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={deal.deal_name}
      subtitle={deal.account?.company_name}
      width="lg"
    >
      {/* Stage + actions */}
      <div className="flex items-center justify-between mb-5">
        <StageBadge stage={deal.stage} />
        <Button size="sm" variant="secondary" onClick={() => onEdit?.(deal)}>
          <Edit2 size={13} /> Edit Deal
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-5">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
              tab === t
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
            )}
          >
            {t}
            {t === 'Activity' && activities.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full px-1.5">{activities.length}</span>
            )}
            {t === 'Tasks' && tasks.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-1.5">{tasks.filter(t => !t.completed).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InfoItem icon={<DollarSign size={14} />} label="Value" value={formatCurrency(deal.estimated_value)} />
            <InfoItem icon={<Layers size={14} />} label="Type" value={<ProjectTypeBadge type={deal.project_type} />} />
            <InfoItem icon={<Building2 size={14} />} label="Account" value={deal.account?.company_name ?? '—'} />
            <InfoItem icon={<Calendar size={14} />} label="Target Launch" value={formatDate(deal.target_launch_date)} />
          </div>
          {deal.description && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{deal.description}</p>
            </div>
          )}
          {deal.stage === 'closed_lost' && deal.closed_lost_reason && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900">
              <p className="text-xs font-medium text-red-500 mb-1">Lost Reason</p>
              <p className="text-sm text-red-700 dark:text-red-400">{deal.closed_lost_reason}</p>
            </div>
          )}
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Created {formatDate(deal.created_at)}</p>
        </div>
      )}

      {tab === 'Activity' && (
        <ActivityFeed activities={activities} dealId={deal.id} onLog={handleLog} />
      )}

      {tab === 'Tasks' && (
        <TaskList
          tasks={tasks}
          dealId={deal.id}
          onCreate={createTask}
          onToggle={toggleTask}
          onDelete={removeTask}
        />
      )}
    </SlideOver>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</div>
    </div>
  );
}
