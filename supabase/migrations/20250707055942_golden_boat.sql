/*
  # Add announcements table

  1. New Tables
    - `announcements` - System announcements table
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `content` (text, not null)
      - `visible_to` (text, not null)
      - `priority` (text, not null)
      - `created_by` (uuid, references users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `announcements` table
    - Add policy for admins to manage announcements
    - Add policy for users to read announcements
*/

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  visible_to TEXT NOT NULL CHECK (visible_to IN ('sales', 'after_sales', 'all')),
  priority TEXT NOT NULL CHECK (priority IN ('normal', 'important', 'urgent')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can read announcements" ON announcements
  FOR SELECT USING (
    visible_to = 'all' OR
    (visible_to = 'sales' AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'sales'
    )) OR
    (visible_to = 'after_sales' AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'after_sales'
    )) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample announcements
INSERT INTO announcements (title, content, visible_to, priority, created_by, created_at)
VALUES 
  ('系统更新通知', '系统将于本周六凌晨2点-4点进行例行维护，期间系统将暂停使用。请各位同事提前做好工作安排。', 
   'all', 'important', 
   (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 
   NOW() - INTERVAL '5 days'),
   
  ('销售人员培训通知', '下周三下午2点将在会议室举行新品种介绍培训，请所有销售人员准时参加。', 
   'sales', 'normal', 
   (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 
   NOW() - INTERVAL '3 days'),
   
  ('售后服务流程更新', '售后服务流程已更新，请所有售后专员查看最新的服务手册，并按照新流程执行工作。

重点变更：
1. 回访时间调整为购买后3天、7天、30天
2. 新增满意度调查环节
3. 健康咨询需在2小时内响应', 
   'after_sales', 'urgent', 
   (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 
   NOW() - INTERVAL '1 day');