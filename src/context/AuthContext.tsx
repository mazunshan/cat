import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, BusinessHours, Team } from '../types';
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
  // 团队管理
  teams: Team[];
  addTeam: (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Team>;
  updateTeam: (teamId: string, teamData: Partial<Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  removeTeam: (teamId: string) => Promise<void>;
  assignUserToTeam: (userId: string, teamId: string) => Promise<void>;
  // 营业时间设置
  businessHours: BusinessHours;
  updateBusinessHours: (hours: BusinessHours) => void;
}

interface SystemSettings {
  requireVerificationCode: boolean;
  currentVerificationCode: string;
  codeGeneratedAt: Date | null;
  codeValidUntil: Date | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 统一的用户数据（用于开发模式）
const mockUsers: (User & { password: string })[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'admin',
    email: 'admin@catstore.com',
    role: 'admin',
    name: 'Administrator',
    isActive: true,
    createdAt: '2024-01-01',
    password: 'password123',
    teamId: undefined
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    username: 'alice',
    email: 'alice@catstore.com',
    role: 'sales',
    name: 'Alice Chen',
    isActive: true,
    createdAt: '2024-01-15', 
    teamId: 'team-1',
    password: 'password123'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    username: 'bob',
    email: 'bob@catstore.com',
    role: 'sales',
    name: 'Bob Wang',
    isActive: true,
    createdAt: '2024-01-20', 
    teamId: 'team-1',
    password: 'password123'
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    username: 'carol',
    email: 'carol@catstore.com',
    role: 'sales',
    name: 'Carol Li',
    isActive: true,
    createdAt: '2024-02-01', 
    teamId: 'team-2',
    password: 'password123'
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    username: 'david',
    email: 'david@catstore.com',
    role: 'after_sales',
    name: 'David Zhang',
    isActive: true,
    createdAt: '2024-03-01',
    password: 'password123'
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    username: 'emma',
    email: 'emma@catstore.com',
    role: 'sales',
    name: 'Emma Liu',
    isActive: true,
    createdAt: '2024-02-15', 
    teamId: 'team-1',
    password: 'password123'
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    username: 'frank',
    email: 'frank@catstore.com',
    role: 'sales',
    name: 'Frank Zhou',
    isActive: true,
    createdAt: '2024-03-10', 
    teamId: 'team-2',
    password: 'password123'
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    username: 'grace',
    email: 'grace@catstore.com',
    role: 'sales',
    name: 'Grace Wu',
    isActive: true,
    createdAt: '2024-03-15', 
    teamId: 'team-2',
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
  const [teams, setTeams] = useState<Team[]>([
    {
      id: 'team-1',
      name: '销售一组',
      description: '负责线上销售和展会推广',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'team-2',
      name: '销售二组',
      description: '负责门店销售和VIP客户',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    requireVerificationCode: true,
    currentVerificationCode: '',
    codeGeneratedAt: null,
    codeValidUntil: null
  });

  // 默认营业时间设置
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    workStartTime: '09:00',
    workEndTime: '18:00',
    lateThreshold: 15, // 15分钟内算正常
    earlyLeaveThreshold: 30, // 提前30分钟内算正常
    workDays: [1, 2, 3, 4, 5] // 周一到周五
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

  const updateBusinessHours = (hours: BusinessHours) => {
    setBusinessHours(hours);
    // 这里可以添加保存到数据库的逻辑
    localStorage.setItem('businessHours', JSON.stringify(hours));
  };

  // 从本地存储加载营业时间设置
  useEffect(() => {
    const savedHours = localStorage.getItem('businessHours');
    if (savedHours) {
      try {
        setBusinessHours(JSON.parse(savedHours));
      } catch (error) {
        console.error('Failed to parse business hours from localStorage:', error);
      }
    }
  }, []);

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

  // 团队管理方法
  const addTeam = async (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> => {
    try {
      // 模拟添加团队
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        ...teamData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setTeams(prev => [...prev, newTeam]);
      return newTeam;
    } catch (error) {
      console.error('添加团队失败:', error);
      throw error;
    }
  };

  const updateTeam = async (teamId: string, teamData: Partial<Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    try {
      setTeams(prev => prev.map(team => 
        team.id === teamId 
          ? { 
              ...team, 
              ...teamData, 
              updatedAt: new Date().toISOString() 
            } 
          : team
      ));
    } catch (error) {
      console.error('更新团队失败:', error);
      throw error;
    }
  };

  const removeTeam = async (teamId: string): Promise<void> => {
    try {
      // 先将该团队的所有成员移出团队
      setUsers(prev => prev.map(user => 
        user.teamId === teamId ? { ...user, teamId: undefined } : user
      ));
      
      // 然后删除团队
      setTeams(prev => prev.filter(team => team.id !== teamId));
    } catch (error) {
      console.error('删除团队失败:', error);
      throw error;
    }
  };

  const assignUserToTeam = async (userId: string, teamId: string): Promise<void> => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, teamId } : user
    ));
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
      refreshUsers,
      teams,
      addTeam,
      updateTeam,
      removeTeam,
      assignUserToTeam,
      businessHours,
      updateBusinessHours
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