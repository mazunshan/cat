// Supabase 配置检查工具
export interface SupabaseConfigStatus {
  isConfigured: boolean;
  isDevelopmentMode: boolean;
  hasValidUrl: boolean;
  hasValidKey: boolean;
  configurationIssues: string[];
  recommendations: string[];
}

export const checkSupabaseConfiguration = (): SupabaseConfigStatus => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const status: SupabaseConfigStatus = {
    isConfigured: false,
    isDevelopmentMode: false,
    hasValidUrl: false,
    hasValidKey: false,
    configurationIssues: [],
    recommendations: []
  };

  // 检查环境变量是否存在
  if (!supabaseUrl) {
    status.configurationIssues.push('VITE_SUPABASE_URL 环境变量未设置');
  }

  if (!supabaseAnonKey) {
    status.configurationIssues.push('VITE_SUPABASE_ANON_KEY 环境变量未设置');
  }

  // 检查是否是占位符值
  const hasPlaceholderValues = 
    !supabaseUrl || 
    !supabaseAnonKey || 
    supabaseUrl.includes('your-project-ref') || 
    supabaseAnonKey.includes('your-anon-key-here') ||
    supabaseUrl === 'https://demo.supabase.co' ||
    supabaseAnonKey === 'demo-anon-key' ||
    supabaseUrl === 'https://your-project.supabase.co' ||
    supabaseAnonKey === 'your-anon-key';

  if (hasPlaceholderValues) {
    status.isDevelopmentMode = true;
    status.configurationIssues.push('使用的是占位符配置值，非真实的 Supabase 配置');
  }

  // 验证 URL 格式
  if (supabaseUrl) {
    if (supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co') && supabaseUrl.length > 30) {
      status.hasValidUrl = true;
    } else if (!hasPlaceholderValues) {
      status.configurationIssues.push('Supabase URL 格式不正确，应该类似: https://your-project-ref.supabase.co');
    }
  }

  // 验证 Anon Key 格式
  if (supabaseAnonKey) {
    if (supabaseAnonKey.length > 100 && supabaseAnonKey.startsWith('eyJ')) {
      status.hasValidKey = true;
    } else if (!hasPlaceholderValues) {
      status.configurationIssues.push('Supabase Anon Key 格式不正确，应该是一个长的 JWT token');
    }
  }

  // 判断是否已正确配置
  status.isConfigured = status.hasValidUrl && status.hasValidKey && !status.isDevelopmentMode;

  // 生成建议
  if (status.isDevelopmentMode) {
    status.recommendations.push('点击右上角的 "Connect to Supabase" 按钮来配置真实的数据库连接');
    status.recommendations.push('或者手动在 .env 文件中设置正确的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
  }

  if (!status.hasValidUrl && supabaseUrl && !hasPlaceholderValues) {
    status.recommendations.push('检查 VITE_SUPABASE_URL 格式，应该类似: https://abcdefghijklmnop.supabase.co');
  }

  if (!status.hasValidKey && supabaseAnonKey && !hasPlaceholderValues) {
    status.recommendations.push('检查 VITE_SUPABASE_ANON_KEY 是否是完整的 JWT token');
  }

  if (status.configurationIssues.length === 0 && status.isConfigured) {
    status.recommendations.push('Supabase 配置看起来正确！');
  }

  return status;
};

// 获取当前配置信息（用于调试）
export const getCurrentConfig = () => {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '未设置',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 
      `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
      '未设置',
    mode: import.meta.env.MODE || 'development',
    isDev: import.meta.env.DEV
  };
};