'use client';
import { useState } from 'react';
import { useDeals } from '@/lib/hooks/useDeals';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { DealSlideOver } from '@/components/deals/DealSlideOver';
import { DealForm } from '@/components/deals/DealForm';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StageBadge, ProjectTypeBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Deal, DealStage } from '@/lib/supabase/types';
import { DEAL_STAGES } from '@/lib/supabase/types';
import { Plus, Briefcase, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function DealsPage() {
  const { deals, loading, create, update } = useDeals();
  const { accounts } = useAccounts();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<DealStage | ''>('');

  const filtered = deals.filter((d) => {
    const matchSearch = !search || d.deal_name.toLowerCase().includes(search.toLowerCase()) || d.account?.company_name?.toLowerCase().includes(search.toLowerCase());
    const matchStage = !filterStage || d.stage === filterStage;
    return matchSearch && matchStage;
  });

  const handleCreate = async (values: Partial<Deal>) => {
    await create(values as Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'account'>);
    setShowNew(false);
  };

  const handleEdit = async (values: Partial<Deal>) => {
    if (!editingDeal) return;
    await update(editingDeal.id, values);
    setEditingDeal(null);
  };

  return (
    <div>
      <PageHeader
        title="Deals"
        description={`${deals.length} deals • ${formatCurrency(deals.filter(d => !['closed_won','closed_lost'].includes(d.stage)).reduce((s,d) => s + d.estimated_value, 0))} pipeline`}
        action={<Button size="sm" onClick={() => setShowNew(true)}><Plus size={14} /> New Deal</Button>}
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input className="pl-8" placeholder="Search deals…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value as DealStage | '')}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Stages</option>
          {DEAL_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No deals found" description="Create your first deal or adjust your filters." action={<Button size="sm" onClick={() => setShowNew(true)}><Plus size={14} /> New Deal</Button>} />
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deal</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stage</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Launch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((deal) => (
                <tr
                  key={deal.id}
                  onClick={() => setSelectedDeal(deal)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{deal.deal_name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{deal.account?.company_name ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3.5"><ProjectTypeBadge type={deal.project_type} /></td>
                  <td className="px-5 py-3.5"><StageBadge stage={deal.stage} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{formatCurrency(deal.estimated_value)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">{formatDate(deal.target_launch_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DealSlideOver
        deal={selectedDeal}
        accounts={accounts}
        open={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onEdit={(deal) => { setEditingDeal(deal); setSelectedDeal(null); }}
      />

      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Deal" size="md">
        <DealForm accounts={accounts} onSubmit={handleCreate} onCancel={() => setShowNew(false)} />
      </Modal>

      <Modal open={!!editingDeal} onClose={() => setEditingDeal(null)} title="Edit Deal" size="md">
        {editingDeal && (
          <DealForm initial={editingDeal} accounts={accounts} onSubmit={handleEdit} onCancel={() => setEditingDeal(null)} />
        )}
      </Modal>
    </div>
  );
}
