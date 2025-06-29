import { Pool } from 'pg';

// 数据库连接配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 31090,
  user: 'postgres',
  password: 'znq6nb5d',
  database: 'postgres',
  ssl: false, // 根据需要调整
  max: 20, // 连接池最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// 创建连接池
const pool = new Pool(dbConfig);

// 测试数据库连接
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ 数据库连接成功:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
};

// 执行查询
export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// 执行事务
export const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 关闭连接池
export const closePool = async () => {
  await pool.end();
};

export default pool;