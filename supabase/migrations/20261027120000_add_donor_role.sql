-- Add donor as a distinct signup role while preserving admin and student roles.
ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'donor', 'admin'));