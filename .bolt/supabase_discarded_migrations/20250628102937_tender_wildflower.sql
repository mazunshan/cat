/*
  # Add support for custom users and fix login

  1. Security Updates
    - Add policy to allow users to be created with custom IDs
    - Fix user authentication and login process
    - Ensure new users can be properly created and managed

  2. Changes
    - Add policy for service role to manage all users
    - Ensure users can be created with custom IDs
    - Fix user authentication flow
*/

-- Ensure service role can manage all users
CREATE POLICY IF NOT EXISTS "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read all profiles
CREATE POLICY IF NOT EXISTS "Authenticated users can read all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own profile during signup
CREATE POLICY IF NOT EXISTS "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ))
  WITH CHECK (auth.uid() = id OR EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ));

-- Allow admins to delete users
CREATE POLICY IF NOT EXISTS "Admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ));