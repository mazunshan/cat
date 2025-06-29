/*
  # 添加考勤管理系统

  1. 新建表
    - `attendance_records` - 考勤记录表
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `date` (date)
      - `check_in_time` (timestamp)
      - `check_out_time` (timestamp)
      - `status` (text) - present, absent, late, early_leave
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. 安全设置
    - 启用 RLS
    - 添加适当的访问策略

  3. 索引
    - 为常用查询字段添加索引
*/

-- 创建考勤记录表
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  check_in_time timestamptz,
  check_out_time timestamptz,
  status text NOT NULL DEFAULT 'absent',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
-- 用户可以查看所有考勤记录（用于管理和统计）
CREATE POLICY "Users can read all attendance records"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (true);

-- 用户可以插入自己的考勤记录
CREATE POLICY "Users can insert their own attendance"
  ON attendance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的考勤记录
CREATE POLICY "Users can update their own attendance"
  ON attendance_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 管理员可以管理所有考勤记录
CREATE POLICY "Admins can manage all attendance records"
  ON attendance_records
  FOR ALL
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

-- 创建更新时间触发器
CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_id ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);

-- 创建唯一约束，确保每个用户每天只有一条记录
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_records_user_date 
  ON attendance_records(user_id, date);

-- 插入示例考勤数据
DO $$
DECLARE
    user_record RECORD;
    current_date_iter date;
    random_status text;
    random_check_in timestamptz;
    random_check_out timestamptz;
BEGIN
    -- 为过去30天生成考勤记录
    FOR current_date_iter IN 
        SELECT generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day')::date
    LOOP
        -- 为每个用户生成考勤记录
        FOR user_record IN SELECT id, name FROM users WHERE is_active = true
        LOOP
            -- 随机生成考勤状态
            CASE (random() * 10)::int
                WHEN 0, 1 THEN 
                    random_status := 'late';
                    random_check_in := current_date_iter + INTERVAL '9 hours' + (random() * 60)::int * INTERVAL '1 minute';
                    random_check_out := current_date_iter + INTERVAL '17 hours' + (random() * 60)::int * INTERVAL '1 minute';
                WHEN 2 THEN 
                    random_status := 'early_leave';
                    random_check_in := current_date_iter + INTERVAL '8 hours' + (random() * 30)::int * INTERVAL '1 minute';
                    random_check_out := current_date_iter + INTERVAL '16 hours' + (random() * 60)::int * INTERVAL '1 minute';
                WHEN 3 THEN 
                    random_status := 'absent';
                    random_check_in := NULL;
                    random_check_out := NULL;
                ELSE 
                    random_status := 'present';
                    random_check_in := current_date_iter + INTERVAL '8 hours' + (random() * 30)::int * INTERVAL '1 minute';
                    random_check_out := current_date_iter + INTERVAL '17 hours' + (random() * 60)::int * INTERVAL '1 minute';
            END CASE;

            -- 插入考勤记录
            INSERT INTO attendance_records (user_id, date, check_in_time, check_out_time, status, notes)
            VALUES (
                user_record.id,
                current_date_iter,
                random_check_in,
                random_check_out,
                random_status,
                CASE random_status
                    WHEN 'late' THEN '迟到'
                    WHEN 'early_leave' THEN '早退'
                    WHEN 'absent' THEN '请假'
                    ELSE '正常出勤'
                END
            )
            ON CONFLICT (user_id, date) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;