/*
  # Add teams table and team relationships

  1. New Tables
    - `teams` - Sales teams table
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Changes
    - Add `team_id` column to `users` table
    - Add foreign key constraint from `users.team_id` to `teams.id`
  
  3. Security
    - Enable RLS on `teams` table
    - Add policy for admins to manage teams
    - Add policy for users to read teams
*/

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add team_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage teams" ON teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can read teams" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample teams
INSERT INTO teams (name, description)
VALUES 
  ('销售一组', '负责线上销售和展会推广'),
  ('销售二组', '负责门店销售和VIP客户');

-- Create sales_performance table for tracking daily performance
CREATE TABLE IF NOT EXISTS sales_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  traffic INTEGER NOT NULL DEFAULT 0,
  orders INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, user_id)
);

-- Enable RLS
ALTER TABLE sales_performance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage sales performance" ON sales_performance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can read all sales performance" ON sales_performance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage own sales performance" ON sales_performance
  FOR ALL USING (
    auth.uid() = user_id
  );

-- Create trigger for updated_at
CREATE TRIGGER update_sales_performance_updated_at
  BEFORE UPDATE ON sales_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_sales_performance_date ON sales_performance(date);
CREATE INDEX idx_sales_performance_user_id ON sales_performance(user_id);
CREATE INDEX idx_sales_performance_team_id ON sales_performance(team_id);