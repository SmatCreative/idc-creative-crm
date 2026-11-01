'use client';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label, FormGroup, Textarea } from '@/components/ui/Input';
import type { SupplierProduct } from '@/lib/supabase/types';

interface ProductFormProps {
  supplierId: string;
  initial?: Partial<SupplierProduct>;
  onSubmit: (values: Omit<SupplierProduct, 'id' | 'created_at' | 'updated_at' | 'supplier'>) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ supplierId, initial, onSubmit, onCancel }: ProductFormProps) {
  const [form, setForm] = useState({
    product_name: initial?.product_name ?? '',
    category: initial?.category ?? '',
    unit: initial?.unit ?? 'unit',
    cost_price: initial?.cost_price ?? 0,
    markup_percent: initial?.markup_percent ?? 30,
    notes: initial?.notes ?? '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string | number) => setForm((prev) => ({ ...prev, [key]: value }));

  const clientPrice = useMemo(
    () => Number(form.cost_price) * (1 + Number(form.markup_percent) / 100),
    [form.cost_price, form.markup_percent],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        supplier_id: supplierId,
        product_name: form.product_name,
        category: form.category || null,
        unit: form.unit || 'unit',
        cost_price: Number(form.cost_price),
        markup_percent: Number(form.markup_percent),
        notes: form.notes || null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormGroup>
        <Label htmlFor="product_name">Product Name *</Label>
        <Input id="product_name" required value={form.product_name} onChange={(e) => set('product_name', e.target.value)} placeholder="e.g., 3x3m Branded Gazebo" />
      </FormGroup>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup>
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="Signage, Print, Fabric…" />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="unit">Unit</Label>
          <Input id="unit" value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="unit / m² / set" />
        </FormGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup>
          <Label htmlFor="cost_price">Cost Price (USD)</Label>
          <Input id="cost_price" type="number" min="0" step="0.01" value={form.cost_price} onChange={(e) => set('cost_price', e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="markup_percent">Markup %</Label>
          <Input id="markup_percent" type="number" min="0" step="1" value={form.markup_percent} onChange={(e) => set('markup_percent', e.target.value)} />
        </FormGroup>
      </div>

      {/* Live client price preview */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
        <div>
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Client Price</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500">Cost × (1 + {form.markup_percent}%)</p>
        </div>
        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
          ${clientPrice.toFixed(2)}
        </p>
      </div>

      <FormGroup>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Sizes available, MOQ, lead time…" />
      </FormGroup>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving…' : initial?.id ? 'Save Changes' : 'Add Product'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
