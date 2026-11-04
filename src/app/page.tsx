'use client';
import { useDeals } from '@/lib/hooks/useDeals';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { PageHeader } from '@/components/layout/PageHeader';
import { BusinessKPIs } from '@/components/dashboard/BusinessKPIs';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentDeals } from '@/components/dashboard/RecentDeals';
import { PipelineDonut } from '@/components/dashboard/PipelineDonut';

export default function DashboardPage() {
  const { deals, loading, error: dealsError } = useDeals();
  const { accounts, error: accountsError } = useAccounts();
  const dbError = dealsError || accountsError;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="SmatCreative — Design, Print, Signage, Social."
      />
      {dbError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <strong>Database connection error:</strong> {dbError}
          <div className="mt-1 text-xs opacity-70">Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 50) ?? 'NOT SET'}</div>
        </div>
      )}

      {/* Business KPIs */}
      <BusinessKPIs deals={deals} accounts={accounts} />

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <RevenueChart deals={deals} />
        </div>
        <PipelineDonut deals={deals} />
      </div>

      {/* Recent projects */}
      <RecentDeals deals={deals} />
    </div>
  );
}
