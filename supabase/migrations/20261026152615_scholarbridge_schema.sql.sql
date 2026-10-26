/*
# ScholarBridge: profiles, scholarships, applications

1. New Tables
- `profiles` — extends auth.users with full_name, birthdate, school. One row per user (id = auth.users.id).
- `scholarships` — shared catalog of scholarships / financial aid programs with category, deadline, slot availability. Readable by all authenticated users.
- `applications` — owner-scoped tracking of a student's submitted applications to scholarships, with status and key dates.

2. Security
- RLS enabled on all tables.
- `profiles`: owner-scoped CRUD (authenticated).
- `scholarships`: SELECT to authenticated (shared catalog). No writes from the client.
- `applications`: owner-scoped CRUD (authenticated), user_id defaults to auth.uid().

3. Notes
- Scholarship rows are seeded in this migration.
- Email confirmation stays OFF.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  birthdate date NOT NULL,
  school text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- scholarships (shared catalog)
CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  provider text NOT NULL,
  description text NOT NULL,
  eligibility text NOT NULL,
  amount text NOT NULL,
  deadline date NOT NULL,
  slots_available integer NOT NULL DEFAULT 0,
  slots_total integer NOT NULL DEFAULT 0,
  contact text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON scholarships TO authenticated;

DROP POLICY IF EXISTS "read_scholarships" ON scholarships;
CREATE POLICY "read_scholarships" ON scholarships FOR SELECT
  TO authenticated USING (true);

-- applications (owner-scoped)
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Submitted',
  submitted_date date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON applications TO authenticated;

DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications" ON applications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications" ON applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_applications" ON applications;
CREATE POLICY "delete_own_applications" ON applications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

INSERT INTO scholarships (name, category, provider, description, eligibility, amount, deadline, slots_available, slots_total, contact) VALUES
('City Transport Subsidy', 'Transportation', 'Metro Transit Authority', 'Monthly transit pass subsidy covering up to 80% of public transportation costs for eligible students.', 'Enrolled students with valid ID; household income below threshold.', 'Up to $60/month', '2026-11-30', 24, 30, 'transit-subsidy@city.gov'),
('Campus Meal Program', 'Meals', 'Student Affairs Office', 'Weekly meal credits redeemable at campus dining halls. Up to 14 meals per week.', 'Currently enrolled students experiencing food insecurity.', '14 meals/week', '2026-12-15', 40, 50, 'meals@campus.edu'),
('ConnectEd Data Grant', 'Internet Data', 'State Digital Inclusion Initiative', 'Reimbursement for mobile data plans and home internet bills up to $50 per month.', 'Students without reliable home internet; Pell-eligible preferred.', 'Up to $50/month', '2026-11-20', 12, 20, 'connected@state.gov'),
('Back-to-School Supply Kit', 'School Supplies', 'Alumni Foundation', 'Pre-assembled kits including notebooks, pens, calculators, and lab essentials.', 'First-generation and low-income students; enrollment verified.', '1 full kit', '2026-12-01', 18, 25, 'supplykit@alumni.org'),
('Library Print Credit', 'Printing', 'University Library', 'Free printing credits loaded onto student ID, up to 500 pages per semester.', 'Any enrolled student; for coursework-related printing.', '500 pages', '2026-12-31', 30, 30, 'printcredit@library.edu'),
('Bike Share Voucher', 'Transportation', 'Green Mobility Network', 'Three-month bike-share membership voucher for commuting students.', 'Students living within 5 miles of campus.', '3-month pass', '2026-11-10', 6, 15, 'bikeshare@greenmobility.org'),
('Weekend Meal Pantry', 'Meals', 'Community Food Bank', 'Non-perishable food care packages available for pickup every Friday.', 'Any student self-identifying as food-insecure.', 'Weekly package', '2026-12-20', 8, 60, 'pantry@foodbank.org'),
('Naga City Scholarship Grant', 'School Supplies', 'Naga City Government', 'Annual academic grant for tuition and essential school expenses for Naga residents.', 'Resident of Naga City; GPA 2.5+; enrolled in accredited institution.', 'Up to $1,500/year', '2027-01-15', 25, 100, 'scholarship@naga.gov')
ON CONFLICT DO NOTHING;
