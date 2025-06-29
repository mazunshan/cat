import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { authenticateUser, getAllUsers, createUser, updateUserStatus, deleteUser } from '../lib/auth';
import { testConnection } from '../lib/database';

interface AuthContextType extends AuthState {
  login: (username: string, password: string, verificationCode?: string) => Promise<boolean>;
  logout: () => void;
  generateVerificationCode: () => string;
  loginStatus: 'idle' | 'loading' | 'success' | 'error';
  loginMessage: string;
  clearLoginMessage: () => void;
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  // 用户管理方法
  users: User[];
  addUser: (userData: { username: string; email: string; name: string; role: string; password: string }) => Promise<User>;
  toggleUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

interface SystemSettings {
  requireVerificationCode: boolean;
  currentVerificationCode: string;
  codeGeneratedAt: Date | null;
  codeValidUntil: Date | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 测试用户数据（用于开发模式）
const mockUsers: (User & { password: string })[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'admin',
    email: 'admin@catstore.com',
    role: 'admin',
    name: 'Administrator',
    isActive: true,
    createdAt: '2024-01-01',
    password: 'password123'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    username: 'sales1',
    email: 'sales1@catstore.com',
    role: 'sales',
    name: 'Alice Chen',
    isActive: true,
    createdAt: '2024-01-15',
    password: 'password123'
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    username: 'aftersales1',
    email: 'aftersales1@catstore.com',
    role: 'after_sales',
    name: 'David Zhang',
    isActive: true,
    createdAt: '2024-03-01',
    password: 'password123'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    verificationRequired: false
  });

  const [users, setUsers] = useState<User[]>([]);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    requireVerificationCode: true,
    currentVerificationCode: '',
    codeGeneratedAt: null,
    codeValidUntil: null
  });

  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [loginMessage, setLoginMessage] = useState<string>('');

  // 测试数据库连接
  useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        const connected = await testConnection();
        setIsDatabaseConnected(connected);
        
        if (connected) {
          // 如果数据库连接成功，加载用户数据
          await refreshUsers();
        } else {
          console.log('数据库连接失败，使用模拟数据');
          setUsers(mockUsers.map(({ password, ...user }) => user));
        }
      } catch (error) {
        console.error('数据库连接测试失败:', error);
        setIsDatabaseConnected(false);
        setUsers(mockUsers.map(({ password, ...user }) => user));
      }
    };

    checkDatabaseConnection();
  }, []);

  const logout = () => {
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
    
    console.log('验证码:', code);
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

      let user: User | null = null;

      if (isDatabaseConnected) {
        // 使用数据库认证
        user = await authenticateUser(username, password);
      } else {
        // 使用模拟数据认证
        const mockUser = mockUsers.find(u => u.username === username && u.isActive && u.password === password);
        if (mockUser) {
          const { password: _, ...userWithoutPassword } = mockUser;
          user = userWithoutPassword;
        }
      }

      if (!user) {
        setLoginStatus('error');
        setLoginMessage('用户名或密码错误');
        return false;
      }

      // 检查验证码（管理员不需要验证码）
      if (user.role !== 'admin' && systemSettings.requireVerificationCode) {
        if (!verificationCode) {
          setAuthState(prev => ({ ...prev, verificationRequired: true }));
          setLoginStatus('idle');
          setLoginMessage('');
          return false;
        }

        if (!isVerificationCodeValid(verificationCode)) {
          setLoginStatus('error');
          setLoginMessage('验证码错误或已过期');
          return false;
        }
      }

      // 登录成功
      setAuthState({
        user,
        isAuthenticated: true,
        verificationRequired: false
      });

      setLoginStatus('success');
      setLoginMessage(`欢迎，${user.name}！`);
      
      // 清除成功消息
      setTimeout(() => {
        setLoginStatus('idle');
        setLoginMessage('');
      }, 5000);

      return true;
    } catch (error) {
      console.error('登录错误:', error);
      setLoginStatus('error');
      setLoginMessage('登录过程中发生错误，请重试');
      return false;
    }
  };

  // 用户管理方法
  const refreshUsers = async () => {
    try {
      if (isDatabaseConnected) {
        const userList = await getAllUsers();
        setUsers(userList);
      } else {
        setUsers(mockUsers.map(({ password, ...user }) => user));
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  const addUser = async (userData: { username: string; email: string; name: string; role: string; password: string }): Promise<User> => {
    try {
      if (isDatabaseConnected) {
        const newUser = await createUser(userData);
        setUsers(prev => [newUser, ...prev]);
        return newUser;
      } else {
        // 模拟添加用户
        const newUser: User = {
          id: Date.now().toString(),
          username: userData.username,
          email: userData.email,
          name: userData.name,
          role: userData.role as any,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        setUsers(prev => [newUser, ...prev]);
        return newUser;
      }
    } catch (error) {
      console.error('添加用户失败:', error);
      throw error;
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
    try {
      if (isDatabaseConnected) {
        await updateUserStatus(userId, !isActive);
      }
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive: !isActive } : user
      ));
    } catch (error) {
      console.error('更新用户状态失败:', error);
      throw error;
    }
  };

  const removeUser = async (userId: string): Promise<void> => {
    try {
      if (isDatabaseConnected) {
        await deleteUser(userId);
      }
      
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('删除用户失败:', error);
      throw error;
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
      updateSystemSettings,
      users,
      addUser,
      toggleUserStatus,
      removeUser,
      refreshUsers
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