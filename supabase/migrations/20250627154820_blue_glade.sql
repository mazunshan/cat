/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current admin policies create infinite recursion by querying the users table within the policy
    - This happens because checking if a user is admin requires querying users table, which triggers the same policy

  2. Solution
    - Drop existing problematic policies
    - Create simpler policies that avoid recursion
    - Use a different approach for admin access control

  3. New Policies
    - Allow users to read their own profile
    - Allow users to update their own profile
    - Remove admin-specific policies to avoid recursion
    - Admin access control should be handled at application level
*/

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Allow admins to delete users" ON users;
DROP POLICY IF EXISTS "Allow admins to insert users" ON users;
DROP POLICY IF EXISTS "Allow admins to read all users" ON users;
DROP POLICY IF EXISTS "Allow admins to update all users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON users;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role (used by application) to manage all users
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Note: Admin functionality should be handled at the application level
-- by checking user roles after fetching the user's own profile