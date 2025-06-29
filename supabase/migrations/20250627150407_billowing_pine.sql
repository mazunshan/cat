/*
  # Fix customers table INSERT policy

  1. Security Changes
    - Drop the existing INSERT policy that's preventing authenticated users from adding customers
    - Create a new INSERT policy that properly allows authenticated users to insert customer records
    - Ensure the policy allows any authenticated user to insert customers without restrictions

  The current policy has a `with_check` condition that's too restrictive. This migration
  fixes the policy to allow authenticated users to insert customer records properly.
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert customers" ON customers;

-- Create a new INSERT policy that allows authenticated users to insert customers
CREATE POLICY "Authenticated users can insert customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);