/*
  # Fix Users Table RLS Policies

  1. Security Updates
    - Drop existing restrictive RLS policies on users table
    - Add new policies that allow proper user management
    - Allow service role to manage all users (for admin functions)
    - Allow authenticated users to read all user profiles (for user lists)
    - Allow users to insert their own profile during signup
    - Allow users to update their own profile

  2. Changes
    - Remove overly restrictive policies
    - Add comprehensive policies for user management
    - Ensure admin functions work properly
    - Maintain security while allowing necessary operations
*/

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Service role can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON users;

-- Create new comprehensive policies

-- Allow service role (used by server-side operations) to manage all users
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read all user profiles (needed for user lists, assignments, etc.)
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
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to insert new users (for user management)
CREATE POLICY "Admins can insert new users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admins to update any user
CREATE POLICY "Admins can update any user"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admins to delete users (soft delete by setting is_active = false is preferred)
CREATE POLICY "Admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );