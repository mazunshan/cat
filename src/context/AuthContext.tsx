import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string, verificationCode?: string) => Promise<boolean>;
  logout: () => void;
  generateVerificationCode: () => string;
  loginStatus: 'idle' | 'loading' | 'success' | 'error';
  loginMessage: string;
  clearLoginMessage: () => void;
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
}

interface SystemSettings {
  requireVerificationCode: boolean;
  currentVerificationCode: string;
  codeGeneratedAt: Date | null;
  codeValidUntil: Date | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 更新的测试用户数据 - 与数据库中的数据保持一致
const mockUsers: User[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'admin',
    email: 'admin@catstore.com',
    role: 'admin',
    name: 'Administrator',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    username: 'sales1',
    email: 'sales1@catstore.com',
    role: 'sales',
    name: 'Alice Chen',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    username: 'sales2',
    email: 'sales2@catstore.com',
    role: 'sales',
    name: 'Bob Wang',
    isActive: true,
    createdAt: '2024-02-01'
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    username: 'sales3',
    email: 'sales3@catstore.com',
    role: 'sales',
    name: 'Carol Li',
    isActive: true,
    createdAt: '2024-02-15'
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    username: 'aftersales1',
    email: 'aftersales1@catstore.com',
    role: 'after_sales',
    name: 'David Zhang',
    isActive: true,
    createdAt: '2024-03-01'
  }
];

