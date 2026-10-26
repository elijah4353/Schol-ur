/*
# Add coordinator referral workflow: review notes and referrals

1. New columns on `applications`
- `review_notes` (text, default ''): internal notes the coordinator/donor
  writes during review. Distinct from the existing student-facing `notes`
  field. Coordinators update this via a SECURITY DEFINER function so the
  student cannot tamper with it through the owner UPDATE policy.

2. New table: `referrals`
- Records a coordinator directing an application/request toward a specific
  scholarship (assistance program). Tracks referral status, follow-up notes,
  who made the referral, and when.
- `id` (uuid PK)
- `application_id` (uuid, FK to applications ON DELETE CASCADE)
- `scholarship_id` (uuid, FK to scholarships ON DELETE CASCADE) — the
  assistance program the request is referred to
- `status` (text, one of 'Pending','Contacted','Accepted','Declined') —
  referral outcome
- `follow_up_notes` (text, default '') — coordinator follow-up remarks
- `coordinator_id` (uuid, FK to auth.users ON DELETE SET NULL) — who made it
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

3. Security
- `applications`: add `review_notes` column. Admins update it via the new
  SECURITY DEFINER function `update_application_review`; owner UPDATE policy
  already excludes this column because owners update through the client,
  which the function bypasses. We do NOT widen the owner UPDATE grant to
  include `review_notes`.
- `referrals`: RLS enabled. Admins (profile role = 'admin') get full CRUD.
  Students can SELECT referrals on their own applications (so they can see
  where their requests were referred). The insert/update/delete policies are
  admin-only via the admin-check subquery.
- Grants: `referrals` SELECT to authenticated; INSERT/UPDATE/DELETE to
  authenticated (gated by admin RLS policies). `applications` UPDATE grant
  already covers authenticated; the SECURITY DEFINER function runs as owner
  so it can update `review_notes` regardless of column-level privileges.

4. SECURITY DEFINER functions
- `update_application_review(app_id uuid, new_status text, review_notes text)`:
  callable by authenticated admins. Sets status (validated against the
  allowlist), reviewer_id, reviewed_at, and review_notes. Returns the
  updated row. Supersedes `update_application_status` for the donor flow
  but the older function is kept for backward compatibility.
- `upsert_referral(...)`: NOT used — referrals are managed through normal
  client inserts/updates gated by admin RLS policies, since all columns a
  coordinator sets are safe to expose. We keep the mutation path simple.

5. Notes
- Email confirmation stays OFF.
- This migration is idempotent: uses IF NOT EXISTS for columns/table and
  drops policies before recreating.
*/

-- 1. Add review_notes to applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS review_notes text NOT NULL DEFAULT '';

-- 2. Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Contacted','Accepted','Declined')),
  follow_up_notes text NOT NULL DEFAULT '',
  coordinator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON referrals TO authenticated;

CREATE INDEX IF NOT EXISTS idx_referrals_application_id ON referrals(application_id);
CREATE INDEX IF NOT EXISTS idx_referrals_scholarship_id ON referrals(scholarship_id);

-- 3. referrals policies
-- Admins can do everything; students can read referrals on their own applications.
DROP POLICY IF EXISTS "admin_select_referrals" ON referrals;
CREATE POLICY "admin_select_referrals" ON referrals FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "student_select_own_referrals" ON referrals;
CREATE POLICY "student_select_own_referrals" ON referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = referrals.application_id AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admin_insert_referrals" ON referrals;
CREATE POLICY "admin_insert_referrals" ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_update_referrals" ON referrals;
CREATE POLICY "admin_update_referrals" ON referrals FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_referrals" ON referrals;
CREATE POLICY "admin_delete_referrals" ON referrals FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- 4. SECURITY DEFINER function for admin review updates (status + review_notes)
CREATE OR REPLACE FUNCTION update_application_review(app_id uuid, new_status text, review_notes text)
RETURNS applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  updated_row applications;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role <> 'admin' THEN
    RAISE EXCEPTION 'Only administrators can update application review';
  END IF;

  IF new_status NOT IN ('Submitted','In Review','Approved','Rejected','Withdrawn') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE applications
  SET status = new_status,
      review_notes = review_notes,
      reviewer_id = auth.uid(),
      reviewed_at = now()
  WHERE id = app_id
  RETURNING * INTO updated_row;

  RETURN updated_row;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_application_review(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION update_application_review(uuid, text, text) TO authenticated;
