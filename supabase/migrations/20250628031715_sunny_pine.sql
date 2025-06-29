/*
  # 猫咪销售管理系统示例数据

  1. 数据清理
    - 清空所有表的现有数据
    - 重置自增序列

  2. 插入示例数据
    - 5个客户记录
    - 3个客户文件记录
    - 6个产品记录
    - 4个订单记录
    - 4个订单产品关联记录
    - 2个分期付款计划
    - 14个付款记录
    - 6个知识库问答

  3. 数据关联
    - 客户文件关联到客户
    - 订单关联到客户
    - 订单产品关联到订单和产品
    - 分期计划关联到订单
    - 付款记录关联到分期计划
*/

-- 清理现有数据（如果需要重新开始）
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE installment_plans RESTART IDENTITY CASCADE;
TRUNCATE TABLE order_products RESTART IDENTITY CASCADE;
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE customer_files RESTART IDENTITY CASCADE;
TRUNCATE TABLE customers RESTART IDENTITY CASCADE;
TRUNCATE TABLE products RESTART IDENTITY CASCADE;
TRUNCATE TABLE knowledge_base RESTART IDENTITY CASCADE;

-- 创建临时变量来存储生成的UUID
DO $$
DECLARE
    customer1_id uuid := gen_random_uuid();
    customer2_id uuid := gen_random_uuid();
    customer3_id uuid := gen_random_uuid();
    customer4_id uuid := gen_random_uuid();
    customer5_id uuid := gen_random_uuid();
    
    product1_id uuid := gen_random_uuid();
    product2_id uuid := gen_random_uuid();
    product3_id uuid := gen_random_uuid();
    product4_id uuid := gen_random_uuid();
    product5_id uuid := gen_random_uuid();
    product6_id uuid := gen_random_uuid();
    
    order1_id uuid := gen_random_uuid();
    order2_id uuid := gen_random_uuid();
    order3_id uuid := gen_random_uuid();
    order4_id uuid := gen_random_uuid();
    
    plan2_id uuid := gen_random_uuid();
    plan4_id uuid := gen_random_uuid();
