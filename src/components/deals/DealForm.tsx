'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label, FormGroup, Select, Textarea } from '@/components/ui/Input';
import type { Deal, DealStage, ServiceType, Account } from '@/lib/supabase/types';
import { DEAL_STAGES, SERVICE_TYPES } from '@/lib/supabase/types';

interface DealFormProps {
  initial?: Partial<Deal>;
  accounts: Account[];
  defaultStage?: DealStage;
  onSubmit: (values: Partial<Deal>) => Promise<void>;
  onCancel: () => void;
}

export function DealForm({ initial, accounts, defaultStage = 'enquiry', onSubmit, onCancel }: DealFormProps) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    deal_name: initial?.deal_name ?? '',
    account_id: initial?.account_id ?? '',
    service_type: initial?.service_type ?? 'Other' as ServiceType,
    estimated_value: initial?.estimated_value ?? 0,
    stage: initial?.stage ?? defaultStage,
    goal: initial?.goal ?? '',
    target_launch_date: initial?.target_launch_date ?? '',
    description: initial?.description ?? '',
    closed_lost_reason: initial?.closed_lost_reason ?? '',
    project_date: initial?.created_at ? initial.created_at.slice(0, 10) : todayStr,
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { project_date, ...rest } = form;
      await onSubmit({
        ...rest,
        account_id: rest.account_id || null,
        goal: rest.goal || null,
        target_launch_date: rest.target_launch_date || null,
        closed_lost_reason: rest.closed_lost_reason || null,
        estimated_value: Number(rest.estimated_value),
        created_at: project_date ? new Date(project_date).toISOString() : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormGroup>
        <Label htmlFor="deal_name">Project Name *</Label>
        <Input id="deal_name" required value={form.deal_name} onChange={(e) => set('deal_name', e.target.value)} placeholder="e.g., Bloom Beauty Expo Pack" />
      </FormGroup>

      <div className="grid grid-cols-2 gap-3">
        <FormGroup>
          <Label htmlFor="account_id">Client</Label>
          <Select id="account_id" value={form.account_id} onChange={(e) => set('account_id', e.target.value)}>
            <option value="">No client</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.company_name}</option>)}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="service_type">Service Type</Label>
          <Select id="service_type" value={form.service_type} onChange={(e) => set('service_type', e.target.value as ServiceType)}>
            {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </FormGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormGroup>
          <Label htmlFor="estimated_value">Quote Value (USD)</Label>
          <Input id="estimated_value" type="number" min="0" step="10" value={form.estimated_value} onChange={(e) => set('estimated_value', e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="stage">Stage</Label>
          <Select id="stage" value={form.stage} onChange={(e) => set('stage', e.target.value as DealStage)}>
            {DEAL_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </Select>
        </FormGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormGroup>
          <Label htmlFor="project_date">Project Date</Label>
          <Input id="project_date" type="date" value={form.project_date} onChange={(e) => set('project_date', e.target.value)} />
          <p className="text-[11px] text-gray-400 mt-1">When did this project start? (can be in the past)</p>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="target_launch_date">Delivery Date</Label>
          <Input id="target_launch_date" type="date" value={form.target_launch_date} onChange={(e) => set('target_launch_date', e.target.value)} />
        </FormGroup>
      </div>

      <FormGroup>
        <Label htmlFor="goal">Client Goal / Objective</Label>
        <Input id="goal" value={form.goal} onChange={(e) => set('goal', e.target.value)} placeholder="What does the client want to achieve?" />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="description">Brief / Notes</Label>
        <Textarea id="description" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Job details, sizes, quantities, colours…" />
      </FormGroup>

      {form.stage === 'lost' && (
        <FormGroup>
          <Label htmlFor="closed_lost_reason">Lost Reason</Label>
          <Input id="closed_lost_reason" value={form.closed_lost_reason} onChange={(e) => set('closed_lost_reason', e.target.value)} placeholder="Budget, competitor, timing…" />
        </FormGroup>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving…' : initial?.id ? 'Save Changes' : 'Create Project'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
