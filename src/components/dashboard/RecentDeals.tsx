import Link from 'next/link';
import type { Deal } from '@/lib/supabase/types';
import { StageBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/format';
import { ArrowRight } from 'lucide-react';

export function RecentDeals({ deals }: { deals: Deal[] }) {
  const recent = deals.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Deals</h3>
        <Link href="/deals" className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-1">
          View all <ArrowRight size={12} />
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No deals yet</p>
      ) : (
        <div className="space-y-3">
          {recent.map((deal) => (
            <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center justify-between group p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors -mx-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{deal.deal_name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{deal.account?.company_name ?? '—'}</p>
              </div>
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <StageBadge stage={deal.stage} />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(deal.estimated_value)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
