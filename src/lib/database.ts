// Supabase database client - browser-compatible
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ 数据库连接失败:', error);
      return false;
    }
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
};

// Generic query function for backward compatibility
export const query = async (text: string, params?: any[]) => {
  console.warn('Direct SQL queries are not supported with Supabase client. Use Supabase methods instead.');
  throw new Error('Direct SQL queries not supported. Use Supabase client methods.');
};

// Transaction handling (simplified for Supabase)
export const transaction = async (callback: (client: any) => Promise<any>) => {
  console.warn('Transactions should be handled using Supabase RPC functions or edge functions.');
  throw new Error('Transactions not supported in browser environment. Use Supabase RPC functions.');
};

export default supabase;