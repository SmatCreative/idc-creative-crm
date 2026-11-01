'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { SupplierProduct } from '@/lib/supabase/types';

export function useSupplierProducts(supplierId?: string) {
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!supplierId) { setProducts([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('supplier_products')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('product_name');
    setProducts(data ?? []);
    setLoading(false);
  }, [supplierId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (values: Omit<SupplierProduct, 'id' | 'created_at' | 'updated_at' | 'supplier'>) => {
    const { data, error } = await supabase.from('supplier_products').insert(values).select().single();
    if (error) throw error;
    setProducts((prev) => [...prev, data].sort((a, b) => a.product_name.localeCompare(b.product_name)));
    return data;
  };

  const update = async (id: string, values: Partial<SupplierProduct>) => {
    const { data, error } = await supabase.from('supplier_products').update(values).eq('id', id).select().single();
    if (error) throw error;
    setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('supplier_products').delete().eq('id', id);
    if (error) throw error;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return { products, loading, refetch: fetch, create, update, remove };
}
