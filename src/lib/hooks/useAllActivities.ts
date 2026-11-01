'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Activity } from '@/lib/supabase/types';

export interface ActivityWithDeal extends Activity {
  deal?: { id: string; deal_name: string } | null;
}

export function useAllActivities(limit = 100) {
  const [activities, setActivities] = useState<ActivityWithDeal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('activities')
      .select('*, deal:deals(id, deal_name), contact:contacts(id, full_name)')
      .order('created_at', { ascending: false })
      .limit(limit);
    setActivities(data ?? []);
    setLoading(false);
  }, [limit]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (values: { type: Activity['type']; notes: string; deal_id: string | null; contact_id: string | null }) => {
    const { data, error } = await supabase
      .from('activities')
      .insert(values)
      .select('*, deal:deals(id, deal_name), contact:contacts(id, full_name)')
      .single();
    if (error) throw error;
    setActivities((prev) => [data, ...prev]);
    return data;
  };

  return { activities, loading, refetch: fetch, create };
}