// Check if we're in development mode (Supabase not configured)
const isDevelopmentMode = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return !supabaseUrl || 
         !supabaseAnonKey || 
         supabaseUrl.includes('your-project-ref') || 
         supabaseAnonKey.includes('your-anon-key-here') ||
         supabaseUrl === 'https://demo.supabase.co' ||
         supabaseAnonKey === 'demo-anon-key';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    verificationRequired: false
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    requireVerificationCode: true,
    currentVerificationCode: '',
    codeGeneratedAt: null,
    codeValidUntil: null
  });

  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [loginMessage, setLoginMessage] = useState<string>('');

  // Define logout function at the top level
  const logout = async () => {
    try {
      if (!isDevelopmentMode()) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    setAuthState({
      user: null,
      isAuthenticated: false,
      verificationRequired: false
    });
    setLoginStatus('idle');
    setLoginMessage('');
  };

  const clearLoginMessage = () => {
    setLoginStatus('idle');
    setLoginMessage('');
  };

  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...newSettings }));
  };

  useEffect(() => {
    // If in development mode, skip Supabase initialization
    if (isDevelopmentMode()) {
      console.log('Development mode - Supabase auth disabled');
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        // Check if it's a connection error
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          setLoginStatus('error');
          setLoginMessage('无法连接到服务器，请检查网络连接或联系管理员');
        } else {
          logout();
        }
        return;
      }
      
      if (session?.user) {
        loadUserProfile(session.user.id, false); // false = not from login
      } else {
        // No session, ensure we're logged out
        logout();
      }
    }).catch((error) => {
      console.error('Error getting session:', error);
      setLoginStatus('error');
      setLoginMessage('无法连接到服务器，请检查网络连接或联系管理员');
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (session?.user) {
          // Only show success message for actual sign-in events
          const shouldShowSuccess = event === 'SIGNED_IN';
          loadUserProfile(session.user.id, shouldShowSuccess);
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            verificationRequired: false
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string, showSuccessMessage: boolean = false) => {
    try {
      const { data: userProfiles, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading user profile:', error);
        
        // Check for connection errors
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          setLoginStatus('error');
          setLoginMessage('无法连接到数据库，请检查网络连接或联系管理员');
          return;
        }
        
        // Check for JWT-related errors that indicate invalid session
        if (error.message.includes('JWT') || 
            error.message.includes('invalid') || 
            error.message.includes('expired') ||
            error.message.includes('user_not_found')) {
          console.log('Invalid session detected, logging out...');
          logout();
          return;
        }
        return;
      }

      const userProfile = userProfiles && userProfiles.length > 0 ? userProfiles[0] : null;

      if (userProfile) {
        const user: User = {
          id: userProfile.id,
          username: userProfile.username,
          email: userProfile.email,
          role: userProfile.role,
          name: userProfile.name,
          isActive: userProfile.is_active,
          createdAt: userProfile.created_at
        };

        setAuthState({
          user,
          isAuthenticated: true,
          verificationRequired: false
        });

        // Show success message if this is from a login action
        if (showSuccessMessage) {
          setLoginStatus('success');
          setLoginMessage(`欢迎，${user.name}！`);
          
          // Clear success message after 5 seconds
          setTimeout(() => {
            setLoginStatus('idle');
            setLoginMessage('');
          }, 5000);
        }
      } else {
        // Profile doesn't exist, create it from auth user metadata
        const { data: { user: authUser }, error: getUserError } = await supabase.auth.getUser();
        
        if (getUserError) {
          console.error('Error getting auth user:', getUserError);
          
          // Check for connection errors
          if (getUserError.message.includes('Failed to fetch') || getUserError.message.includes('NetworkError')) {
            setLoginStatus('error');
            setLoginMessage('无法连接到服务器，请检查网络连接或联系管理员');
            return;
          }
          
          // Check for JWT-related errors
          if (getUserError.message.includes('JWT') || 
              getUserError.message.includes('invalid') || 
              getUserError.message.includes('expired') ||
              getUserError.message.includes('user_not_found')) {
            console.log('Invalid session detected, logging out...');
            logout();
            return;
          }
        }
        
        if (authUser) {
          await createUserProfile(authUser, showSuccessMessage);
        } else {
          // No auth user, logout
          logout();
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      
      // Check if it's a network or auth-related error
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          setLoginStatus('error');
          setLoginMessage('无法连接到数据库，请检查网络连接或联系管理员');
          return;
        }
        
        if (error.message.includes('JWT') || 
            error.message.includes('invalid') || 
            error.message.includes('expired') ||
            error.message.includes('user_not_found')) {
          console.log('Invalid session detected, logging out...');
          logout();
          return;
        }
      }
    }
  };

  const createUserProfile = async (authUser: SupabaseUser, showSuccessMessage: boolean = false) => {
    try {
      // Get user metadata from auth user
      const metadata = authUser.user_metadata || {};
      const username = metadata.username || authUser.email?.split('@')[0] || '';
      const role = metadata.role || 'sales';
      const name = metadata.name || username;
      
      // First, check if a user with this email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email || '')
        .order('created_at', { ascending: false })
        .limit(1);

      if (checkError) {
        console.error('Error checking existing user:', checkError);
        
        // Check for connection errors
        if (checkError.message.includes('Failed to fetch') || checkError.message.includes('NetworkError')) {
          setLoginStatus('error');
          setLoginMessage('无法连接到数据库，请检查网络连接或联系管理员');
          return;
        }
        
        // Check for JWT-related errors
        if (checkError.message.includes('JWT') || 
            checkError.message.includes('invalid') || 
            checkError.message.includes('expired') ||
            checkError.message.includes('user_not_found')) {
          console.log('Invalid session detected, logging out...');
          logout();
          return;
        }
        return;
      }

      const existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;
      let userProfile;
      
      if (existingUser) {
        // Update existing user profile with new auth ID
        const { data: updatedProfiles, error: updateError } = await supabase
          .from('users')
          .update({
            id: authUser.id,
            is_active: true
          })
          .eq('email', authUser.email || '')
          .select()
          .order('updated_at', { ascending: false })
          .limit(1);

        if (updateError) {
          console.error('Error updating existing user profile:', updateError);
          
          // Check for connection errors
          if (updateError.message.includes('Failed to fetch') || updateError.message.includes('NetworkError')) {
            setLoginStatus('error');
            setLoginMessage('无法连接到数据库，请检查网络连接或联系管理员');
            return;
          }
          
          // Check for JWT-related errors
          if (updateError.message.includes('JWT') || 
              updateError.message.includes('invalid') || 
              updateError.message.includes('expired') ||
              updateError.message.includes('user_not_found')) {
            console.log('Invalid session detected, logging out...');
            logout();
            return;
          }
          return;
        }
        
        userProfile = (updatedProfiles && updatedProfiles.length > 0) ? updatedProfiles[0] : existingUser;
      } else {
        // Create new user profile
        const { data: newProfiles, error: insertError } = await supabase
          .from('users')
          .insert([{
            id: authUser.id,
            username: username,
            email: authUser.email,
            role: role,
            name: name,
            is_active: true
          }])
          .select()
          .order('created_at', { ascending: false })
          .limit(1);

        if (insertError) {
          console.error('Error creating new user profile:', insertError);
          
          // Check for connection errors
          if (insertError.message.includes('Failed to fetch') || insertError.message.includes('NetworkError')) {
            setLoginStatus('error');
            setLoginMessage('无法连接到数据库，请检查网络连接或联系管理员');
            return;
          }
          
          // Check for JWT-related errors
          if (insertError.message.includes('JWT') || 
              insertError.message.includes('invalid') || 
              insertError.message.includes('expired') ||
              insertError.message.includes('user_not_found')) {
            console.log('Invalid session detected, logging out...');
            logout();
            return;
          }
          return;
        }
        
        userProfile = newProfiles && newProfiles.length > 0 ? newProfiles[0] : null;
      }

      if (userProfile) {
        const user: User = {
          id: userProfile.id,
          username: userProfile.username,
          email: userProfile.email,
          role: userProfile.role,
          name: userProfile.name,
          isActive: userProfile.is_active,
          createdAt: userProfile.created_at
        };

        setAuthState({
          user,
          isAuthenticated: true,
          verificationRequired: false
        });

        // Show success message if this is from a login action
        if (showSuccessMessage) {
          setLoginStatus('success');
          setLoginMessage(`欢迎，${user.name}！`);
          
          // Clear success message after 5 seconds
          setTimeout(() => {
            setLoginStatus('idle');
            setLoginMessage('');
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      
      // Check if it's a network or auth-related error
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          setLoginStatus('error');
          setLoginMessage('无法连接到数据库，请检查网络连接或联系管理员');
          return;
        }
        
        if (error.message.includes('JWT') || 
            error.message.includes('invalid') || 
            error.message.includes('expired') ||
            error.message.includes('user_not_found')) {
          console.log('Invalid session detected, logging out...');
          logout();
          return;
        }
      }
    }
  };

  const generateVerificationCode = (): string => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const now = new Date();
    const validUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24小时有效期
    
    setSystemSettings(prev => ({
      ...prev,
      currentVerificationCode: code,
      codeGeneratedAt: now,
      codeValidUntil: validUntil
    }));
    
    // In real implementation, this would be sent via SMS/email
    console.log('Verification Code:', code);
    return code;
  };

  const isVerificationCodeValid = (code: string): boolean => {
    if (!systemSettings.currentVerificationCode || !systemSettings.codeValidUntil) {
      return false;
    }
    
    const now = new Date();
    return code === systemSettings.currentVerificationCode && now <= systemSettings.codeValidUntil;
  };

  const login = async (username: string, password: string, verificationCode?: string): Promise<boolean> => {
    try {
      setLoginStatus('loading');
      setLoginMessage('正在登录...');

      // 检查是否是开发模式（Supabase 未配置）
      if (isDevelopmentMode()) {
        console.log('Development mode - simulating login');
        
        // 查找用户
        const user = mockUsers.find(u => u.username === username && u.isActive);
        if (!user) {
          console.error('User not found or inactive:', username);
          setLoginStatus('error');
          setLoginMessage(`用户名 "${username}" 不存在。请使用有效的测试账户：admin, sales1, sales2, sales3, aftersales1`);
          return false;
        }

        // 检查验证码
        if (user.role !== 'admin' && systemSettings.requireVerificationCode) {
          if (!verificationCode) {
            setAuthState(prev => ({ ...prev, verificationRequired: true }));
            setLoginStatus('idle');
            setLoginMessage('');
            return false;
          }

          if (!isVerificationCodeValid(verificationCode)) {
            console.error('Invalid or expired verification code');
            setLoginStatus('error');
            setLoginMessage('验证码错误或已过期');
            return false;
          }
        }

        // 模拟登录成功
        setAuthState({
          user,
          isAuthenticated: true,
          verificationRequired: false
        });

        setLoginStatus('success');
        setLoginMessage(`欢迎，${user.name}！`);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setLoginStatus('idle');
          setLoginMessage('');
        }, 5000);

        return true;
      }

      // 查询用户信息
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (userError || !userData) {
        console.error('User not found or inactive:', username);
        setLoginStatus('error');
        setLoginMessage(`用户名 "${username}" 不存在或已被禁用。请使用有效的账户。`);
        return false;
      }

      // 检查验证码
      if (userData.role !== 'admin' && systemSettings.requireVerificationCode) {
        if (!verificationCode) {
          setAuthState(prev => ({ ...prev, verificationRequired: true }));
          setLoginStatus('idle');
          setLoginMessage('');
          return false;
        }

        if (!isVerificationCodeValid(verificationCode)) {
          console.error('Invalid or expired verification code');
          setLoginStatus('error');
          setLoginMessage('验证码错误或已过期');
          return false;
        }
      }

      // 尝试登录
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password
      });

      if (error) {
        console.error('Login error:', error);
        setLoginStatus('error');
        setLoginMessage('登录失败，请检查密码是否正确');
        return false;
      }

      // 登录成功，用户信息会通过 onAuthStateChange 加载
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if it's a network error
      if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        setLoginStatus('error');
        setLoginMessage('无法连接到服务器，请检查网络连接或联系管理员');
      } else {
        setLoginStatus('error');
        setLoginMessage('登录过程中发生错误，请重试');
      }
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      generateVerificationCode,
      loginStatus,
      loginMessage,
      clearLoginMessage,
      systemSettings,
      updateSystemSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};