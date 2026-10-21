import { cn } from '@/lib/utils/cn';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({ title, value, change, changePositive = true, icon: Icon, iconColor = 'text-brand-600 dark:text-brand-400', iconBg = 'bg-brand-50 dark:bg-brand-950' }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
          {change && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', changePositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-600 dark:text-brand-400')}>
              <TrendingUp size={12} />
              {change}
            </div>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
    </div>
  );
}
