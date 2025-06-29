// Supabase database client - browser-compatible
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
const isValidSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseKey) {
    return false;
  }
  
  // Check if still using placeholder values
  if (supabaseUrl.includes('your-actual-project-ref') || 
      supabaseKey.includes('your-actual-anon-key')) {
    return false;
  }
  
  // Basic URL validation
  try {
    new URL(supabaseUrl);
    return true;
  } catch {
    return false;
  }
};

// Initialize Supabase client only if config is valid
export const supabase = isValidSupabaseConfig() 
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    if (!supabase) {
      console.error('❌ Supabase配置无效: 请在.env文件中设置正确的VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY');
      return false;
    }

    // Test connection with a simple query
    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('❌ 数据库连接失败:', error.message);
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