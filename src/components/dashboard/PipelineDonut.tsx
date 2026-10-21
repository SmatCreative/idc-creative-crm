'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Deal } from '@/lib/supabase/types';
import { DEAL_STAGES } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils/format';
import { useMemo } from 'react';

const stageColors: Record<string, string> = {
  lead_captured:     '#6b7280',
  discovery_scoping: '#60a5fa',
  proposal_sent:     '#fb923c',
  negotiation:       '#fbbf24',
  closed_won:        '#34d399',
  closed_lost:       '#e11d48',
};

export function PipelineDonut({ deals }: { deals: Deal[] }) {
  const data = useMemo(() => {
    return DEAL_STAGES
      .map((s) => ({
        name: s.label,
        key: s.key,
        value: deals.filter((d) => d.stage === s.key).reduce((sum, d) => sum + d.estimated_value, 0),
        count: deals.filter((d) => d.stage === s.key).length,
      }))
      .filter((d) => d.value > 0);
  }, [deals]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Pipeline by Stage</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Value distribution across stages</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
            {data.map((entry) => (
              <Cell key={entry.key} fill={stageColors[entry.key]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#111827', border: 'none', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#f3f4f6' }}
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
