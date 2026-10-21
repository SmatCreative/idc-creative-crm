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
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Revenue Forecast</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monthly pipeline & closed revenue</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-brand-600 inline-block" /> Closed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-gray-300 inline-block" /> Pipeline
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#e11d48" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#9ca3af" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.12)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: '#111827', border: 'none', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#f3f4f6' }}
            formatter={(value: number, name: string) => [formatCurrency(value), name === 'won' ? 'Closed Revenue' : 'Pipeline']}
          />
          <Area type="monotone" dataKey="pipeline" stroke="#9ca3af" strokeWidth={2} fill="url(#colorPipeline)" />
          <Area type="monotone" dataKey="won"      stroke="#e11d48" strokeWidth={2} fill="url(#colorWon)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
