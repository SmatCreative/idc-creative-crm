'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label, FormGroup, Select, Textarea } from '@/components/ui/Input';
import type { Deal, DealStage, ProjectType, Account } from '@/lib/supabase/types';
import { DEAL_STAGES, PROJECT_TYPES } from '@/lib/supabase/types';

interface DealFormProps {
  initial?: Partial<Deal>;
  accounts: Account[];
  defaultStage?: DealStage;
  onSubmit: (values: Partial<Deal>) => Promise<void>;
  onCancel: () => void;
}

export function DealForm({ initial, accounts, defaultStage = 'lead_captured', onSubmit, onCancel }: DealFormProps) {
  const [form, setForm] = useState({
    deal_name: initial?.deal_name ?? '',
    account_id: initial?.account_id ?? '',
    project_type: initial?.project_type ?? 'Other' as ProjectType,
    estimated_value: initial?.estimated_value ?? 0,
    stage: initial?.stage ?? defaultStage,
    target_launch_date: initial?.target_launch_date ?? '',
    description: initial?.description ?? '',
    closed_lost_reason: initial?.closed_lost_reason ?? '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        account_id: form.account_id || null,
        target_launch_date: form.target_launch_date || null,
        estimated_value: Number(form.estimated_value),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormGroup>
        <Label htmlFor="deal_name">Deal Name *</Label>
        <Input id="deal_name" required value={form.deal_name} onChange={(e) => set('deal_name', e.target.value)} placeholder="e.g., Nike Brand Refresh" />
      </FormGroup>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup>
          <Label htmlFor="account_id">Account</Label>
          <Select id="account_id" value={form.account_id} onChange={(e) => set('account_id', e.target.value)}>
            <option value="">No account</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.company_name}</option>)}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="project_type">Project Type</Label>
          <Select id="project_type" value={form.project_type} onChange={(e) => set('project_type', e.target.value as ProjectType)}>
            {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </FormGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup>
          <Label htmlFor="estimated_value">Estimated Value ($)</Label>
          <Input id="estimated_value" type="number" min="0" step="100" value={form.estimated_value} onChange={(e) => set('estimated_value', e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="stage">Stage</Label>
          <Select id="stage" value={form.stage} onChange={(e) => set('stage', e.target.value as DealStage)}>
            {DEAL_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </Select>
        </FormGroup>
      </div>
      <FormGroup>
        <Label htmlFor="target_launch_date">Target Launch Date</Label>
        <Input id="target_launch_date" type="date" value={form.target_launch_date} onChange={(e) => set('target_launch_date', e.target.value)} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Project brief, goals, context..." />
      </FormGroup>
      {form.stage === 'closed_lost' && (
        <FormGroup>
          <Label htmlFor="closed_lost_reason">Lost Reason</Label>
          <Input id="closed_lost_reason" value={form.closed_lost_reason} onChange={(e) => set('closed_lost_reason', e.target.value)} placeholder="Budget, competitor, timing..." />
        </FormGroup>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Saving…' : initial?.id ? 'Save Changes' : 'Create Deal'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
