import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type UserRole = 'student' | 'donor' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  birthdate: string;
  school: string;
  role: UserRole;
  created_at: string;
}

export interface Scholarship {
  id: string;
  name: string;
  category: string;
  provider: string;
  description: string;
  eligibility: string;
  amount: string;
  deadline: string;
  slots_available: number;
  slots_total: number;
  contact: string;
  apply_url: string | null;
  created_at: string;
}

export type ApplicationStatus = 'Submitted' | 'In Review' | 'Approved' | 'Rejected' | 'Withdrawn';

export interface Application {
  id: string;
  user_id: string;
  scholarship_id: string;
  status: ApplicationStatus;
  submitted_date: string | null;
  notes: string;
  review_notes: string;
  reviewer_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  scholarship?: Scholarship;
  applicant?: { full_name: string; school: string; birthdate: string };
  referrals?: Referral[];
}

export type ReferralStatus = 'Pending' | 'Contacted' | 'Accepted' | 'Declined';

export interface Referral {
  id: string;
  application_id: string;
  scholarship_id: string;
  status: ReferralStatus;
  follow_up_notes: string;
  coordinator_id: string | null;
  created_at: string;
  updated_at: string;
  scholarship?: Scholarship;
}

export const REFERRAL_STATUSES: ReferralStatus[] = [
  'Pending',
  'Contacted',
  'Accepted',
  'Declined',
];

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Submitted',
  'In Review',
  'Approved',
  'Rejected',
  'Withdrawn',
];

export const NEED_CATEGORIES = [
  'Transportation',
  'Meals',
  'Internet Data',
  'School Supplies',
  'Printing',
] as const;

export type NeedCategory = (typeof NEED_CATEGORIES)[number];

export const SCHOLARSHIP_CATEGORIES = [
  'General Scholarship',
  'Tuition',
  'Living Allowance',
  'Books',
  'Research',
  'Transportation',
  'Meals',
  'Internet Data',
  'School Supplies',
  'Printing',
] as const;

export type ScholarshipCategory = (typeof SCHOLARSHIP_CATEGORIES)[number];
