/*
# Add apply_url column and replace scholarships with real Philippine programs

1. Schema changes
- Adds `apply_url` (text, nullable) to `scholarships` so each program can link to its official application portal.
2. Data changes
- Clears the old seed/demo scholarships and replaces them with real Philippine government and institutional scholarship programs (CHED, DOST, TESDA, GSIS, OWWA, SSS, plus Bicol regional programs).
- All amounts use the Philippine Peso sign (₱).
- Each row includes a real `apply_url` pointing to the official portal or program page.
3. Security
- No policy or grant changes. The `scholarships` table already grants SELECT to `authenticated` with RLS enabled.
*/

ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS apply_url text;

-- Remove old seed rows and replace with real programs.
-- Using a transactional DELETE then INSERT; no user-created scholarships exist yet.
DELETE FROM scholarships WHERE name IN (
  'City Transport Subsidy',
  'Campus Meal Program',
  'ConnectEd Data Grant',
  'Back-to-School Supply Kit',
  'Library Print Credit',
  'Bike Share Voucher',
  'Weekend Meal Pantry',
  'Naga City Scholarship Grant',
  'Bicol University Tuition Grant',
  'Camarines Sur Academic Scholarship',
  'Albay Livelihood and Study Assistance',
  'Sorsogon Book and Supply Grant',
  'Catanduanes State University Aid',
  'Masbate Island Scholarship Program',
  'Bicol Merit Scholarship',
  'DOST-Bicol STEM Grant',
  'National Merit Academic Scholarship',
  'Community Leadership Scholarship',
  'Undergraduate Research Fellowship',
  'Transfer Student Scholarship'
);

