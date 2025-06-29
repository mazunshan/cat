/*
  # Fix RLS Policy for Customers Table

  1. Policy Updates
    - Drop existing INSERT policy for customers table
    - Create new INSERT policy that properly allows authenticated users to insert customers
    - Ensure the policy works with the current authentication setup

  2. Security
    - Maintain RLS protection while allowing proper INSERT operations
    - Ensure only authenticated users can insert customer data
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Allow authenticated users to insert customers" ON customers;

-- Create a new INSERT policy that allows authenticated users to insert customers
CREATE POLICY "Authenticated users can insert customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also ensure the SELECT policy is working correctly
DROP POLICY IF EXISTS "Users can read all customers" ON customers;

CREATE POLICY "Authenticated users can read customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure UPDATE policy is working correctly
DROP POLICY IF EXISTS "Users can update customers" ON customers;

CREATE POLICY "Authenticated users can update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);