'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Deal, DealStage } from '@/lib/supabase/types';

export function useDeals(accountId?: string) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('deals')
      .select('*, account:accounts(id, company_name)')
      .order('created_at', { ascending: false });
    if (accountId) query = query.eq('account_id', accountId);
    const { data, error } = await query;
    if (error) setError(error.message);
    else setDeals(data ?? []);
    setLoading(false);
  }, [accountId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (values: Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'account'>) => {
    const { data, error } = await supabase.from('deals').insert(values).select('*, account:accounts(id, company_name)').single();
    if (error) throw error;
    setDeals((prev) => [data, ...prev]);
    return data;
  };

  const update = async (id: string, values: Partial<Deal>) => {
    const { data, error } = await supabase.from('deals').update(values).eq('id', id).select('*, account:accounts(id, company_name)').single();
    if (error) throw error;
    setDeals((prev) => prev.map((d) => (d.id === id ? data : d)));
    return data;
  };

  const moveStage = async (id: string, stage: DealStage) => {
    return update(id, { stage });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) throw error;
    setDeals((prev) => prev.filter((d) => d.id !== id));
  };

  return { deals, loading, error, refetch: fetch, create, update, moveStage, remove };
}

export function useDeal(id: string) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('deals')
      .select('*, account:accounts(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => { setDeal(data); setLoading(false); });
  }, [id]);

  return { deal, loading };
}
