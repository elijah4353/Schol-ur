-- Consolidate staff role and permission fixes for administrators and donors.

ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'donor', 'admin'));

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION current_user_role() TO authenticated;

DROP POLICY IF EXISTS "donor_select_profiles" ON public.profiles;
DROP POLICY IF EXISTS "donor_select_applications" ON public.applications;
DROP POLICY IF EXISTS "donor_update_applications" ON public.applications;
DROP POLICY IF EXISTS "donor_select_referrals" ON public.referrals;
DROP POLICY IF EXISTS "donor_insert_referrals" ON public.referrals;
DROP POLICY IF EXISTS "donor_update_referrals" ON public.referrals;
DROP POLICY IF EXISTS "donor_delete_referrals" ON public.referrals;
DROP POLICY IF EXISTS "donor_insert_scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "donor_update_scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "donor_delete_scholarships" ON public.scholarships;

DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR public.current_user_role() IN ('admin', 'donor')
  );

DROP POLICY IF EXISTS "select_own_applications" ON public.applications;
CREATE POLICY "select_own_applications" ON public.applications FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.current_user_role() IN ('admin', 'donor')
  );

DROP POLICY IF EXISTS "admin_update_applications" ON public.applications;
CREATE POLICY "admin_update_applications" ON public.applications FOR UPDATE
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'donor'))
  WITH CHECK (public.current_user_role() IN ('admin', 'donor'));

DROP POLICY IF EXISTS "admin_select_referrals" ON public.referrals;
CREATE POLICY "admin_select_referrals" ON public.referrals FOR SELECT
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'donor'));

DROP POLICY IF EXISTS "admin_insert_referrals" ON public.referrals;
CREATE POLICY "admin_insert_referrals" ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin', 'donor'));

DROP POLICY IF EXISTS "admin_update_referrals" ON public.referrals;
CREATE POLICY "admin_update_referrals" ON public.referrals FOR UPDATE
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'donor'))
  WITH CHECK (public.current_user_role() IN ('admin', 'donor'));

DROP POLICY IF EXISTS "admin_delete_referrals" ON public.referrals;
CREATE POLICY "admin_delete_referrals" ON public.referrals FOR DELETE
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'donor'));

DROP POLICY IF EXISTS "admin_insert_scholarships" ON public.scholarships;
CREATE POLICY "admin_insert_scholarships" ON public.scholarships FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin', 'donor'));

DROP POLICY IF EXISTS "admin_update_scholarships" ON public.scholarships;
CREATE POLICY "admin_update_scholarships" ON public.scholarships FOR UPDATE
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'donor'))
  WITH CHECK (public.current_user_role() IN ('admin', 'donor'));

DROP POLICY IF EXISTS "admin_delete_scholarships" ON public.scholarships;
CREATE POLICY "admin_delete_scholarships" ON public.scholarships FOR DELETE
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'donor'));

CREATE OR REPLACE FUNCTION public.update_application_status(app_id uuid, new_status text)
RETURNS public.applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_row public.applications;
BEGIN
  IF public.current_user_role() NOT IN ('admin', 'donor') THEN
    RAISE EXCEPTION 'Only administrators and donors can update application status';
  END IF;

  IF new_status NOT IN ('Submitted', 'In Review', 'Approved', 'Rejected', 'Withdrawn') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.applications
  SET status = new_status,
      reviewer_id = auth.uid(),
      reviewed_at = now()
  WHERE id = app_id
  RETURNING * INTO updated_row;

  RETURN updated_row;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_application_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_application_status(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_application_review(app_id uuid, new_status text, review_notes text)
RETURNS public.applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_row public.applications;
BEGIN
  IF public.current_user_role() NOT IN ('admin', 'donor') THEN
    RAISE EXCEPTION 'Only administrators and donors can update application reviews';
  END IF;

  IF new_status NOT IN ('Submitted', 'In Review', 'Approved', 'Rejected', 'Withdrawn') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.applications
  SET status = new_status,
      review_notes = review_notes,
      reviewer_id = auth.uid(),
      reviewed_at = now()
  WHERE id = app_id
  RETURNING * INTO updated_row;

  RETURN updated_row;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_application_review(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_application_review(uuid, text, text) TO authenticated;
