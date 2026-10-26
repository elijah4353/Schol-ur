import { useEffect, useState } from 'react';
import { supabase, type Application, type Scholarship } from '@/lib/supabase';

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const { data, error } = await supabase
      .from('applications')
      .select('*, scholarship:scholarships(*)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to load applications:', error.message);
    }
    setApplications((data as (Application & { scholarship: Scholarship })[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function addApplication(
    scholarshipId: string,
    submittedDate: string | null,
    notes: string,
  ): Promise<{ error: string | null }> {
    const { error } = await supabase.from('applications').insert({
      scholarship_id: scholarshipId,
      submitted_date: submittedDate,
      notes,
      status: 'Submitted',
    });
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  async function updateStatus(
    id: string,
    status: string,
  ): Promise<{ error: string | null }> {
    const { error } = await supabase.from('applications').update({ status }).eq('id', id);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  async function removeApplication(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  return { applications, loading, addApplication, updateStatus, removeApplication };
}
