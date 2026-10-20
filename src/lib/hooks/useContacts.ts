'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Contact } from '@/lib/supabase/types';

export function useContacts(accountId?: string) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('contacts')
      .select('*, account:accounts(id, company_name)')
      .order('full_name');
    if (accountId) query = query.eq('account_id', accountId);
    const { data, error } = await query;
    if (error) setError(error.message);
    else setContacts(data ?? []);
    setLoading(false);
  }, [accountId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (values: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'account'>) => {
    const { data, error } = await supabase.from('contacts').insert(values).select('*, account:accounts(id, company_name)').single();
    if (error) throw error;
    setContacts((prev) => [...prev, data]);
    return data;
  };

  const update = async (id: string, values: Partial<Contact>) => {
    const { data, error } = await supabase.from('contacts').update(values).eq('id', id).select('*, account:accounts(id, company_name)').single();
    if (error) throw error;
    setContacts((prev) => prev.map((c) => (c.id === id ? data : c)));
    return data;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) throw error;
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return { contacts, loading, error, refetch: fetch, create, update, remove };
}
