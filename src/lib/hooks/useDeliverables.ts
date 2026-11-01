'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Deliverable, DeliverableStatus } from '@/lib/supabase/types';

export function useDeliverables(dealId?: string) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!dealId) { setDeliverables([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('deliverables')
      .select('*')
      .eq('deal_id', dealId)
      .order('sort_order')
      .order('created_at');
    setDeliverables(data ?? []);
    setLoading(false);
  }, [dealId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (values: { title: string; description?: string; due_date?: string }) => {
    if (!dealId) return;
    const { data, error } = await supabase
      .from('deliverables')
      .insert({ ...values, deal_id: dealId, status: 'pending' })
      .select()
      .single();
    if (error) throw error;
    setDeliverables((prev) => [...prev, data]);
    return data;
  };

  const updateStatus = async (id: string, status: DeliverableStatus) => {
    const { data, error } = await supabase.from('deliverables').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    setDeliverables((prev) => prev.map((d) => (d.id === id ? data : d)));
  };

  const update = async (id: string, values: Partial<Deliverable>) => {
    const { data, error } = await supabase.from('deliverables').update(values).eq('id', id).select().single();
    if (error) throw error;
    setDeliverables((prev) => prev.map((d) => (d.id === id ? data : d)));
    return data;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('deliverables').delete().eq('id', id);
    if (error) throw error;
    setDeliverables((prev) => prev.filter((d) => d.id !== id));
  };

  return { deliverables, loading, refetch: fetch, create, updateStatus, update, remove };
}
