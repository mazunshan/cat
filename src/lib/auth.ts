// 用户认证模块 - 支持真实数据库操作
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
    const { password_hash, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      is_active: user.is_active
    };
  } catch (error) {
    console.error('用户认证失败:', error);
    throw new Error('认证过程中发生错误');
  }
};

// 创建新用户
export const createUser = async (userData: {
  username: string;
  email: string;
  name: string;
  role: string;
  password: string;
}): Promise<User> => {
  try {
    // 检查用户名是否已存在
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [userData.username, userData.email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('用户名或邮箱已存在');
    }

    // 加密密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // 插入新用户
    const result = await query(
      `INSERT INTO users (username, email, name, role, password_hash, is_active) 
       VALUES ($1, $2, $3, $4, $5, true) 
       RETURNING id, username, email, name, role, is_active, created_at`,
      [userData.username, userData.email, userData.name, userData.role, passwordHash]
    );

    return result.rows[0];
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
};

// 获取所有用户
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const result = await query(
      'SELECT id, username, email, name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw new Error('获取用户列表失败');
  }
};

// 更新用户状态
export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  try {
    await query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2',
      [isActive, userId]
    );
  } catch (error) {
    console.error('更新用户状态失败:', error);
    throw new Error('更新用户状态失败');
  }
};

// 删除用户
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // 检查是否为管理员
    const userResult = await query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length > 0 && userResult.rows[0].role === 'admin') {
      throw new Error('不能删除管理员账户');
    }

    await query('DELETE FROM users WHERE id = $1', [userId]);
  } catch (error) {
    console.error('删除用户失败:', error);
    throw error;
  }
};