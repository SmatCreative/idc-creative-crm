'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/format';
import type { Deal } from '@/lib/supabase/types';
import { useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface RevenueChartProps {
  deals: Deal[];
}

export function RevenueChart({ deals }: RevenueChartProps) {
  const data = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, 'MMM'),
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    });

    return months.map(({ month, start, end }) => {
      const won = deals
        .filter((d) => d.stage === 'closed_won' && d.updated_at >= start.toISOString() && d.updated_at <= end.toISOString())
        .reduce((sum, d) => sum + d.estimated_value, 0);
      const pipeline = deals
        .filter((d) => !['closed_won', 'closed_lost'].includes(d.stage) && d.created_at >= start.toISOString() && d.created_at <= end.toISOString())
        .reduce((sum, d) => sum + d.estimated_value, 0);
      return { month, won, pipeline };
    });
  }, [deals]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Revenue Forecast</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monthly pipeline & closed revenue</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-brand-500 inline-block" /> Closed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-blue-300 inline-block" /> Pipeline
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: 'rgb(15 23 42)', border: 'none', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#e2e8f0' }}
            formatter={(value: number, name: string) => [formatCurrency(value), name === 'won' ? 'Closed Revenue' : 'Pipeline']}
          />
          <Area type="monotone" dataKey="pipeline" stroke="#93c5fd" strokeWidth={2} fill="url(#colorPipeline)" />
          <Area type="monotone" dataKey="won" stroke="#6366f1" strokeWidth={2} fill="url(#colorWon)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
