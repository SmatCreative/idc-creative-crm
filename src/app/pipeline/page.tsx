'use client';
import { useState } from 'react';
import { useDeals } from '@/lib/hooks/useDeals';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';
import { DealSlideOver } from '@/components/deals/DealSlideOver';
import { DealForm } from '@/components/deals/DealForm';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import type { Deal, DealStage } from '@/lib/supabase/types';
import { Plus, RefreshCw } from 'lucide-react';

export default function PipelinePage() {
  const { deals, loading, refetch, create, update, moveStage } = useDeals();
  const { accounts } = useAccounts();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [defaultStage, setDefaultStage] = useState<DealStage>('lead_captured');
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const handleAddDeal = (stage: DealStage) => {
    setDefaultStage(stage);
    setShowNewDeal(true);
  };

  const handleCreate = async (values: Partial<Deal>) => {
    await create(values as Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'account'>);
    setShowNewDeal(false);
  };

  const handleEdit = async (values: Partial<Deal>) => {
    if (!editingDeal) return;
    await update(editingDeal.id, values);
    setEditingDeal(null);
    if (selectedDeal?.id === editingDeal.id) {
      setSelectedDeal((prev) => prev ? { ...prev, ...values } as Deal : null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Pipeline"
        description="Drag deals across stages to track your creative projects."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={refetch}><RefreshCw size={14} /></Button>
            <Button size="sm" onClick={() => { setDefaultStage('lead_captured'); setShowNewDeal(true); }}>
              <Plus size={14} /> New Deal
            </Button>
          </div>
        }
      />

      <KanbanBoard
        deals={deals}
        onMoveStage={moveStage}
        onCardClick={setSelectedDeal}
        onAddDeal={handleAddDeal}
      />

      {/* Deal detail slide-over */}
      <DealSlideOver
        deal={selectedDeal}
        accounts={accounts}
        open={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onEdit={(deal) => { setEditingDeal(deal); setSelectedDeal(null); }}
      />

      {/* New deal modal */}
      <Modal open={showNewDeal} onClose={() => setShowNewDeal(false)} title="New Deal" size="md">
        <DealForm
          accounts={accounts}
          defaultStage={defaultStage}
          onSubmit={handleCreate}
          onCancel={() => setShowNewDeal(false)}
        />
      </Modal>

      {/* Edit deal modal */}
      <Modal open={!!editingDeal} onClose={() => setEditingDeal(null)} title="Edit Deal" size="md">
        {editingDeal && (
          <DealForm
            initial={editingDeal}
            accounts={accounts}
            onSubmit={handleEdit}
            onCancel={() => setEditingDeal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
