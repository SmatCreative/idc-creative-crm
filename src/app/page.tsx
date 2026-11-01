'use client';
import { useMemo } from 'react';
import { useDeals } from '@/lib/hooks/useDeals';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { useTasks } from '@/lib/hooks/useTasks';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentDeals } from '@/components/dashboard/RecentDeals';
import { PipelineDonut } from '@/components/dashboard/PipelineDonut';
import { formatCurrency } from '@/lib/utils/format';
import { DollarSign, Briefcase, Factory, Building2, CheckSquare, Banknote } from 'lucide-react';

export default function DashboardPage() {
  const { deals, loading } = useDeals();
  const { accounts } = useAccounts();
  const { tasks } = useTasks();

  const stats = useMemo(() => {
    const activeDeals = deals.filter((d) => !['delivered', 'lost'].includes(d.stage));
    const pipelineValue = activeDeals.reduce((sum, d) => sum + d.estimated_value, 0);

    const inProduction = deals.filter((d) => d.stage === 'in_production');
    const productionValue = inProduction.reduce((sum, d) => sum + d.estimated_value, 0);

    const depositPaid = deals.filter((d) => ['deposit_paid', 'in_production', 'ready'].includes(d.stage));
    const depositsReceived = depositPaid.reduce((sum, d) => sum + d.estimated_value * 0.5, 0);

    const delivered = deals.filter((d) => d.stage === 'delivered');
    const deliveredRevenue = delivered.reduce((sum, d) => sum + d.estimated_value, 0);

    const socialDeals = activeDeals.filter((d) => d.service_type === 'Social Media');
    const socialMRR = socialDeals.reduce((sum, d) => sum + d.estimated_value, 0);

    const pendingTasks = tasks.filter((t) => !t.completed).length;

    return {
      pipelineValue,
      activeCount: activeDeals.length,
      inProductionCount: inProduction.length,
      productionValue,
      depositsReceived,
      deliveredRevenue,
      socialMRR,
      pendingTasks,
    };
  }, [deals, tasks]);

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

      {/* Stats row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Pipeline"
          value={formatCurrency(stats.pipelineValue)}
          change={`${stats.activeCount} active projects`}
          icon={DollarSign}
          iconColor="text-brand-600 dark:text-brand-400"
          iconBg="bg-brand-50 dark:bg-brand-950"
        />
        <StatCard
          title="In Production"
          value={String(stats.inProductionCount)}
          change={formatCurrency(stats.productionValue) + ' value'}
          icon={Factory}
          iconColor="text-orange-600 dark:text-orange-400"
          iconBg="bg-orange-50 dark:bg-orange-950"
        />
        <StatCard
          title="Deposits Received"
          value={formatCurrency(stats.depositsReceived)}
          change="50% of jobs in progress"
          changePositive
          icon={Banknote}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950"
        />
        <StatCard
          title="Delivered Revenue"
          value={formatCurrency(stats.deliveredRevenue)}
          change="All delivered jobs"
          changePositive={stats.deliveredRevenue > 0}
          icon={Briefcase}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950"
        />
      </div>

      {/* Stats row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Clients"
          value={String(accounts.length)}
          change="Client companies"
          icon={Building2}
          iconColor="text-gray-600 dark:text-gray-400"
          iconBg="bg-gray-100 dark:bg-gray-800"
        />
        <StatCard
          title="Social Media MRR"
          value={formatCurrency(stats.socialMRR)}
          change="Active social retainers"
          changePositive={stats.socialMRR > 0}
          icon={DollarSign}
          iconColor="text-pink-600 dark:text-pink-400"
          iconBg="bg-pink-50 dark:bg-pink-950"
        />
        <StatCard
          title="Open Tasks"
          value={String(stats.pendingTasks)}
          change="Across all projects"
          icon={CheckSquare}
          iconColor="text-brand-600 dark:text-brand-400"
          iconBg="bg-brand-50 dark:bg-brand-950"
        />
      </div>

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
