'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label, FormGroup, Textarea } from '@/components/ui/Input';
import type { Supplier } from '@/lib/supabase/types';

interface SupplierFormProps {
  initial?: Partial<Supplier>;
  onSubmit: (values: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
}

export function SupplierForm({ initial, onSubmit, onCancel }: SupplierFormProps) {
  const [form, setForm] = useState({
    company_name: initial?.company_name ?? '',
    contact_person: initial?.contact_person ?? '',
    whatsapp: initial?.whatsapp ?? '',
    email: initial?.email ?? '',
    location: initial?.location ?? '',
    notes: initial?.notes ?? '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        company_name: form.company_name,
        contact_person: form.contact_person || null,
        whatsapp: form.whatsapp || null,
        email: form.email || null,
        location: form.location || null,
        notes: form.notes || null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormGroup>
        <Label htmlFor="company_name">Company Name *</Label>
        <Input id="company_name" required value={form.company_name} onChange={(e) => set('company_name', e.target.value)} placeholder="e.g., ZimPrint Solutions" />
      </FormGroup>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup>
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input id="contact_person" value={form.contact_person} onChange={(e) => set('contact_person', e.target.value)} placeholder="Name" />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="+263 77…" />
        </FormGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="info@supplier.co.zw" />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Harare CBD" />
        </FormGroup>
      </div>
      <FormGroup>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Lead times, payment terms…" />
      </FormGroup>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving…' : initial?.id ? 'Save Changes' : 'Add Supplier'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
