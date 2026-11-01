'use client';
import { useMemo } from 'react';
import { startOfMonth, subMonths, endOfMonth, isAfter, parseISO } from 'date-fns';
import type { Deal, Account } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils/format';
import {
  DollarSign, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Factory, Banknote, Users, Target, BarChart3, Zap, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface KPITileProps {
  label: string;
  value: string;
  sub?: string;
  trend?: { value: string; up: boolean | null };
  icon: React.ReactNode;
  accent?: string;
  alert?: boolean;
}

function KPITile({ label, value, sub, trend, icon, accent = 'bg-gray-50 dark:bg-gray-800/60', alert }: KPITileProps) {
  return (
    <div className={cn(
      'rounded-2xl border p-4 flex flex-col gap-2 transition-shadow hover:shadow-md',
      alert
        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40'
        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm',
    )}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
        <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center', accent)}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>}
      {trend && (
        <div className={cn(
          'flex items-center gap-1 text-[11px] font-medium',
          trend.up === true ? 'text-emerald-600 dark:text-emerald-400' :
          trend.up === false ? 'text-brand-600 dark:text-brand-400' :
          'text-gray-400',
        )}>
          {trend.up === true ? <TrendingUp size={11} /> : trend.up === false ? <TrendingDown size={11} /> : <Minus size={11} />}
          {trend.value}
        </div>
      )}
    </div>
  );
}

interface Props {
  deals: Deal[];
  accounts: Account[];
}

export function BusinessKPIs({ deals, accounts }: Props) {
  const kpis = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Pipeline
    const active = deals.filter((d) => !['delivered', 'lost'].includes(d.stage));
    const pipelineValue = active.reduce((s, d) => s + d.estimated_value, 0);

    // Revenue: delivered
    const delivered = deals.filter((d) => d.stage === 'delivered');
    const deliveredRevenue = delivered.reduce((s, d) => s + d.estimated_value, 0);

    // This month vs last month (by updated_at for delivered)
    const thisMonthRevenue = delivered
      .filter((d) => parseISO(d.updated_at) >= monthStart)
      .reduce((s, d) => s + d.estimated_value, 0);
    const lastMonthRevenue = delivered
      .filter((d) => {
        const t = parseISO(d.updated_at);
        return t >= lastMonthStart && t <= lastMonthEnd;
      })
      .reduce((s, d) => s + d.estimated_value, 0);
    const momChange = lastMonthRevenue === 0
      ? null
      : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    // Win rate
    const closed = deals.filter((d) => ['delivered', 'lost'].includes(d.stage));
    const winRate = closed.length ? Math.round((delivered.length / closed.length) * 100) : null;

    // In production
    const inProd = deals.filter((d) => d.stage === 'in_production');
    const inProdValue = inProd.reduce((s, d) => s + d.estimated_value, 0);

    // Deposits outstanding: 50% of deposit_paid + in_production + ready
    const depositStages = deals.filter((d) => ['deposit_paid', 'in_production', 'ready'].includes(d.stage));
    const depositsReceived = depositStages.reduce((s, d) => s + d.estimated_value * 0.5, 0);
    const balanceDue = delivered.reduce((s, d) => s + d.estimated_value * 0.5, 0);

    // Overdue (past target_launch_date, not yet delivered)
    const overdue = active.filter((d) => {
      if (!d.target_launch_date) return false;
      return isAfter(now, parseISO(d.target_launch_date));
    });

    // Social MRR
    const socialActive = active.filter((d) => d.service_type === 'Social Media');
    const socialMRR = socialActive.reduce((s, d) => s + d.estimated_value, 0);

    // Average deal size
    const avgDeal = deals.length ? deals.reduce((s, d) => s + d.estimated_value, 0) / deals.length : 0;

    // New clients this month
    const newClientsThisMonth = accounts.filter((a) => parseISO(a.created_at) >= monthStart).length;

    // Enquiries this month
    const enquiriesThisMonth = deals.filter((d) => parseISO(d.created_at) >= monthStart).length;

    return {
      pipelineValue, deliveredRevenue, thisMonthRevenue, lastMonthRevenue, momChange,
      winRate, inProd: inProd.length, inProdValue, depositsReceived, balanceDue,
      overdue: overdue.length, socialMRR, avgDeal, newClientsThisMonth,
      enquiriesThisMonth, totalClients: accounts.length,
    };
  }, [deals, accounts]);

  const momTrend = kpis.momChange === null
    ? { value: 'No prev data', up: null as null }
    : kpis.momChange >= 0
    ? { value: `+${kpis.momChange.toFixed(0)}% vs last month`, up: true }
    : { value: `${kpis.momChange.toFixed(0)}% vs last month`, up: false };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 size={15} className="text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Business KPIs</h2>
      </div>

      {/* Revenue row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPITile
          label="Pipeline Value"
          value={formatCurrency(kpis.pipelineValue)}
          sub={`${deals.filter(d => !['delivered','lost'].includes(d.stage)).length} active projects`}
          icon={<DollarSign size={14} className="text-brand-600 dark:text-brand-400" />}
          accent="bg-brand-50 dark:bg-brand-950"
        />
        <KPITile
          label="Revenue This Month"
          value={formatCurrency(kpis.thisMonthRevenue)}
          sub="Delivered jobs"
          trend={momTrend}
          icon={<TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />}
          accent="bg-emerald-50 dark:bg-emerald-950"
        />
        <KPITile
          label="Balance Due"
          value={formatCurrency(kpis.balanceDue)}
          sub="50% outstanding on delivered"
          icon={<Banknote size={14} className="text-amber-600 dark:text-amber-400" />}
          accent="bg-amber-50 dark:bg-amber-950"
          alert={kpis.balanceDue > 0}
        />
        <KPITile
          label="Social Media MRR"
          value={formatCurrency(kpis.socialMRR)}
          sub={`${deals.filter(d => d.service_type === 'Social Media' && !['delivered','lost'].includes(d.stage)).length} retainers`}
          icon={<Zap size={14} className="text-pink-600 dark:text-pink-400" />}
          accent="bg-pink-50 dark:bg-pink-950"
        />
      </div>

      {/* Operations row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPITile
          label="In Production"
          value={String(kpis.inProd)}
          sub={formatCurrency(kpis.inProdValue) + ' value'}
          icon={<Factory size={14} className="text-orange-600 dark:text-orange-400" />}
          accent="bg-orange-50 dark:bg-orange-950"
        />
        <KPITile
          label="Win Rate"
          value={kpis.winRate !== null ? `${kpis.winRate}%` : '—'}
          sub={`${deals.filter(d => d.stage === 'delivered').length} delivered, ${deals.filter(d => d.stage === 'lost').length} lost`}
          icon={<Target size={14} className="text-blue-600 dark:text-blue-400" />}
          accent="bg-blue-50 dark:bg-blue-950"
        />
        <KPITile
          label="Overdue Jobs"
          value={String(kpis.overdue)}
          sub="Past delivery date"
          icon={<AlertTriangle size={14} className={kpis.overdue > 0 ? 'text-amber-600' : 'text-gray-400'} />}
          accent={kpis.overdue > 0 ? 'bg-amber-50 dark:bg-amber-950' : 'bg-gray-50 dark:bg-gray-800'}
          alert={kpis.overdue > 0}
        />
        <KPITile
          label="Avg Deal Size"
          value={formatCurrency(kpis.avgDeal)}
          sub={`Across ${deals.length} projects`}
          icon={<BarChart3 size={14} className="text-gray-500 dark:text-gray-400" />}
          accent="bg-gray-50 dark:bg-gray-800"
        />
      </div>

      {/* Client row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPITile
          label="Total Clients"
          value={String(kpis.totalClients)}
          sub={kpis.newClientsThisMonth > 0 ? `+${kpis.newClientsThisMonth} this month` : 'No new this month'}
          trend={kpis.newClientsThisMonth > 0 ? { value: `${kpis.newClientsThisMonth} new this month`, up: true } : undefined}
          icon={<Users size={14} className="text-gray-600 dark:text-gray-400" />}
          accent="bg-gray-50 dark:bg-gray-800"
        />
        <KPITile
          label="New Enquiries"
          value={String(kpis.enquiriesThisMonth)}
          sub="This month"
          icon={<Clock size={14} className="text-gray-500 dark:text-gray-400" />}
          accent="bg-gray-50 dark:bg-gray-800"
        />
        <KPITile
          label="Deposits Received"
          value={formatCurrency(kpis.depositsReceived)}
          sub="50% of in-progress jobs"
          icon={<Banknote size={14} className="text-teal-600 dark:text-teal-400" />}
          accent="bg-teal-50 dark:bg-teal-950"
        />
        <KPITile
          label="All-Time Revenue"
          value={formatCurrency(kpis.deliveredRevenue)}
          sub="All delivered projects"
          icon={<TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />}
          accent="bg-emerald-50 dark:bg-emerald-950"
        />
      </div>
    </div>
  );
}
