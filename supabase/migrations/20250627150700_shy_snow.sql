/*
  # Fix RLS policies for customers table

  1. Security Updates
    - Drop existing INSERT policy that may be causing issues
    - Create new INSERT policy that properly allows authenticated users to add customers
    - Ensure all authenticated users can insert customer records
    - Maintain existing SELECT and UPDATE policies

  2. Changes
    - Remove problematic INSERT policy
    - Add new INSERT policy with proper permissions for authenticated users
*/

-- Drop the existing INSERT policy that might be causing issues
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON customers;

-- Create a new INSERT policy that allows authenticated users to insert customers
CREATE POLICY "Allow authenticated users to insert customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the SELECT policy allows reading all customers for authenticated users
DROP POLICY IF EXISTS "Users can read all customers" ON customers;
CREATE POLICY "Users can read all customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure the UPDATE policy allows updating customers for authenticated users
DROP POLICY IF EXISTS "Users can update customers" ON customers;
CREATE POLICY "Users can update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);