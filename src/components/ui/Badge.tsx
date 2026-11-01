import { cn } from '@/lib/utils/cn';
import type { DealStage, ServiceType } from '@/lib/supabase/types';

const stageStyles: Record<DealStage, string> = {
  enquiry:      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  quote_sent:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  deposit_paid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  in_production:'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  ready:        'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  delivered:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  lost:         'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const stageLabels: Record<DealStage, string> = {
  enquiry:      'Enquiry',
  quote_sent:   'Quote Sent',
  deposit_paid: 'Deposit Paid',
  in_production:'In Production',
  ready:        'Ready',
  delivered:    'Delivered',
  lost:         'Lost',
};

export function StageBadge({ stage, className }: { stage: DealStage; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', stageStyles[stage], className)}>
      {stageLabels[stage]}
    </span>
  );
}

const serviceStyles: Record<ServiceType, string> = {
  'Physical Branding':  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Social Media':       'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Digital Marketing':  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'One-Off Design':     'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Bundle':             'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  'Other':              'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export function ServiceTypeBadge({ type, className }: { type: ServiceType; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', serviceStyles[type], className)}>
      {type}
    </span>
  );
}
