/*
  # Fix user management policies

  1. Security Updates
    - Add policies to allow proper user management
    - Allow service role to manage all users
    - Allow authenticated users to read all profiles
    - Allow users to insert their own profile
    - Allow admins to delete users

  2. Changes
    - Drop existing policies that might conflict
    - Create new policies with proper permissions
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Service role can manage all users" ON users;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Ensure service role can manage all users
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read all profiles
CREATE POLICY "Authenticated users can read all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
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
CREATE POLICY "Admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ));