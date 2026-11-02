'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Account } from '@/lib/supabase/types';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('company_name');
    if (error) setError(error.message);
    else setAccounts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (values: Omit<Account, 'id' | 'updated_at' | 'created_at'> & { created_at?: string }) => {
    const { created_at, ...insertValues } = values;
    const { data, error } = await supabase.from('accounts').insert(insertValues).select().single();
    if (error) throw error;
    if (created_at) {
      const { data: backdated, error: e2 } = await supabase
        .from('accounts').update({ created_at }).eq('id', data.id).select().single();
      if (!e2 && backdated) {
        setAccounts((prev) => [...prev, backdated]);
        return backdated;
      }
    }
    setAccounts((prev) => [...prev, data]);
    return data;
  };

  const update = async (id: string, values: Partial<Account>) => {
    const { data, error } = await supabase.from('accounts').update(values).eq('id', id).select().single();
    if (error) throw error;
    setAccounts((prev) => prev.map((a) => (a.id === id ? data : a)));
    return data;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  return { accounts, loading, error, refetch: fetch, create, update, remove };
}
