'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Deal } from '@/lib/supabase/types';
import { ProjectTypeBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Calendar, Building2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface KanbanCardProps {
  deal: Deal;
  onClick?: () => void;
}

export function KanbanCard({ deal, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3.5 shadow-sm cursor-pointer group hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-brand-500',
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {deal.deal_name}
          </p>
          {deal.account && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <Building2 size={11} className="flex-shrink-0" />
              <span className="truncate">{deal.account.company_name}</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-2.5">
            <ProjectTypeBadge type={deal.project_type} />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatCurrency(deal.estimated_value)}</span>
          </div>
          {deal.target_launch_date && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 dark:text-gray-500">
              <Calendar size={11} />
              <span>{formatDate(deal.target_launch_date)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function KanbanCardOverlay({ deal }: { deal: Deal }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-brand-500 p-3.5 shadow-2xl opacity-90 w-60">
      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{deal.deal_name}</p>
      <p className="text-xs text-gray-500 mt-1">{formatCurrency(deal.estimated_value)}</p>
    </div>
  );
}
