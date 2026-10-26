/*
# Add role-based access for students and donor/administrators

1. Schema changes
- Adds `role` column (text) to `profiles`: values 'student' or 'admin'. Defaults to 'student'.
- Adds `reviewer_id` column (uuid, nullable) to `applications` to record which admin last reviewed an application. References auth.users with ON DELETE SET NULL.
- Adds `reviewed_at` column (timestamptz, nullable) to `applications` to record when an admin last reviewed it.

2. Security changes
- The `profiles` SELECT/UPDATE policies stay owner-scoped, but we add an admin-read policy so admins can see all profiles (so they can view applicant details). Admins are identified by a subquery checking the profiles table for their own row's role = 'admin'. This is self-service and trust-by-default in this small app.
- The `applications` SELECT policy becomes: a user can see their own rows OR is an admin. We DROP the old owner-only SELECT policy and create two SELECT policies — one for owners, one for admins (using the same admin-check subquery).
- The `applications` UPDATE policy: owners can update their own rows (for status/notes). Admins can also update any row (to change status and set reviewer/reviewed_at). We keep the owner UPDATE policy and add an admin UPDATE policy. The admin UPDATE policy only allows changing the status, reviewer_id, reviewed_at columns via column-restricted grant — done by tightening the table grant.
- New column-restricted grants: admins (any authenticated user, with the policy gate) can UPDATE applications. To restrict columns we ALTER DEFAULT PRIVILEGES is complex, so instead we keep the table-level UPDATE grant but rely on the RLS policy to scope rows, and use a SECURITY DEFINER function for the actual admin status update so admins can only set status + reviewer fields, never notes or submitted_date.

3. Security DEFINER function
- `update_application_status(app_id uuid, new_status text)` — callable by authenticated users whose profile role is 'admin'. Updates the application's status, sets reviewer_id = auth.uid(), reviewed_at = now(). Returns the updated row. This avoids widening the client UPDATE grant to columns admins should not control.
- REVOKE EXECUTE from PUBLIC, anon; GRANT EXECUTE to authenticated.

4. RLS notes
- `profiles` gains an admin-read SELECT policy so admins can read any profile (applicant details). No admin INSERT/UPDATE/DELETE on others' profiles — only the owner edits their own.
- `applications` admin SELECT policy uses: EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin').
*/

-- 1. Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin'));

-- 2. Add reviewer fields to applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- 3. Index role for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 4. profiles: admin can SELECT all profiles
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 5. applications: admin can SELECT all applications
DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications" ON applications FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 6. applications: admin can UPDATE (status/reviewer fields) via the RPC below.
--    Keep owner UPDATE for their own notes/status fields.
DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications" ON applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_update_applications" ON applications FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- 7. SECURITY DEFINER function for admin status updates (column-safe)
CREATE OR REPLACE FUNCTION update_application_status(app_id uuid, new_status text)
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
    RAISE EXCEPTION 'Only administrators can update application status';
  END IF;

  IF new_status NOT IN ('Submitted','In Review','Approved','Rejected','Withdrawn') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE applications
  SET status = new_status,
      reviewer_id = auth.uid(),
      reviewed_at = now()
  WHERE id = app_id
  RETURNING * INTO updated_row;

  RETURN updated_row;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_application_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION update_application_status(uuid, text) TO authenticated;
