'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Task } from '@/lib/supabase/types';

export function useTasks(dealId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('tasks')
      .select('*, deal:deals(id, deal_name), contact:contacts(id, full_name)')
      .order('due_date', { ascending: true, nullsFirst: false });
    if (dealId) query = query.eq('deal_id', dealId);
    const { data } = await query;
    setTasks(data ?? []);
    setLoading(false);
  }, [dealId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (values: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'deal' | 'contact'>) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(values)
      .select('*, deal:deals(id, deal_name), contact:contacts(id, full_name)')
      .single();
    if (error) throw error;
    setTasks((prev) => [...prev, data]);
    return data;
  };

  const toggle = async (id: string, completed: boolean) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq('id', id)
      .select('*, deal:deals(id, deal_name), contact:contacts(id, full_name)')
      .single();
    if (error) throw error;
    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  };

  const update = async (id: string, values: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(values)
      .eq('id', id)
      .select('*, deal:deals(id, deal_name), contact:contacts(id, full_name)')
      .single();
    if (error) throw error;
    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, loading, refetch: fetch, create, toggle, update, remove };
}
