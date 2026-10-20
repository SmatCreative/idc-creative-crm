'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Activity } from '@/lib/supabase/types';

export function useActivities(dealId?: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('activities')
      .select('*, contact:contacts(id, full_name)')
      .order('created_at', { ascending: false });
    if (dealId) query = query.eq('deal_id', dealId);
    const { data } = await query;
    setActivities(data ?? []);
    setLoading(false);
  }, [dealId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (values: Omit<Activity, 'id' | 'created_at' | 'contact'>) => {
    const { data, error } = await supabase
      .from('activities')
      .insert(values)
      .select('*, contact:contacts(id, full_name)')
      .single();
    if (error) throw error;
    setActivities((prev) => [data, ...prev]);
    return data;
  };

  return { activities, loading, refetch: fetch, create };
}
