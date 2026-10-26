import { useCallback, useEffect, useState } from 'react';
import { supabase, type Scholarship } from '@/lib/supabase';

export function useScholarshipManagement() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Failed to load scholarships:', error.message);
    setScholarships((data as Scholarship[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createScholarship(
    input: Omit<Scholarship, 'id' | 'created_at'>,
  ): Promise<{ error: string | null }> {
    const { error } = await supabase.from('scholarships').insert(input);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  async function updateScholarship(
    id: string,
    input: Partial<Omit<Scholarship, 'id' | 'created_at'>>,
  ): Promise<{ error: string | null }> {
    const { error } = await supabase.from('scholarships').update(input).eq('id', id);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  async function deleteScholarship(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('scholarships').delete().eq('id', id);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  return {
    scholarships,
    loading,
    refresh,
    createScholarship,
    updateScholarship,
    deleteScholarship,
  };
}
