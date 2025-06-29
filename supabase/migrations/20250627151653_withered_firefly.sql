/*
  # Fix Authentication and User Management Policies

  1. Security Updates
    - Add proper RLS policies for users table to allow authenticated users to manage their profiles
    - Add policy for admins to manage all users
    - Fix existing policies to work with auth.uid()

  2. Changes
    - Update users table policies to allow proper user creation and management
    - Ensure authenticated users can insert their own profile
    - Allow admins to read and manage all user accounts
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON users;

-- Create new comprehensive policies for users table
CREATE POLICY "Allow authenticated users to insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to read their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins to read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Allow admins to insert users"
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

CREATE POLICY "Allow admins to update all users"
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

CREATE POLICY "Allow admins to delete users"
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

-- Insert default admin user if it doesn't exist
INSERT INTO users (id, username, email, role, name, is_active)
VALUES (
  gen_random_uuid(),
  'admin',
  'admin@catstore.com',
  'admin',
  'Administrator',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert default sales users if they don't exist
INSERT INTO users (id, username, email, role, name, is_active)
VALUES 
  (
    gen_random_uuid(),
    'sales1',
    'sales1@catstore.com',
    'sales',
    'Alice Chen',
    true
  ),
  (
    gen_random_uuid(),
    'sales2',
    'sales2@catstore.com',
    'sales',
    'Bob Wang',
    true
  )
ON CONFLICT (email) DO NOTHING;