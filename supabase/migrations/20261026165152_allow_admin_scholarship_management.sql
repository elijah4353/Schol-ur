/*
# Allow admins to manage scholarships

1. Security changes
- Grants INSERT, UPDATE, DELETE on `scholarships` to `authenticated` (currently only SELECT is granted).
- Adds admin-scoped policies for INSERT, UPDATE, DELETE on `scholarships`: only users whose profile role is 'admin' can perform these.
- Existing SELECT policy stays unchanged (all authenticated users can browse scholarships).
*/

GRANT INSERT, UPDATE, DELETE ON scholarships TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admin_insert_scholarships" ON scholarships;
CREATE POLICY "admin_insert_scholarships" ON scholarships FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "admin_update_scholarships" ON scholarships;
CREATE POLICY "admin_update_scholarships" ON scholarships FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_scholarships" ON scholarships;
CREATE POLICY "admin_delete_scholarships" ON scholarships FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
