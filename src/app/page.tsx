'use client';
import { useDeals } from '@/lib/hooks/useDeals';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { PageHeader } from '@/components/layout/PageHeader';
import { BusinessKPIs } from '@/components/dashboard/BusinessKPIs';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentDeals } from '@/components/dashboard/RecentDeals';
import { PipelineDonut } from '@/components/dashboard/PipelineDonut';

export default function DashboardPage() {
  const { deals, loading } = useDeals();
  const { accounts } = useAccounts();

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
