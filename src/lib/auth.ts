// User authentication module - Supabase compatible
import { supabase } from './database';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'sales' | 'after_sales';
  name: string;
  isActive: boolean;
  createdAt: string;
}

// User authentication using Supabase
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // First, get user by username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      console.error('User not found:', userError);
      return null;
    }

    // For now, we'll do a simple password comparison
    // In production, you should use Supabase Auth or proper password hashing
    if (userData.password_hash !== password) {
      return null;
    }

    // Return user info (without password)
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      isActive: userData.is_active,
      createdAt: userData.created_at
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('认证过程中发生错误');
  }
};

// Create new user
export const createUser = async (userData: {
  username: string;
  email: string;
  name: string;
  role: string;
  password: string;
}): Promise<User> => {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${userData.username},email.eq.${userData.email}`)
      .single();

    if (existingUser) {
      throw new Error('用户名或邮箱已存在');
    }

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: userData.username,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        password_hash: userData.password, // In production, hash this properly
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      username: data.username,
      email: data.email,
      name: data.name,
      role: data.role,
      isActive: data.is_active,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, name, role, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at
    }));
  } catch (error) {
    console.error('Get users error:', error);
    throw new Error('获取用户列表失败');
  }
};

// Update user status
export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Update user status error:', error);
    throw new Error('更新用户状态失败');
  }
};

// Delete user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (user?.role === 'admin') {
      throw new Error('不能删除管理员账户');
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};