import { useEffect, useState } from 'react';
import { supabase, type Scholarship } from '@/lib/supabase';

export function useScholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('scholarships')
      .select('*')
      .order('deadline', { ascending: true })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error('Failed to load scholarships:', error.message);
        }
        setScholarships((data as Scholarship[]) ?? []);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { scholarships, loading };
}
