'use client';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Deal, DealStage } from '@/lib/supabase/types';
import { KanbanCard } from './KanbanCard';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { Plus } from 'lucide-react';

const columnStyles: Record<DealStage, { header: string; dot: string; border: string }> = {
  lead_captured:     { header: 'text-gray-600 dark:text-gray-300',    dot: 'bg-gray-400',    border: 'border-gray-200 dark:border-gray-700' },
  discovery_scoping: { header: 'text-blue-700 dark:text-blue-400',    dot: 'bg-blue-400',    border: 'border-blue-200 dark:border-blue-800' },
  proposal_sent:     { header: 'text-orange-700 dark:text-orange-400',dot: 'bg-orange-400',  border: 'border-orange-200 dark:border-orange-800' },
  negotiation:       { header: 'text-amber-700 dark:text-amber-400',  dot: 'bg-amber-400',   border: 'border-amber-200 dark:border-amber-800' },
  closed_won:        { header: 'text-emerald-700 dark:text-emerald-400',dot: 'bg-emerald-400',border: 'border-emerald-200 dark:border-emerald-800' },
  closed_lost:       { header: 'text-brand-600 dark:text-brand-400',  dot: 'bg-brand-500',   border: 'border-brand-200 dark:border-brand-900' },
};

interface KanbanColumnProps {
  stage: DealStage;
  label: string;
  description: string;
  deals: Deal[];
  onCardClick?: (deal: Deal) => void;
  onAddDeal?: (stage: DealStage) => void;
}

export function KanbanColumn({ stage, label, description, deals, onCardClick, onAddDeal }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const styles = columnStyles[stage];
  const total = deals.reduce((sum, d) => sum + d.estimated_value, 0);

  return (
    <div className="flex flex-col min-w-[260px] w-[260px]">
      {/* Header */}
      <div className={cn('flex items-center justify-between px-3 py-3 rounded-xl mb-2 border bg-white dark:bg-gray-900', styles.border)}>
        <div>
          <div className={cn('flex items-center gap-2 text-xs font-semibold', styles.header)}>
            <span className={cn('w-2 h-2 rounded-full flex-shrink-0', styles.dot)} />
            {label}
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ml-0.5">
              {deals.length}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 ml-4">{formatCurrency(total)}</p>
        </div>
        <button
          onClick={() => onAddDeal?.(stage)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-xl min-h-[400px] p-2 transition-colors space-y-2',
          isOver ? 'bg-brand-50/60 dark:bg-brand-950/20' : 'bg-gray-50/50 dark:bg-gray-800/20',
        )}
      >
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <KanbanCard key={deal.id} deal={deal} onClick={() => onCardClick?.(deal)} />
          ))}
        </SortableContext>
        {deals.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-gray-300 dark:text-gray-600">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
