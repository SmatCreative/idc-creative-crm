'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label, FormGroup, Textarea } from '@/components/ui/Input';
import type { Account } from '@/lib/supabase/types';

const industries = ['Advertising', 'Beauty & Wellness', 'Education', 'Entertainment', 'Finance', 'Food & Beverage', 'Healthcare', 'Hospitality', 'Real Estate', 'Retail', 'Tech Startup', 'Technology', 'Other'];

interface AccountFormProps {
  initial?: Partial<Account>;
  onSubmit: (values: Partial<Account>) => Promise<void>;
  onCancel: () => void;
}

export function AccountForm({ initial, onSubmit, onCancel }: AccountFormProps) {
  const [form, setForm] = useState({
    company_name: initial?.company_name ?? '',
    industry: initial?.industry ?? '',
    website: initial?.website ?? '',
    notes: initial?.notes ?? '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit({ ...form, industry: form.industry || null, website: form.website || null, notes: form.notes || null }); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormGroup>
        <Label htmlFor="company_name">Company Name *</Label>
        <Input id="company_name" required value={form.company_name} onChange={(e) => set('company_name', e.target.value)} placeholder="Acme Corp" />
      </FormGroup>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup>
          <Label htmlFor="industry">Industry</Label>
          <select id="industry" value={form.industry} onChange={(e) => set('industry', e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">Select…</option>
            {industries.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="website">Website</Label>
          <Input id="website" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="acme.com" />
        </FormGroup>
      </div>
      <FormGroup>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Key contacts, backstory..." />
      </FormGroup>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Saving…' : initial?.id ? 'Save Changes' : 'Create Account'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
