import { useCallback, useEffect, useState } from 'react';
import { supabase, type Application, type Scholarship, type Referral } from '@/lib/supabase';

type AdminApplication = Application & {
  scholarship: Scholarship;
  applicant: { full_name: string; school: string; birthdate: string };
  referrals?: Referral[];
};

export function useAllApplications() {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('applications')
      .select(
        '*, scholarship:scholarships(*), applicant:profiles!applications_user_id_fkey(full_name, school, birthdate), referrals:referrals(*, scholarship:scholarships(*))',
      )
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to load applications:', error.message);
    }
    setApplications((data as AdminApplication[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function setStatus(id: string, status: Application['status']) {
    const { data, error } = await supabase
      .rpc('update_application_status', { app_id: id, new_status: status });
    if (error) {
      console.error('Failed to update status:', error.message);
      return { error: error.message };
    }
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, ...(data as Application), status: (data as Application).status }
          : a,
      ),
    );
    return { error: null };
  }

  async function setReview(
    id: string,
    status: Application['status'],
    reviewNotes: string,
  ) {
    const { data, error } = await supabase
      .rpc('update_application_review', {
        app_id: id,
        new_status: status,
        review_notes: reviewNotes,
      });
    if (error) {
      console.error('Failed to update review:', error.message);
      return { error: error.message };
    }
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              ...(data as Application),
              status: (data as Application).status,
              review_notes: (data as Application).review_notes,
            }
          : a,
      ),
    );
    return { error: null };
  }

  return { applications, loading, refresh, setStatus, setReview };
}
