'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Supplier } from '@/lib/supabase/types';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('company_name');
    if (error) setError(error.message);
    else setSuppliers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (values: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('suppliers').insert(values).select().single();
    if (error) throw error;
    setSuppliers((prev) => [...prev, data].sort((a, b) => a.company_name.localeCompare(b.company_name)));
    return data;
  };

  const update = async (id: string, values: Partial<Supplier>) => {
    const { data, error } = await supabase.from('suppliers').update(values).eq('id', id).select().single();
    if (error) throw error;
    setSuppliers((prev) => prev.map((s) => (s.id === id ? data : s)));
    return data;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  return { suppliers, loading, error, refetch: fetch, create, update, remove };
}
