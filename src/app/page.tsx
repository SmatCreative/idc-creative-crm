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
import { DollarSign, Briefcase, TrendingUp, CheckSquare, Building2, Trophy } from 'lucide-react';

export default function DashboardPage() {
  const { deals, loading } = useDeals();
  const { accounts } = useAccounts();
  const { tasks } = useTasks();

  const stats = useMemo(() => {
    const activeDeals = deals.filter((d) => !['closed_won', 'closed_lost'].includes(d.stage));
    const pipelineValue = activeDeals.reduce((sum, d) => sum + d.estimated_value, 0);
    const wonDeals = deals.filter((d) => d.stage === 'closed_won');
    const lostDeals = deals.filter((d) => d.stage === 'closed_lost');
    const winRate = wonDeals.length + lostDeals.length > 0
      ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100)
      : 0;
    const closedRevenue = wonDeals.reduce((sum, d) => sum + d.estimated_value, 0);
    const pendingTasks = tasks.filter((t) => !t.completed).length;

    return { pipelineValue, activeCount: activeDeals.length, winRate, closedRevenue, pendingTasks };
  }, [deals, tasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back — here's your agency pipeline at a glance."
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pipeline"
          value={formatCurrency(stats.pipelineValue)}
          change="Active opportunities"
          icon={DollarSign}
          iconColor="text-brand-600 dark:text-brand-400"
          iconBg="bg-brand-50 dark:bg-brand-950"
        />
        <StatCard
          title="Active Deals"
          value={String(stats.activeCount)}
          change="In pipeline"
          icon={Briefcase}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950"
        />
        <StatCard
          title="Win Rate"
          value={`${stats.winRate}%`}
          change="Closed-Won vs Lost"
          changePositive={stats.winRate >= 50}
          icon={Trophy}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950"
        />
        <StatCard
          title="Closed Revenue"
          value={formatCurrency(stats.closedRevenue)}
          change="All time won deals"
          icon={TrendingUp}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Accounts"
          value={String(accounts.length)}
          change="Client companies"
          icon={Building2}
          iconColor="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-50 dark:bg-violet-950"
        />
        <StatCard
          title="Open Tasks"
          value={String(stats.pendingTasks)}
          change="Across all deals"
          icon={CheckSquare}
          iconColor="text-teal-600 dark:text-teal-400"
          iconBg="bg-teal-50 dark:bg-teal-950"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <RevenueChart deals={deals} />
        </div>
        <PipelineDonut deals={deals} />
      </div>

      {/* Recent deals */}
      <RecentDeals deals={deals} />
    </div>
  );
}