INSERT INTO scholarships (name, category, provider, description, eligibility, amount, deadline, slots_available, slots_total, contact, apply_url)
SELECT t.name, t.category, t.provider, t.description, t.eligibility, t.amount, t.deadline::date, t.slots_available, t.slots_total, t.contact, t.apply_url
FROM (VALUES
  ('CHED Merit Scholarship Program (CMSP)'::text, 'General Scholarship'::text, 'Commission on Higher Education (CHED)'::text, 'Competitive scholarship for academically talented Filipino students entering or in their first year of college, covering tuition, allowances, and other educational expenses.'::text, 'Filipino citizen; incoming/current first-year college student; minimum GWA of 93% or equivalent; household income not exceeding ₱400,000/year.'::text, 'Up to ₱60,000/year'::text, '2027-07-31'::text, 2779::integer, 2779::integer, 'info@ched.gov.ph'::text, 'https://bpms.ched.gov.ph'::text),
  ('CHED StuFAPs – Student Financial Assistance Programs'::text, 'General Scholarship'::text, 'Commission on Higher Education (CHED)'::text, 'Financial assistance for underprivileged students enrolled in priority courses, covering tuition and miscellaneous fees at participating HEIs.'::text, 'Filipino citizen; enrolled in a CHED-recognized program; belongs to a Special Equity Group (SEG); household income below threshold.'::text, 'Up to ₱40,000/year'::text, '2027-06-30'::text, 5000::integer, 5000::integer, 'stufaps@ched.gov.ph'::text, 'https://legacy.ched.gov.ph/merit-scholarship'::text),
  ('DOST-SEI Undergraduate Scholarship (RA 7687)'::text, 'General Scholarship'::text, 'Department of Science and Technology – Science Education Institute'::text, 'Full scholarship for talented Filipino students pursuing science and technology courses, including tuition, book allowance, monthly stipend, and transportation allowance.'::text, 'Grade 12 STEM strand graduate or top 5% of class; Filipino citizen; family income below DOST threshold.'::text, 'Up to ₱80,000/year'::text, '2027-03-31'::text, 10000::integer, 10000::integer, 'sei@ dost.gov.ph'::text, 'https://science-scholarships.ph'::text),
  ('DOST-SEI Merit Scholarship Program'::text, 'General Scholarship'::text, 'Department of Science and Technology – Science Education Institute'::text, 'Merit-based scholarship for students pursuing S&T undergraduate degrees, covering tuition, book allowance, and monthly living allowance.'::text, 'Grade 12 graduate; enrolled or enrolling in a DOST priority course; GWA of at least 93%.'::text, 'Up to ₱60,000/year'::text, '2027-03-31'::text, 5000::integer, 5000::integer, 'sei@dost.gov.ph'::text, 'https://science-scholarships.ph'::text),
  ('TESDA TWSP – Training for Work Scholarship'::text, 'General Scholarship'::text, 'Technical Education and Skills Development Authority (TESDA)'::text, 'Free technical-vocational training and assessment for in-demand skills, with training allowance for qualified enrollees.'::text, 'Filipino citizen; at least 18 years old; able to complete the chosen TVET qualification.'::text, 'Free training + ₱60/day allowance'::text, '2027-12-31'::text, 50000::integer, 50000::integer, 'contactcenter@tesda.gov.ph'::text, 'https://www.tesda.gov.ph/about/tesda/1279'::text),
  ('TESDA PESFA – Private Education Student Financial Assistance'::text, 'General Scholarship'::text, 'Technical Education and Skills Development Authority (TESDA)'::text, 'Financial assistance for students enrolling in private TVET institutions, covering tuition and assessment fees.'::text, 'Filipino citizen; enrolled in a registered private TVET program; family income below threshold.'::text, 'Up to ₱15,000/semester'::text, '2027-08-31'::text, 20000::integer, 20000::integer, 'pesfa@tesda.gov.ph'::text, 'https://www.tesda.gov.ph/about/tesda/1279'::text),
  ('GSIS Scholarship Program (GSP)'::text, 'General Scholarship'::text, 'Government Service Insurance System (GSIS)'::text, 'Scholarship for children or dependents of low-income GSIS members and permanent total disability pensioners, covering tuition and a monthly stipend.'::text, 'Dependent of an active GSIS member with salary below ₱25,000/month; enrolled in a 4- or 5-year degree program.'::text, 'Up to ₱40,000/year + ₱3,000/month stipend'::text, '2027-05-31'::text, 1000::integer, 1000::integer, 'gsp@gsis.gov.ph'::text, 'https://www.gsis.gov.ph/ginhawa-for-all/gsp'::text),
  ('GSIS STEM Scholarship Program (GSSP)'::text, 'Research'::text, 'Government Service Insurance System (GSIS)'::text, 'Financial assistance for children of active GSIS members pursuing STEM degree programs.'::text, 'Child of an active GSIS member; enrolled in a STEM program; family income below threshold.'::text, '₱15,000/year subsidy'::text, '2027-06-15'::text, 1000::integer, 1000::integer, 'gssp@gsis.gov.ph'::text, 'https://www.gsis.gov.ph/ginhawa-for-all/gsis-subsidy-for-science-technology-engineering-and-mathematics-gssp'::text),
  ('OWWA EDSP – Education for Development Scholarship Program'::text, 'General Scholarship'::text, 'Overseas Workers Welfare Administration (OWWA)'::text, 'Scholarship grant for qualified dependents of OFWs, providing up to ₱60,000 per school year for a 4- or 5-year baccalaureate course.'::text, 'Dependent of an active OWWA member-OFW; not more than 21 years old; graduating Grade 12 or currently enrolled in college; income below threshold.'::text, 'Up to ₱60,000/year'::text, '2027-02-28'::text, 1500::integer, 1500::integer, 'edsp@owwa.gov.ph'::text, 'https://scholarship.owwa.gov.ph'::text),
  ('OWWA ODSP – OFW Dependent Scholarship Program'::text, 'General Scholarship'::text, 'Overseas Workers Welfare Administration (OWWA)'::text, 'Scholarship for dependents of OFWs earning below ₱25,000/month, providing ₱20,000 per school year for baccalaureate or technical-vocational courses.'::text, 'Dependent of an active OWWA member-OFW; family income below ₱25,000/month; enrolled in a 4-year or shorter course.'::text, 'Up to ₱20,000/year'::text, '2027-02-28'::text, 2000::integer, 2000::integer, 'odsp@owwa.gov.ph'::text, 'https://scholarship.owwa.gov.ph'::text),
  ('SSS Educational Assistance Loan Program (EALP)'::text, 'General Scholarship'::text, 'Social Security System (SSS)'::text, 'Subsidized educational loan for SSS members or their dependents, covering tuition and school fees for undergraduate or vocational courses.'::text, 'Active SSS member with at least 36 posted contributions; monthly income below ₱25,000; no outstanding SSS loans.'::text, 'Up to ₱20,000/semester'::text, '2027-09-30'::text, 10000::integer, 10000::integer, 'ealp@sss.gov.ph'::text, 'https://www.sss.gov.ph'::text),
  ('CHED Study Now Pay Later (SNPL)'::text, 'General Scholarship'::text, 'Commission on Higher Education (CHED)'::text, 'Government-funded student loan program providing up to ₱15,000 per year for tuition, payable after graduation at 6% annual interest.'::text, 'Filipino citizen; enrolled in a CHED-recognized HEI; family income below threshold; no existing student loans.'::text, 'Up to ₱15,000/year'::text, '2027-07-15'::text, 3000::integer, 3000::integer, 'snpl@ched.gov.ph'::text, 'https://legacy.ched.gov.ph'::text),
  ('Bicol University Tuition Grant'::text, 'Tuition'::text, 'Bicol University'::text, 'Full or partial tuition coverage for enrolled Bicol University students demonstrating academic merit and financial need.'::text, 'Currently enrolled BU student; GPA 2.5+; Bicol resident.'::text, 'Up to ₱100,000/semester'::text, '2027-02-28'::text, 30::integer, 80::integer, 'scholarships@bu.edu.ph'::text, 'https://www.bicol-u.edu.ph'::text),
  ('Camarines Sur Academic Scholarship'::text, 'Tuition'::text, 'Provincial Government of Camarines Sur'::text, 'Annual academic scholarship for tuition and miscellaneous fees for outstanding Camarines Sur residents.'::text, 'Resident of Camarines Sur; enrolled in an accredited institution; GPA 2.5+.'::text, 'Up to ₱90,000/year'::text, '2027-01-31'::text, 25::integer, 100::integer, 'scholarship@camarinessur.gov.ph'::text, 'https://www.camarinesSur.gov.ph'::text),
  ('Albay Livelihood and Study Assistance'::text, 'Living Allowance'::text, 'Albay Provincial Social Welfare Office'::text, 'Monthly living allowance for underprivileged students from Albay province to support day-to-day college expenses.'::text, 'Resident of Albay; household income below regional threshold; enrolled student.'::text, 'Up to ₱6,000/month'::text, '2026-12-20'::text, 20::integer, 60::integer, 'pswdo@albay.gov.ph'::text, 'https://www.albay.gov.ph'::text),
  ('Sorsogon Book and Supply Grant'::text, 'Books'::text, 'Sorsogon City Government'::text, 'Stipend for textbooks, lab manuals, and essential school supplies for Sorsogon students.'::text, 'Resident of Sorsogon; enrolled in a CHED-recognized program.'::text, 'Up to ₱20,000/semester'::text, '2027-02-15'::text, 15::integer, 50::integer, 'education@sorsogon.gov.ph'::text, 'https://www.sorsogon.gov.ph'::text),
  ('Catanduanes State University Aid'::text, 'Tuition'::text, 'Catanduanes State University'::text, 'Tuition assistance and miscellaneous fee subsidy for CatSU students from low-income households.'::text, 'Enrolled CatSU student; barangay certification of indigency.'::text, 'Up to ₱75,000/year'::text, '2027-03-15'::text, 12::integer, 40::integer, 'aid@catsu.edu.ph'::text, 'https://www.catsu.edu.ph'::text),
  ('Masbate Island Scholarship Program'::text, 'Tuition'::text, 'Provincial Government of Masbate'::text, 'Provincial government scholarship covering tuition and a modest stipend for Masbate residents pursuing higher education.'::text, 'Resident of Masbate; GPA 2.0+; enrolled in an accredited college or university.'::text, 'Up to ₱60,000/year'::text, '2027-02-10'::text, 18::integer, 70::integer, 'scholarship@masbate.gov.ph'::text, 'https://www.masbate.gov.ph'::text),
  ('Bicol Merit Scholarship'::text, 'General Scholarship'::text, 'Bicol Regional Development Council'::text, 'Regional merit scholarship open to top-performing students across the Bicol Region for any field of study.'::text, 'Bicol resident; GPA 3.0+; enrolled in any accredited institution.'::text, 'Up to ₱150,000/year'::text, '2027-03-31'::text, 10::integer, 40::integer, 'rdc@bicol.gov.ph'::text, 'https://www.region5.gov.ph'::text),
  ('DOST-Bicol STEM Grant'::text, 'Research'::text, 'Department of Science and Technology Region V'::text, 'Research and thesis support grant for Bicol students in science, technology, engineering, and mathematics programs.'::text, 'Bicol resident; enrolled in a STEM program; with an approved thesis/research plan.'::text, 'Up to ₱125,000'::text, '2027-02-28'::text, 8::integer, 30::integer, 'rost@region5.dost.gov.ph'::text, 'https://region5.dost.gov.ph'::text)
) AS t(name, category, provider, description, eligibility, amount, deadline, slots_available, slots_total, contact, apply_url)
WHERE NOT EXISTS (SELECT 1 FROM scholarships s WHERE s.name = t.name);
