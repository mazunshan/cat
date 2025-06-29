import { query } from './database';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'sales' | 'after_sales';
  name: string;
  is_active: boolean;
  created_at: string;
}

// 用户认证
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return null;
    }

    // 返回用户信息（不包含密码）
    const { password_hash, ...userInfo } = user;
    return userInfo;
  } catch (error) {
    console.error('用户认证失败:', error);
    return null;
  }
};

// 创建用户
export const createUser = async (userData: {
  username: string;
  email: string;
  name: string;
  role: string;
  password: string;
}): Promise<User> => {
  const { username, email, name, role, password } = userData;
  
  // 加密密码
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const result = await query(
    `INSERT INTO users (username, email, name, role, password_hash, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
     RETURNING id, username, email, name, role, is_active, created_at`,
    [username, email, name, role, passwordHash]
  );

  return result.rows[0];
};

// 获取所有用户
export const getAllUsers = async (): Promise<User[]> => {
  const result = await query(
    'SELECT id, username, email, name, role, is_active, created_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
};

// 更新用户状态
export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  await query(
    'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2',
    [isActive, userId]
  );
};

// 删除用户
export const deleteUser = async (userId: string): Promise<void> => {
  await query('DELETE FROM users WHERE id = $1', [userId]);
};