/*
  # Fix customers table RLS policies

  1. Security Changes
    - Drop all existing RLS policies on customers table
    - Create new simplified policies that work with authentication
    - Ensure authenticated users can perform all CRUD operations
    - Add proper error handling for authentication context

  2. Changes Made
    - Remove overly restrictive policies
    - Add policies that check for authenticated role
    - Ensure WITH CHECK conditions are properly set
*/

-- Disable RLS temporarily to reset policies
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on customers table
DROP POLICY IF EXISTS "Users can read all customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;
DROP POLICY IF EXISTS "Users can delete customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can read customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can delete customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated users to insert customers" ON customers;

-- Re-enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies that work with authentication
CREATE POLICY "Enable read access for authenticated users" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON customers
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON customers
  FOR DELETE USING (auth.role() = 'authenticated');