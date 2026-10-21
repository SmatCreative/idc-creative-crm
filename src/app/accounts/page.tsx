'use client';
import { useState } from 'react';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { AccountForm } from '@/components/accounts/AccountForm';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { formatCurrency } from '@/lib/utils/format';
import type { Account } from '@/lib/supabase/types';
import { Plus, Building2, Search, Globe, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function AccountsPage() {
  const { accounts, loading, create, update } = useAccounts();
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [search, setSearch] = useState('');

  const filtered = accounts.filter((a) =>
    !search || a.company_name.toLowerCase().includes(search.toLowerCase()) || a.industry?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async (values: Partial<Account>) => {
    await create(values as Omit<Account, 'id' | 'created_at' | 'updated_at'>);
    setShowNew(false);
  };

  const handleEdit = async (values: Partial<Account>) => {
    if (!editing) return;
    await update(editing.id, values);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Accounts"
        description={`${accounts.length} client companies`}
        action={<Button size="sm" onClick={() => setShowNew(true)}><Plus size={14} /> New Account</Button>}
      />

      <div className="relative max-w-xs mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input className="pl-8" placeholder="Search accounts…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No accounts found" description="Add your first client account." action={<Button size="sm" onClick={() => setShowNew(true)}><Plus size={14} /> New Account</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((account) => (
            <div key={account.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar name={account.company_name} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{account.company_name}</p>
                    {account.industry && <p className="text-xs text-gray-400 dark:text-gray-500">{account.industry}</p>}
                  </div>
                </div>
                <button
                  onClick={() => setEditing(account)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <Edit2 size={13} />
                </button>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Lifetime Value</p>
                  <p className="text-base font-bold text-gray-800 dark:text-gray-200">{formatCurrency(account.total_lifetime_value)}</p>
                </div>
                {account.website && (
                  <a href={`https://${account.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline">
                    <Globe size={12} /> {account.website}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Account">
        <AccountForm onSubmit={handleCreate} onCancel={() => setShowNew(false)} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Account">
        {editing && <AccountForm initial={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