BEGIN
    -- 插入客户数据
    INSERT INTO customers (id, name, gender, phone, wechat, address, occupation, tags, notes, assigned_sales, created_at, updated_at)
    VALUES 
      (
        customer1_id,
        '张小美',
        'female',
        '13800138001',
        'zhang_xiaomei',
        '北京市朝阳区三里屯路123号',
        'UI设计师',
        ARRAY['高意向', '英短爱好者', '预算充足'],
        '很喜欢银渐层，已看过多只猫咪，计划本月内购买',
        'Alice Chen',
        '2024-01-15 10:00:00+00'::timestamptz,
        '2024-01-15 10:00:00+00'::timestamptz
      ),
      (
        customer2_id,
        '李先生',
        'male',
        '13900139002',
        'li_mister',
        '上海市浦东新区世纪大道456号',
        '软件工程师',
        ARRAY['分期付款', '布偶猫', '首次购买'],
        '选择分期付款，工作稳定，收入可观，对布偶猫很感兴趣',
        'Bob Wang',
        '2024-02-01 09:30:00+00'::timestamptz,
        '2024-02-01 09:30:00+00'::timestamptz
      ),
      (
        customer3_id,
        '王女士',
        'female',
        '13700137003',
        'wang_lady',
        '广州市天河区珠江新城789号',
        '市场经理',
        ARRAY['老客户', '推荐朋友', '全款'],
        '第二次购买，上次购买布偶猫很满意，这次为朋友推荐',
        'Alice Chen',
        '2024-02-15 14:20:00+00'::timestamptz,
        '2024-02-15 14:20:00+00'::timestamptz
      ),
      (
        customer4_id,
        '陈先生',
        'male',
        '13600136004',
        'chen_sir',
        '深圳市南山区科技园路321号',
        '产品经理',
        ARRAY['波斯猫', '高端客户', '全款'],
        '对波斯猫情有独钟，预算充足，要求品相优秀',
        'Carol Li',
        '2024-03-01 11:15:00+00'::timestamptz,
        '2024-03-01 11:15:00+00'::timestamptz
      ),
      (
        customer5_id,
        '刘小姐',
        'female',
        '13500135005',
        'liu_miss',
        '杭州市西湖区文三路654号',
        '教师',
        ARRAY['暹罗猫', '预算有限', '分期'],
        '喜欢暹罗猫，预算有限，希望分期付款',
        'Bob Wang',
        '2024-03-10 16:45:00+00'::timestamptz,
        '2024-03-10 16:45:00+00'::timestamptz
      );

    -- 插入客户文件数据
    INSERT INTO customer_files (id, customer_id, name, type, url, description, uploaded_at)
    VALUES 
      (
        gen_random_uuid(),
        customer1_id,
        '家庭环境照片',
        'image',
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        '客户家中养猫环境，空间宽敞，适合养猫',
        '2024-01-16 10:30:00+00'::timestamptz
      ),
      (
        gen_random_uuid(),
        customer1_id,
        '客户与猫咪合影',
        'image',
        'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg',
        '客户很喜欢猫咪，有养猫经验',
        '2024-01-18 15:20:00+00'::timestamptz
      ),
      (
        gen_random_uuid(),
        customer2_id,
        '收入证明',
        'document',
        'https://example.com/income-proof.pdf',
        '月收入15000元，适合分期付款',
        '2024-02-02 09:45:00+00'::timestamptz
      );

    -- 插入产品数据
    INSERT INTO products (id, name, breed, age, gender, price, description, images, videos, is_available, features, created_at, updated_at)
    VALUES 
      (
        product1_id,
        '银渐层英短',
        '英国短毛猫',
        '3个月',
        'female',
        8800,
        '纯种银渐层英短，毛色均匀，性格温顺，已完成疫苗接种。父母均为CFA认证血统，品相优秀，健康保证。',
        ARRAY[
          'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg',
          'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
          'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg'
        ],
        ARRAY['https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'],
        true,
        ARRAY['纯种血统', '疫苗齐全', '健康保证', '可上门看猫', 'CFA认证'],
        '2024-01-01 08:00:00+00'::timestamptz,
        '2024-01-01 08:00:00+00'::timestamptz
      ),
      (
        product2_id,
        '蓝双色布偶猫',
        '布偶猫',
        '4个月',
        'male',
        12000,
        '蓝双色布偶猫，眼睛湛蓝，毛质柔顺，性格粘人。来自知名猫舍，父母均有优秀血统证书。',
        ARRAY[
          'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg',
          'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg',
          'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
        ],
        ARRAY[]::text[],
        true,
        ARRAY['CFA认证', '父母均有证书', '毛色标准', '性格亲人', '健康检查'],
        '2024-01-05 09:15:00+00'::timestamptz,
        '2024-01-05 09:15:00+00'::timestamptz
      ),
      (
        product3_id,
        '金点波斯猫',
        '波斯猫',
        '5个月',
        'female',
        15000,
        '金点波斯猫，毛色华丽，面部扁平，典型波斯猫特征。性格温和，适合家庭饲养。',
        ARRAY[
          'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg',
          'https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg'
        ],
        ARRAY[]::text[],
        false,
        ARRAY['纯种血统', '毛色华丽', '性格温和', '适合家庭', '健康保证'],
        '2024-01-10 10:30:00+00'::timestamptz,
        '2024-01-10 10:30:00+00'::timestamptz
      ),
      (
        product4_id,
        '纯白波斯猫',
        '波斯猫',
        '6个月',
        'male',
        18000,
        '纯白波斯猫，毛色纯净如雪，眼睛蓝色，品相极佳。来自顶级血统，适合参赛或繁殖。',
        ARRAY[
          'https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg',
          'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg'
        ],
        ARRAY[]::text[],
        true,
        ARRAY['顶级血统', '品相极佳', '适合参赛', '繁殖价值', '健康认证'],
        '2024-01-15 11:45:00+00'::timestamptz,
        '2024-01-15 11:45:00+00'::timestamptz
      ),
      (
        product5_id,
        '海豹色暹罗猫',
        '暹罗猫',
        '3个月',
        'female',
        6800,
        '海豹色暹罗猫，颜色对比鲜明，性格活泼好动，智商很高，容易训练。',
        ARRAY[
          'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg',
          'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg'
        ],
        ARRAY[]::text[],
        true,
        ARRAY['颜色标准', '性格活泼', '智商很高', '容易训练', '健康活泼'],
        '2024-01-20 13:20:00+00'::timestamptz,
        '2024-01-20 13:20:00+00'::timestamptz
      ),
      (
        product6_id,
        '蓝猫英短',
        '英国短毛猫',
        '4个月',
        'male',
        7500,
        '蓝猫英短，毛色纯正，体型圆润，性格稳重。是英短中的经典色系，深受喜爱。',
        ARRAY[
          'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
          'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg'
        ],
        ARRAY[]::text[],
        true,
        ARRAY['毛色纯正', '体型标准', '性格稳重', '经典色系', '健康保证'],
        '2024-01-25 14:10:00+00'::timestamptz,
        '2024-01-25 14:10:00+00'::timestamptz
      );

    -- 插入订单数据
    INSERT INTO orders (id, customer_id, order_number, amount, payment_method, status, order_date, sales_person, created_at, updated_at)
    VALUES 
      (
        order1_id,
        customer1_id,
        'ORD-2024-001',
        8800,
        'full',
        'completed',
        '2024-02-01'::date,
        'Alice Chen',
        '2024-02-01 10:00:00+00'::timestamptz,
        '2024-02-01 10:00:00+00'::timestamptz
      ),
      (
        order2_id,
        customer2_id,
        'ORD-2024-002',
        12000,
        'installment',
        'paid',
        '2024-02-10'::date,
        'Bob Wang',
        '2024-02-10 09:30:00+00'::timestamptz,
        '2024-02-10 09:30:00+00'::timestamptz
      ),
      (
        order3_id,
        customer3_id,
        'ORD-2024-003',
        15000,
        'full',
        'shipped',
        '2024-03-05'::date,
        'Alice Chen',
        '2024-03-05 14:20:00+00'::timestamptz,
        '2024-03-05 14:20:00+00'::timestamptz
      ),
      (
        order4_id,
        customer4_id,
        'ORD-2024-004',
        18000,
        'installment',
        'paid',
        '2024-03-12'::date,
        'Carol Li',
        '2024-03-12 11:15:00+00'::timestamptz,
        '2024-03-12 11:15:00+00'::timestamptz
      );

    -- 插入订单产品关联数据
    INSERT INTO order_products (id, order_id, product_id, quantity, price)
    VALUES 
      (
        gen_random_uuid(),
        order1_id,
        product1_id,
        1,
        8800
      ),
      (
        gen_random_uuid(),
        order2_id,
        product2_id,
        1,
        12000
      ),
      (
        gen_random_uuid(),
        order3_id,
        product3_id,
        1,
        15000
      ),
      (
        gen_random_uuid(),
        order4_id,
        product4_id,
        1,
        18000
      );

    -- 插入分期付款计划数据
    INSERT INTO installment_plans (id, order_id, total_installments, installment_amount, paid_installments, next_payment_date)
    VALUES 
      (
        plan2_id,
        order2_id,
        6,
        2000,
        2,
        '2024-04-10'::date
      ),
      (
        plan4_id,
        order4_id,
        12,
        1500,
        1,
        '2024-04-12'::date
      );

    -- 插入付款记录数据
    INSERT INTO payments (id, installment_plan_id, installment_number, amount, due_date, paid_date, status)
    VALUES 
      -- 订单2的付款记录
      (
        gen_random_uuid(),
        plan2_id,
        1,
        2000,
        '2024-02-10'::date,
        '2024-02-10'::date,
        'paid'
      ),
      (
        gen_random_uuid(),
        plan2_id,
        2,
        2000,
        '2024-03-10'::date,
        '2024-03-09'::date,
        'paid'
      ),
      (
        gen_random_uuid(),
        plan2_id,
        3,
        2000,
        '2024-04-10'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan2_id,
        4,
        2000,
        '2024-05-10'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan2_id,
        5,
        2000,
        '2024-06-10'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan2_id,
        6,
        2000,
        '2024-07-10'::date,
        NULL,
        'pending'
      ),
      -- 订单4的付款记录
      (
        gen_random_uuid(),
        plan4_id,
        1,
        1500,
        '2024-03-12'::date,
        '2024-03-12'::date,
        'paid'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        2,
        1500,
        '2024-04-12'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        3,
        1500,
        '2024-05-12'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        4,
        1500,
        '2024-06-12'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        5,
        1500,
        '2024-07-12'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        6,
        1500,
        '2024-08-12'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        7,
        1500,
        '2024-09-12'::date,
        NULL,
        'pending'
      ),
      (
        gen_random_uuid(),
        plan4_id,
        8,
        1500,
        '2024-10-12'::date,
        NULL,
        'pending'
      );

    -- 插入知识库数据
    INSERT INTO knowledge_base (id, question, answer, category, tags, images, view_count, created_at, updated_at)
    VALUES 
      (
        gen_random_uuid(),
        '如何选择适合的猫咪品种？',
        '选择猫咪品种需要考虑以下几个因素：

1. **生活空间大小**：大型猫咪如缅因猫需要更大的活动空间，小户型适合选择体型较小的品种。

2. **家庭成员情况**：有小孩的家庭建议选择性格温和的品种如布偶猫、英短等。

3. **护理时间**：长毛猫需要每天梳毛，短毛猫相对好打理。如果工作繁忙，建议选择短毛品种。

4. **预算考虑**：不同品种价格差异较大，同时要考虑后续的食物、医疗等费用。

5. **个人喜好**：最重要的是选择自己真正喜欢的品种，这样才能给猫咪最好的照顾。',
        '选购指南',
        ARRAY['品种选择', '新手指南', '家庭养猫'],
        ARRAY[
          'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg',
          'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg'
        ],
        156,
        '2024-01-01 08:00:00+00'::timestamptz,
        '2024-01-01 08:00:00+00'::timestamptz
      ),
      (
        gen_random_uuid(),
        '猫咪疫苗接种时间表是什么？',
        '幼猫疫苗接种时间表如下：

**首次免疫（8-10周龄）**
- 猫三联疫苗（预防猫瘟、猫杯状病毒、猫鼻气管炎）

**第二次免疫（12-14周龄）**
- 猫三联疫苗加强
- 狂犬病疫苗

**第三次免疫（16-18周龄）**
- 猫三联疫苗再次加强

**成年猫维护**
- 每年接种一次猫三联疫苗
- 每年接种一次狂犬病疫苗

**注意事项：**
- 疫苗接种前需确保猫咪身体健康
- 接种后观察1-2天，注意有无不良反应
- 疫苗接种期间避免洗澡和外出',
        '健康护理',
        ARRAY['疫苗', '健康', '幼猫', '免疫'],
        ARRAY[
          'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
        ],
        89,
        '2024-01-05 09:15:00+00'::timestamptz,
        '2024-01-05 09:15:00+00'::timestamptz
      ),
      (
        gen_random_uuid(),
        '布偶猫的性格特点和饲养要点？',
        '**布偶猫性格特点：**

1. **温顺粘人**：布偶猫性格非常温和，喜欢跟随主人，被称为"小狗猫"。

2. **忍耐力强**：对疼痛的忍耐力很强，适合有小孩的家庭。

3. **安静优雅**：叫声轻柔，不会过度吵闹。

**饲养要点：**

1. **毛发护理**：每天需要梳毛，防止打结，定期洗澡。

2. **室内饲养**：布偶猫适合室内饲养，不建议散养。

3. **营养需求**：选择高质量猫粮，注意蛋白质含量。

4. **运动需求**：虽然性格温和，但也需要适量运动保持健康。

5. **定期体检**：注意心脏病等遗传疾病的预防。',
        '品种介绍',
        ARRAY['布偶猫', '性格', '饲养', '护理'],
        ARRAY[
          'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg',
          'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg'
        ],
        234,
        '2024-01-10 10:30:00+00'::timestamptz,
        '2024-01-10 10:30:00+00'::timestamptz
      ),
      (
        gen_random_uuid(),
        '猫咪日常饮食应该注意什么？',
        '**猫咪饮食基本原则：**

1. **高蛋白低碳水**：猫咪是肉食动物，需要高蛋白质的食物。

2. **定时定量**：建议一天2-3餐，避免自由采食导致肥胖。

3. **充足饮水**：保证新鲜饮水，可以使用流动水源。

**食物选择：**

- **主食**：优质猫粮为主，注意蛋白质含量≥30%
- **湿粮**：适量添加罐头或湿粮，增加水分摄入
- **零食**：控制在总热量的10%以内

**禁忌食物：**
- 巧克力、洋葱、大蒜
- 葡萄、牛奶（部分猫咪乳糖不耐受）
- 生鱼生肉（有寄生虫风险）

**特殊时期：**
- 幼猫：选择幼猫专用粮
- 老年猫：选择易消化的老年猫粮
- 怀孕母猫：增加营养密度',
        '饲养技巧',
        ARRAY['饮食', '营养', '猫粮', '健康'],
        ARRAY[]::text[],
        178,
        '2024-01-15 11:45:00+00'::timestamptz,
        '2024-01-15 11:45:00+00'::timestamptz
      ),
      (
        gen_random_uuid(),
        '如何训练猫咪使用猫砂盆？',
        '**猫砂盆训练步骤：**

1. **选择合适的猫砂盆**
   - 大小适中，猫咪能完全进入
   - 边缘不要太高，方便进出
   - 位置安静，远离食物和水

2. **选择合适的猫砂**
   - 无香型猫砂更受猫咪喜欢
   - 颗粒大小适中
   - 吸水性和除臭性要好

3. **训练方法**
   - 观察猫咪排便信号，及时引导到猫砂盆
   - 在猫砂盆中放少量猫咪的排泄物
   - 排便后及时清理，保持清洁

4. **注意事项**
   - 多猫家庭建议每只猫一个猫砂盆
   - 定期更换猫砂，保持卫生
   - 如果猫咪拒绝使用，检查是否有健康问题

**常见问题解决：**
- 乱拉乱尿：检查猫砂盆清洁度和位置
- 不埋便便：可能是猫砂不合适或学习不足',
        '饲养技巧',
        ARRAY['训练', '猫砂盆', '行为', '卫生'],
        ARRAY[]::text[],
        145,
        '2024-01-20 13:20:00+00'::timestamptz,
        '2024-01-20 13:20:00+00'::timestamptz
      ),
      (
        gen_random_uuid(),
        '猫咪生病的常见症状有哪些？',
        '**需要立即就医的紧急症状：**

1. **呼吸困难**：张口呼吸、呼吸急促
2. **持续呕吐**：特别是伴随腹泻
3. **无法排尿**：可能是尿路阻塞
4. **严重外伤**：出血、骨折等
5. **中毒症状**：流口水、抽搐、昏迷

**常见疾病症状：**

**消化系统：**
- 食欲不振、呕吐、腹泻
- 便秘、腹部胀大

**呼吸系统：**
- 咳嗽、打喷嚏、流鼻涕
- 呼吸声异常

**泌尿系统：**
- 频繁进出猫砂盆
- 尿液颜色异常、有血

**皮肤问题：**
- 过度舔毛、脱毛
- 皮肤红肿、有皮屑

**行为变化：**
- 精神萎靡、躲藏
- 攻击性增加或异常安静

**预防措施：**
- 定期体检和疫苗接种
- 保持环境清洁
- 提供均衡营养
- 观察日常行为变化',
        '健康护理',
        ARRAY['疾病', '症状', '健康', '预防'],
        ARRAY[]::text[],
        267,
        '2024-01-25 14:10:00+00'::timestamptz,
        '2024-01-25 14:10:00+00'::timestamptz
      );

END $$;