/*
  # Add After Sales Role and Records

  1. New Features
    - Add after_sales role to user management
    - Create after_sales_records table for tracking post-sale services
    - Add after sales specialist user account
    - Add after sales related knowledge base entries

  2. Security
    - Enable RLS on after_sales_records table
    - Add policies for after sales and admin access
    - Maintain existing user policies

  3. Data
    - Insert after sales specialist account
    - Add sample after sales knowledge base entries
    - Insert sample after sales records if orders exist
*/

-- Add after sales specialist account
INSERT INTO users (id, username, email, role, name, is_active, created_at, updated_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000005',
    'aftersales1',
    'aftersales1@catstore.com',
    'after_sales',
    'David Zhang',
    true,
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE 
SET 
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;

-- Ensure other user accounts exist and are correct
INSERT INTO users (id, username, email, role, name, is_active, created_at, updated_at)
VALUES 
  -- Admin account
  (
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'admin@catstore.com',
    'admin',
    'Administrator',
    true,
    now(),
    now()
  ),
  -- Sales accounts
  (
    '00000000-0000-0000-0000-000000000002',
    'sales1',
    'sales1@catstore.com',
    'sales',
    'Alice Chen',
    true,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'sales2',
    'sales2@catstore.com',
    'sales',
    'Bob Wang',
    true,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'sales3',
    'sales3@catstore.com',
    'sales',
    'Carol Li',
    true,
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE 
SET 
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;

-- Create after sales records table if it doesn't exist
CREATE TABLE IF NOT EXISTS after_sales_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  agent text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'after_sales_records' 
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE after_sales_records ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can read after sales records" ON after_sales_records;
DROP POLICY IF EXISTS "After sales and admin can insert records" ON after_sales_records;
DROP POLICY IF EXISTS "After sales and admin can update records" ON after_sales_records;

-- Create RLS policies
CREATE POLICY "Users can read after sales records"
  ON after_sales_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "After sales and admin can insert records"
  ON after_sales_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('after_sales', 'admin')
    )
  );

CREATE POLICY "After sales and admin can update records"
  ON after_sales_records
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('after_sales', 'admin')
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('after_sales', 'admin')
    )
  );

-- Create update trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_after_sales_records_updated_at'
  ) THEN
    CREATE TRIGGER update_after_sales_records_updated_at
      BEFORE UPDATE ON after_sales_records
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_after_sales_records_order_id ON after_sales_records(order_id);
CREATE INDEX IF NOT EXISTS idx_after_sales_records_status ON after_sales_records(status);
CREATE INDEX IF NOT EXISTS idx_after_sales_records_date ON after_sales_records(date);

