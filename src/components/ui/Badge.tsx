import { cn } from '@/lib/utils/cn';
import type { DealStage, ProjectType } from '@/lib/supabase/types';

const stageStyles: Record<DealStage, string> = {
  lead_captured:     'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  discovery_scoping: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  proposal_sent:     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  negotiation:       'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  closed_won:        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  closed_lost:       'bg-red-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
};

const stageLabels: Record<DealStage, string> = {
  lead_captured:     'Lead Captured',
  discovery_scoping: 'Discovery',
  proposal_sent:     'Proposal Sent',
  negotiation:       'Negotiation',
  closed_won:        'Closed Won',
  closed_lost:       'Closed Lost',
};

export function StageBadge({ stage }: { stage: DealStage }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', stageStyles[stage])}>
      {stageLabels[stage]}
    </span>
  );
}

const typeColors: Record<string, string> = {
  Branding:          'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  'Web Design':      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  Campaign:          'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Retainer:          'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  'Social Media':    'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  'Video Production':'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Photography:       'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  Copywriting:       'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300',
  Strategy:          'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  Other:             'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export function ProjectTypeBadge({ type }: { type: ProjectType }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', typeColors[type] ?? typeColors.Other)}>
      {type}
    </span>
  );
}
