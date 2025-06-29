// 数据库连接配置 - 支持外部 PostgreSQL 数据库
import { Pool } from 'pg';

// 数据库连接池配置
const pool = new Pool({
  host: 'dbconn.sealoshzh.site',
  port: 31090,
  user: 'postgres',
  password: 'znq6nb5d',
  database: 'postgres',
  ssl: false, // 根据您的数据库配置调整
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 测试数据库连接
export const testConnection = async (): Promise<boolean> => {
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
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('🔍 执行查询:', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('❌ 查询执行失败:', error);
    throw error;
  }
};

// 事务处理
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