-- Add after sales related knowledge base entries (only if they don't exist)
DO $$
BEGIN
  -- Check if the knowledge base entries already exist
  IF NOT EXISTS (SELECT 1 FROM knowledge_base WHERE question = '猫咪适应新环境的常见问题及解决方法') THEN
    INSERT INTO knowledge_base (id, question, answer, category, tags, images, view_count, created_at, updated_at)
    VALUES 
      (
        gen_random_uuid(),
        '猫咪适应新环境的常见问题及解决方法',
        '**猫咪适应新环境常见问题：**

1. **躲藏不出来**
   - 解决方法：给猫咪准备一个安全的小空间，放置猫窝、猫砂盆和食物，减少干扰，让它慢慢适应。
   - 不要强行将猫咪拉出来，给予足够的时间和空间。

2. **不吃不喝**
   - 解决方法：保持食物和水的新鲜，尝试提供与之前相同的食物。
   - 可以使用猫零食引诱，或尝试湿粮增加食欲。

3. **叫声增多**
   - 解决方法：多陪伴猫咪，播放轻柔的音乐。
   - 使用费洛蒙产品帮助缓解压力。

4. **排泄问题**
   - 解决方法：确保猫砂盆位置安静且容易到达。
   - 使用与之前相同类型的猫砂。

**适应期建议：**

- 给予猫咪至少2周的适应时间
- 保持日常作息规律
- 使用玩具和互动增加安全感
- 准备猫抓板和猫爬架
- 避免频繁访客和大声噪音

**何时需要寻求帮助：**
- 超过24小时不进食
- 出现呕吐、腹泻等症状
- 持续躲藏超过一周
- 攻击性行为明显增加',
        '售后服务',
        ARRAY['新环境', '适应', '行为', '解决方案'],
        ARRAY['https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg'],
        45,
        now(),
        now()
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM knowledge_base WHERE question = '如何正确处理猫咪常见健康问题') THEN
    INSERT INTO knowledge_base (id, question, answer, category, tags, images, view_count, created_at, updated_at)
    VALUES 
      (
        gen_random_uuid(),
        '如何正确处理猫咪常见健康问题',
        '**猫咪常见健康问题处理指南：**

1. **毛球问题**
   - 症状：频繁呕吐、食欲下降、便秘
   - 处理方法：
     - 定期梳理猫咪毛发，特别是长毛猫
     - 提供专用化毛膏或化毛猫草
     - 确保充足饮水
     - 选择含有纤维的猫粮

2. **牙齿问题**
   - 症状：口臭、流口水、进食困难
   - 处理方法：
     - 定期刷牙（使用专用猫咪牙刷和牙膏）
     - 提供牙齿清洁零食或玩具
     - 定期兽医检查

3. **皮肤问题**
   - 症状：过度舔舐、皮肤发红、脱毛
   - 处理方法：
     - 检查是否有跳蚤或螨虫
     - 使用温和的猫咪专用洗浴产品
     - 保持环境清洁
     - 如症状持续，咨询兽医

4. **泌尿系统问题**
   - 症状：频繁进出猫砂盆、排尿困难、尿液中有血
   - 处理方法：
     - 立即就医（尤其是公猫）
     - 增加饮水量
     - 考虑使用泌尿道健康配方猫粮
     - 保持猫砂盆清洁

**预防保健建议：**
- 定期体检（每年至少一次）
- 按时接种疫苗
- 定期驱虫
- 健康饮食和适量运动
- 保持环境清洁

**紧急情况（需立即就医）：**
- 呼吸困难
- 持续呕吐或腹泻
- 无法排尿
- 高烧
- 严重外伤
- 突然瘫痪或无法行走',
        '售后服务',
        ARRAY['健康', '疾病', '预防', '治疗'],
        ARRAY['https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg'],
        78,
        now(),
        now()
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM knowledge_base WHERE question = '猫咪饲养一年内的常规售后服务内容') THEN
    INSERT INTO knowledge_base (id, question, answer, category, tags, images, view_count, created_at, updated_at)
    VALUES 
      (
        gen_random_uuid(),
        '猫咪饲养一年内的常规售后服务内容',
        '**猫咪饲养第一年售后服务指南**

**1. 适应期支持（1-4周）**
- 电话回访：确认猫咪适应情况
- 饮食建议：根据猫咪情况调整饮食
- 行为咨询：解决初期适应问题
- 紧急支持：处理突发健康问题

**2. 成长期跟踪（1-6个月）**
- 生长发育评估：确认体重增长是否正常
- 疫苗接种提醒：按时完成疫苗接种
- 绝育/去势咨询：提供专业建议和服务推荐
- 行为训练指导：如厕训练、抓挠训练等

**3. 健康管理（6-12个月）**
- 半年体检提醒：预约兽医检查
- 营养评估：调整饮食计划
- 牙齿护理指导：预防牙结石
- 毛发护理建议：根据季节变化提供建议

**4. 特殊服务**
- 上门健康检查：专业人员上门评估猫咪健康状况
- 行为问题咨询：解决攻击性、焦虑等问题
- 环境改善建议：优化家庭环境，提高猫咪生活质量
- 寄养服务推荐：主人外出时的照顾方案

**5. 常规联系方式**
- 售后服务热线：400-123-4567（工作日9:00-18:00）
- 紧急联系电话：138-0013-8000（24小时）
- 微信群：购买后邀请加入"猫咪之家"群
- 邮箱：aftersales@catstore.com

**注意事项：**
- 所有售后服务需提前24小时预约
- 上门服务仅限特定城市区域
- 紧急情况请直接联系紧急电话
- 保留购买凭证以便享受完整售后服务',
        '售后服务',
        ARRAY['售后', '服务内容', '饲养指南', '健康管理'],
        ARRAY[]::text[],
        56,
        now(),
        now()
      );
  END IF;
END $$;

-- Insert sample after sales service records
DO $$
DECLARE
    order1_id uuid;
    order2_id uuid;
    existing_count integer;
BEGIN
    -- Get completed or shipped order IDs
    SELECT id INTO order1_id FROM orders WHERE status = 'completed' LIMIT 1;
    SELECT id INTO order2_id FROM orders WHERE status = 'shipped' LIMIT 1;
    
    -- Check if we already have after sales records
    SELECT COUNT(*) INTO existing_count FROM after_sales_records;
    
    -- Insert after sales records if orders exist and no records exist yet
    IF order1_id IS NOT NULL AND existing_count = 0 THEN
        INSERT INTO after_sales_records (order_id, type, status, date, notes, agent)
        VALUES 
            (order1_id, '电话回访', 'completed', CURRENT_DATE - INTERVAL '5 days', '客户反馈猫咪适应良好，无特殊问题', 'David Zhang'),
            (order1_id, '上门检查', 'scheduled', CURRENT_DATE + INTERVAL '5 days', '预约上门检查猫咪健康状况', 'David Zhang');
    END IF;
    
    IF order2_id IS NOT NULL AND existing_count = 0 THEN
        INSERT INTO after_sales_records (order_id, type, status, date, notes, agent)
        VALUES 
            (order2_id, '健康咨询', 'pending', CURRENT_DATE - INTERVAL '2 days', '客户咨询猫咪饮食问题，已提供专业建议', 'David Zhang');
    END IF;
END $$;