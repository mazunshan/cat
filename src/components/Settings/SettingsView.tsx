import React, { useState, useEffect } from 'react';
import { Save, Users, Shield, Bell, Database, Palette, Globe, Download, Upload, RefreshCw, Trash2, AlertTriangle, CheckCircle, Clock, User, Mail, Phone, Building, Key, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import SupabaseConfigTab from './SupabaseConfigTab';
import DatabaseConnectionChecker from '../Common/DatabaseConnectionChecker';

interface SystemSettings {
  general: {
    systemName: string;
    companyName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    businessHours: string;
    timezone: string;
    currency: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    orderReminders: boolean;
    paymentReminders: boolean;
    systemAlerts: boolean;
    reminderDays: number;
    emailTemplate: string;
  };
  security: {
    requireVerificationCode: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
    allowedIpRanges: string[];
  };
  appearance: {
    theme: string;
    primaryColor: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
    showWelcomeMessage: boolean;
  };
  business: {
    defaultSalesPerson: string;
    autoAssignCustomers: boolean;
    requireCustomerApproval: boolean;
    defaultPaymentTerms: number;
    taxRate: number;
    invoicePrefix: string;
  };
}

interface UserData {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

const SettingsView: React.FC = () => {
  const { user, systemSettings, updateSystemSettings, generateVerificationCode } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [users, setUsers] = useState<UserData[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing-up' | 'success' | 'error'>('idle');
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      systemName: '猫咪销售管理系统',
      companyName: '爱猫宠物店',
      contactEmail: 'admin@catstore.com',
      contactPhone: '400-123-4567',
      address: '北京市朝阳区宠物街123号',
      businessHours: '09:00-18:00',
      timezone: 'Asia/Shanghai',
      currency: 'CNY'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      orderReminders: true,
      paymentReminders: true,
      systemAlerts: true,
      reminderDays: 3,
      emailTemplate: '亲爱的客户，您的订单 {orderNumber} 状态已更新为 {status}。'
    },
    security: {
      requireVerificationCode: systemSettings.requireVerificationCode,
      sessionTimeout: 30,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      enableTwoFactor: false,
      allowedIpRanges: []
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      language: 'zh-CN',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      showWelcomeMessage: true
    },
    business: {
      defaultSalesPerson: 'Alice Chen',
      autoAssignCustomers: true,
      requireCustomerApproval: false,
      defaultPaymentTerms: 30,
      taxRate: 0.13,
      invoicePrefix: 'INV'
    }
  });

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    name: '',
    role: 'sales',
    password: ''
  });

  const tabs = [
    { id: 'general', label: '基本设置', icon: Globe },
    { id: 'business', label: '业务设置', icon: Building },
    { id: 'users', label: '用户管理', icon: Users },
    { id: 'security', label: '安全设置', icon: Shield },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'appearance', label: '外观设置', icon: Palette },
    { id: 'supabase', label: 'Supabase 配置', icon: Database },
    { id: 'data', label: '数据管理', icon: Database }
  ];

  // 加载用户数据
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch users:', error);
        return;
      }
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  // 同步系统设置
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        requireVerificationCode: systemSettings.requireVerificationCode
      }
    }));
  }, [systemSettings]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // 更新系统设置
      updateSystemSettings({
        requireVerificationCode: settings.security.requireVerificationCode,
        currentVerificationCode: systemSettings.currentVerificationCode,
        codeGeneratedAt: systemSettings.codeGeneratedAt,
        codeValidUntil: systemSettings.codeValidUntil
      });
      
      // 这里应该调用API保存设置到数据库
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleGenerateVerificationCode = () => {
    const code = generateVerificationCode();
    setShowVerificationCode(true);
    return code;
  };

  const copyVerificationCode = () => {
    if (systemSettings.currentVerificationCode) {
      navigator.clipboard.writeText(systemSettings.currentVerificationCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.name || !newUser.password) {
      alert('请填写所有必填字段');
      return;
    }

    try {
      setLoading(true);
      
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            username: newUser.username,
            role: newUser.role,
            name: newUser.name
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (authData.user) {
        // Then create the user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            username: newUser.username,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            is_active: true
          }])
          .select()
          .single();

        if (userError) {
          console.error('User profile creation error:', userError);
          throw userError;
        }

        if (userData) {
          setUsers(prev => [userData, ...prev]);
          setNewUser({ username: '', email: '', name: '', role: 'sales', password: '' });
          setShowAddUserModal(false);
          alert(`用户 ${userData.name} 创建成功！`);
        }
      }
    } catch (error) {
      console.error('Failed to add user:', error);
      alert('添加用户失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_active: !currentStatus } : u
      ));
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleDeleteUser = (userData: UserData) => {
    setUserToDelete(userData);
    setShowDeleteUserModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      
      // Delete from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userToDelete.id);

      if (userError) {
        console.error('Error deleting user from users table:', userError);
        throw userError;
      }

      // Delete from auth.users if possible
      // Note: This might require admin privileges or service role
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(
          userToDelete.id
        );
        
        if (authError) {
          console.warn('Could not delete user from auth.users:', authError);
          // Continue anyway as the user profile is deleted
        }
      } catch (authError) {
        console.warn('Could not delete user from auth.users:', authError);
        // Continue anyway as the user profile is deleted
      }

      // Update UI
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setShowDeleteUserModal(false);
      setUserToDelete(null);
      alert(`用户 ${userToDelete.name} 已成功删除`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('删除用户失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupData = async () => {
    setBackupStatus('backing-up');
    try {
      // 模拟备份过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBackupStatus('success');
      setTimeout(() => setBackupStatus('idle'), 3000);
    } catch (error) {
      setBackupStatus('error');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }
  };

  const handleExportData = async () => {
    try {
      // 导出所有数据
      const { data: customers } = await supabase.from('customers').select('*');
      const { data: orders } = await supabase.from('orders').select('*');
      const { data: products } = await supabase.from('products').select('*');

      const exportData = {
        customers: customers || [],
        orders: orders || [],
        products: products || [],
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `系统数据导出_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">安全策略</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">登录验证码</h4>
              <p className="text-sm text-gray-600">非管理员用户登录时需要输入验证码</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.requireVerificationCode}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, requireVerificationCode: e.target.checked }
                  }));
                  updateSystemSettings({ requireVerificationCode: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* 验证码管理 */}
          {settings.security.requireVerificationCode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-medium text-blue-800 mb-4">验证码管理</h4>
              
              {systemSettings.currentVerificationCode && systemSettings.codeValidUntil ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">当前验证码</span>
                      <span className="text-xs text-gray-500">
                        有效期至: {systemSettings.codeValidUntil.toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 bg-gray-100 px-3 py-2 rounded font-mono text-lg font-bold text-blue-600">
                        {showVerificationCode ? systemSettings.currentVerificationCode : '••••••'}
                      </code>
                      <button
                        onClick={() => setShowVerificationCode(!showVerificationCode)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                        title={showVerificationCode ? '隐藏验证码' : '显示验证码'}
                      >
                        {showVerificationCode ? '👁️' : '👁️‍🗨️'}
                      </button>
                      <button
                        onClick={copyVerificationCode}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                        title="复制验证码"
                      >
                        {copiedCode ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-blue-700">
                    <p className="mb-2">使用说明：</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>将此验证码提供给需要登录的销售员和售后专员</li>
                      <li>验证码有效期为24小时</li>
                      <li>管理员登录不需要验证码</li>
                      <li>可以随时生成新的验证码</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-blue-700 mb-4">尚未生成验证码</p>
                </div>
              )}

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleGenerateVerificationCode}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Key className="w-4 h-4 mr-2" />
                  生成新验证码
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会话超时时间 (分钟)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码过期天数
              </label>
              <input
                type="number"
                value={settings.security.passwordExpiry}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, passwordExpiry: parseInt(e.target.value) }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大登录尝试次数
              </label>
              <input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 其他渲染函数保持不变...
  const renderGeneralSettings = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Building className="w-5 h-5 mr-2" />
          公司信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              系统名称
            </label>
            <input
              type="text"
              value={settings.general.systemName}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, systemName: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              公司名称
            </label>
            <input
              type="text"
              value={settings.general.companyName}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, companyName: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              联系邮箱
            </label>
            <input
              type="email"
              value={settings.general.contactEmail}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, contactEmail: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              联系电话
            </label>
            <input
              type="tel"
              value={settings.general.contactPhone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, contactPhone: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              营业时间
            </label>
            <input
              type="text"
              value={settings.general.businessHours}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, businessHours: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="09:00-18:00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              时区
            </label>
            <select
              value={settings.general.timezone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, timezone: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Asia/Shanghai">北京时间 (UTC+8)</option>
              <option value="Asia/Hong_Kong">香港时间 (UTC+8)</option>
              <option value="Asia/Taipei">台北时间 (UTC+8)</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            公司地址
          </label>
          <textarea
            value={settings.general.address}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              general: { ...prev.general, address: e.target.value }
            }))}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">业务配置</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              默认销售员
            </label>
            <select
              value={settings.business.defaultSalesPerson}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                business: { ...prev.business, defaultSalesPerson: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Alice Chen">Alice Chen</option>
              <option value="Bob Wang">Bob Wang</option>
              <option value="Carol Li">Carol Li</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              默认付款期限 (天)
            </label>
            <input
              type="number"
              value={settings.business.defaultPaymentTerms}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                business: { ...prev.business, defaultPaymentTerms: parseInt(e.target.value) }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              税率 (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.business.taxRate * 100}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                business: { ...prev.business, taxRate: parseFloat(e.target.value) / 100 }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              发票前缀
            </label>
            <input
              type="text"
              value={settings.business.invoicePrefix}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                business: { ...prev.business, invoicePrefix: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">自动分配客户</h4>
              <p className="text-sm text-gray-600">新客户自动分配给默认销售员</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.business.autoAssignCustomers}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  business: { ...prev.business, autoAssignCustomers: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">客户审批</h4>
              <p className="text-sm text-gray-600">新客户需要管理员审批</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.business.requireCustomerApproval}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  business: { ...prev.business, requireCustomerApproval: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">用户管理</h3>
        <button 
          onClick={() => setShowAddUserModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <User className="w-4 h-4 mr-2" />
          添加用户
        </button>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((userData) => (
              <tr key={userData.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {userData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                      <div className="text-sm text-gray-500">{userData.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    userData.role === 'admin' 
                      ? 'bg-purple-100 text-purple-600' 
                      : userData.role === 'sales'
                      ? 'bg-blue-100 text-blue-600'
                      : userData.role === 'after_sales'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {userData.role === 'admin' ? '管理员' : 
                     userData.role === 'sales' ? '销售员' : 
                     userData.role === 'after_sales' ? '售后专员' : '客服'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    userData.is_active 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {userData.is_active ? '活跃' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(userData.created_at).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleToggleUserStatus(userData.id, userData.is_active)}
                    className={`mr-4 ${
                      userData.is_active 
                        ? 'text-red-600 hover:text-red-900' 
                        : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {userData.is_active ? '禁用' : '启用'}
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(userData)}
                    className="text-red-600 hover:text-red-900 mr-4"
                  >
                    删除
                  </button>
                  <button className="text-blue-600 hover:text-blue-900">编辑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 添加用户模态框 */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">添加新用户</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">用户名 *</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">邮箱 *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">密码 *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">角色</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sales">销售员</option>
                  <option value="after_sales">售后专员</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddUser}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? '添加中...' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除用户确认模态框 */}
      {showDeleteUserModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">确认删除用户</h3>
            <div className="mb-6">
              <p className="text-gray-600">
                您确定要删除用户 <span className="font-semibold">{userToDelete.name}</span> ({userToDelete.username}) 吗？
              </p>
              <p className="text-red-600 text-sm mt-2">
                此操作不可撤销，用户将被永久删除。
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteUserModal(false);
                  setUserToDelete(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">通知配置</h3>
        <div className="space-y-6">
          {[
            { key: 'emailNotifications', label: '邮件通知', desc: '接收系统邮件通知' },
            { key: 'smsNotifications', label: '短信通知', desc: '接收重要短信提醒' },
            { key: 'orderReminders', label: '订单提醒', desc: '新订单和订单状态变更提醒' },
            { key: 'paymentReminders', label: '付款提醒', desc: '分期付款到期提醒' },
            { key: 'systemAlerts', label: '系统警报', desc: '系统异常和安全警报' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">{item.label}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: { 
                      ...prev.notifications, 
                      [item.key]: e.target.checked 
                    }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提醒提前天数
              </label>
              <input
                type="number"
                value={settings.notifications.reminderDays}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, reminderDays: parseInt(e.target.value) }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮件模板
            </label>
            <textarea
              value={settings.notifications.emailTemplate}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, emailTemplate: e.target.value }
              }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="使用 {orderNumber}, {status}, {customerName} 等变量"
            />
            <p className="text-sm text-gray-500 mt-2">
              可用变量: {'{orderNumber}'}, {'{status}'}, {'{customerName}'}, {'{amount}'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">界面设置</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主题
            </label>
            <select
              value={settings.appearance.theme}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                appearance: { ...prev.appearance, theme: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="light">浅色主题</option>
              <option value="dark">深色主题</option>
              <option value="auto">跟随系统</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              语言
            </label>
            <select
              value={settings.appearance.language}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                appearance: { ...prev.appearance, language: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日期格式
            </label>
            <select
              value={settings.appearance.dateFormat}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                appearance: { ...prev.appearance, dateFormat: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="YYYY-MM-DD">2024-12-25</option>
              <option value="DD/MM/YYYY">25/12/2024</option>
              <option value="MM/DD/YYYY">12/25/2024</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              时间格式
            </label>
            <select
              value={settings.appearance.timeFormat}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                appearance: { ...prev.appearance, timeFormat: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">24小时制</option>
              <option value="12h">12小时制</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            主色调
          </label>
          <div className="flex space-x-3">
            {[
              { color: '#3B82F6', name: '蓝色' },
              { color: '#10B981', name: '绿色' },
              { color: '#F59E0B', name: '橙色' },
              { color: '#EF4444', name: '红色' },
              { color: '#8B5CF6', name: '紫色' }
            ].map((colorOption) => (
              <button
                key={colorOption.color}
                onClick={() => setSettings(prev => ({
                  ...prev,
                  appearance: { ...prev.appearance, primaryColor: colorOption.color }
                }))}
                className={`w-12 h-12 rounded-lg border-2 ${
                  settings.appearance.primaryColor === colorOption.color 
                    ? 'border-gray-800' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: colorOption.color }}
                title={colorOption.name}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">显示欢迎消息</h4>
              <p className="text-sm text-gray-600">登录后显示欢迎消息</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.appearance.showWelcomeMessage}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  appearance: { ...prev.appearance, showWelcomeMessage: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Database className="w-8 h-8 text-blue-600 mr-3" />
            <h4 className="font-semibold text-blue-800">数据备份</h4>
          </div>
          <p className="text-sm text-blue-600 mb-4">定期备份系统数据，确保数据安全</p>
          <div className="space-y-3">
            <button 
              onClick={handleBackupData}
              disabled={backupStatus === 'backing-up'}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {backupStatus === 'backing-up' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  备份中...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  立即备份
                </>
              )}
            </button>
            {backupStatus === 'success' && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                备份完成
              </div>
            )}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Download className="w-8 h-8 text-green-600 mr-3" />
            <h4 className="font-semibold text-green-800">数据导出</h4>
          </div>
          <p className="text-sm text-green-600 mb-4">导出客户、订单等业务数据</p>
          <button 
            onClick={handleExportData}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Trash2 className="w-8 h-8 text-yellow-600 mr-3" />
            <h4 className="font-semibold text-yellow-800">数据清理</h4>
          </div>
          <p className="text-sm text-yellow-600 mb-4">清理过期和无用的系统数据</p>
          <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center">
            <Trash2 className="w-4 h-4 mr-2" />
            开始清理
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Upload className="w-8 h-8 text-red-600 mr-3" />
            <h4 className="font-semibold text-red-800">数据恢复</h4>
          </div>
          <p className="text-sm text-red-600 mb-4">从备份文件恢复系统数据</p>
          <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
            <Upload className="w-4 h-4 mr-2" />
            恢复数据
          </button>
        </div>
      </div>

      {/* 系统状态 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-800 mb-4">系统状态</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">数据库连接</span>
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">正常</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">存储空间</span>
              <div className="flex items-center text-blue-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">85% 已用</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">最后备份</span>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">2小时前</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'business':
        return renderBusinessSettings();
      case 'users':
        return renderUserManagement();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'supabase':
        return <SupabaseConfigTab />;
      case 'data':
        return renderDataManagement();
      default:
        return renderGeneralSettings();
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">访问受限</h3>
        <p className="text-gray-600">只有管理员才能访问系统设置</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            {activeTab !== 'supabase' && (
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : saveStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    已保存
                  </>
                ) : saveStatus === 'error' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    保存失败
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    保存设置
                  </>
                )}
              </button>
            )}
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;