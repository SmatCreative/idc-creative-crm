'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label, FormGroup, Textarea, Select } from '@/components/ui/Input';
import type { Contact, Account } from '@/lib/supabase/types';

interface ContactFormProps {
  initial?: Partial<Contact>;
  accounts: Account[];
  onSubmit: (values: Partial<Contact>) => Promise<void>;
  onCancel: () => void;
}

export function ContactForm({ initial, accounts, onSubmit, onCancel }: ContactFormProps) {
  const [form, setForm] = useState({
    full_name: initial?.full_name ?? '',
    role: initial?.role ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    account_id: initial?.account_id ?? '',
    notes: initial?.notes ?? '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit({ ...form, account_id: form.account_id || null, role: form.role || null, email: form.email || null, phone: form.phone || null, notes: form.notes || null }); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormGroup>
        <Label htmlFor="full_name">Full Name *</Label>
        <Input id="full_name" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Jane Smith" />
      </FormGroup>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup>
          <Label htmlFor="role">Role / Title</Label>
          <Input id="role" value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Head of Marketing" />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="account_id">Account</Label>
          <Select id="account_id" value={form.account_id} onChange={(e) => set('account_id', e.target.value)}>
            <option value="">No account</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.company_name}</option>)}
          </Select>
        </FormGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@acme.com" />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 000 1234" />
        </FormGroup>
      </div>
      <FormGroup>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </FormGroup>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Saving…' : initial?.id ? 'Save Changes' : 'Add Contact'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
