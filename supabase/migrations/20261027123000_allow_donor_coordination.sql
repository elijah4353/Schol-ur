-- Give donor accounts the same coordination capabilities as administrators.

DROP POLICY IF EXISTS "donor_select_profiles" ON profiles;
CREATE POLICY "donor_select_profiles" ON profiles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'donor'));

DROP POLICY IF EXISTS "donor_select_applications" ON applications;
CREATE POLICY "donor_select_applications" ON applications FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'donor'));

DROP POLICY IF EXISTS "donor_update_applications" ON applications;
CREATE POLICY "donor_update_applications" ON applications FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'donor'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'donor'));

DROP POLICY IF EXISTS "donor_select_referrals" ON referrals;
CREATE POLICY "donor_select_referrals" ON referrals FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'donor'));

DROP POLICY IF EXISTS "donor_insert_referrals" ON referrals;
CREATE POLICY "donor_insert_referrals" ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'donor'));

DROP POLICY IF EXISTS "donor_update_referrals" ON referrals;
CREATE POLICY "donor_update_referrals" ON referrals FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'donor'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'donor'));

DROP POLICY IF EXISTS "donor_delete_referrals" ON referrals;
CREATE POLICY "donor_delete_referrals" ON referrals FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'donor'));

DROP POLICY IF EXISTS "donor_insert_scholarships" ON scholarships;
CREATE POLICY "donor_insert_scholarships" ON scholarships FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'donor'));

DROP POLICY IF EXISTS "donor_update_scholarships" ON scholarships;
CREATE POLICY "donor_update_scholarships" ON scholarships FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'donor'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'donor'));

DROP POLICY IF EXISTS "donor_delete_scholarships" ON scholarships;
CREATE POLICY "donor_delete_scholarships" ON scholarships FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'donor'));

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
  IF caller_role IS NULL OR caller_role NOT IN ('admin', 'donor') THEN
    RAISE EXCEPTION 'Only administrators and donors can update application reviews';
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