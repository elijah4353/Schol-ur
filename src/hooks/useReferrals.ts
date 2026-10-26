import { useCallback, useState } from 'react';
import { supabase, type Referral, type ReferralStatus } from '@/lib/supabase';

export function useReferrals(applicationId: string | null) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!applicationId) {
      setReferrals([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('referrals')
      .select('*, scholarship:scholarships(*)')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });
    if (error) console.error('Failed to load referrals:', error.message);
    setReferrals((data as Referral[]) ?? []);
    setLoading(false);
  }, [applicationId]);

  async function addReferral(
    scholarshipId: string,
    followUpNotes: string,
  ): Promise<{ error: string | null }> {
    if (!applicationId) return { error: 'No application selected' };
    const { error } = await supabase.from('referrals').insert({
      application_id: applicationId,
      scholarship_id: scholarshipId,
      follow_up_notes: followUpNotes.trim(),
    });
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  async function updateReferral(
    id: string,
    patch: { status?: ReferralStatus; follow_up_notes?: string },
  ): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('referrals')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  async function removeReferral(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('referrals').delete().eq('id', id);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  return {
    referrals,
    loading,
    refresh,
    addReferral,
    updateReferral,
    removeReferral,
  };
}
