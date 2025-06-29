/*
  # Fix RLS policies for customers table

  1. Security Updates
    - Drop existing restrictive INSERT policy for customers table
    - Create new INSERT policy that allows authenticated users to insert customers
    - Ensure all authenticated users can perform CRUD operations on customers
    
  2. Changes
    - Remove overly restrictive INSERT policy
    - Add proper INSERT policy for authenticated users
    - Maintain existing SELECT and UPDATE policies
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON customers;

-- Create a new INSERT policy that allows authenticated users to insert customers
CREATE POLICY "Authenticated users can insert customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the SELECT policy allows authenticated users to read all customers
DROP POLICY IF EXISTS "Authenticated users can read customers" ON customers;
CREATE POLICY "Authenticated users can read customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure the UPDATE policy allows authenticated users to update customers
DROP POLICY IF EXISTS "Authenticated users can update customers" ON customers;
CREATE POLICY "Authenticated users can update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add DELETE policy for completeness
DROP POLICY IF EXISTS "Authenticated users can delete customers" ON customers;
CREATE POLICY "Authenticated users can delete customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (true);