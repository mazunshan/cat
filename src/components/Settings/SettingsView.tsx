import React, { useState, useEffect } from 'react';
import { Save, Users, Shield, Bell, Globe, RefreshCw, Trash2, AlertTriangle, CheckCircle, User, Key, Copy, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BusinessHours } from '../../types';
import { getWorkDayNames, formatTimeRange } from '../../utils/attendanceUtils';

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
  };
}

interface UserData {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const SettingsView: React.FC = () => {
  const { 
    user, 
    systemSettings, 
    updateSystemSettings, 
    generateVerificationCode,
    users,
    addUser,
    toggleUserStatus,
    removeUser,
    refreshUsers,
    businessHours,
    updateBusinessHours
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
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
      enableTwoFactor: false
    }
  });

  // 营业时间设置状态
  const [tempBusinessHours, setTempBusinessHours] = useState<BusinessHours>(businessHours);

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    name: '',
    role: 'sales',
    password: ''
  });

  const tabs = [
    { id: 'general', label: '基本设置', icon: Globe },
    { id: 'users', label: '用户管理', icon: Users },
    { id: 'attendance', label: '考勤设置', icon: Clock },
    { id: 'security', label: '安全设置', icon: Shield },
    { id: 'notifications', label: '通知设置', icon: Bell }
  ];

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

  // 同步营业时间设置
  useEffect(() => {
    setTempBusinessHours(businessHours);
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        businessHours: formatTimeRange(businessHours.workStartTime, businessHours.workEndTime)
      }
    }));
  }, [businessHours]);

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

      // 更新营业时间设置
      if (activeTab === 'attendance') {
        updateBusinessHours(tempBusinessHours);
      }
      
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
      await addUser(newUser);
      setNewUser({ username: '', email: '', name: '', role: 'sales', password: '' });
      setShowAddUserModal(false);
      alert(`用户 ${newUser.name} 创建成功！`);
    } catch (error) {
      console.error('Failed to add user:', error);
      alert('添加用户失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId, currentStatus);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      alert('更新用户状态失败');
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
      await removeUser(userToDelete.id);
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

  const handleWorkDayToggle = (day: number) => {
    setTempBusinessHours(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day].sort()
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Globe className="w-5 h-5 mr-2" />
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
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              placeholder="在考勤设置中配置"
            />
            <p className="text-xs text-gray-500 mt-1">
              请在"考勤设置"标签页中配置详细的营业时间
            </p>
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
                    userData.isActive 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {userData.isActive ? '活跃' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(userData.createdAt).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleToggleUserStatus(userData.id, userData.isActive)}
                    className={`mr-4 ${
                      userData.isActive 
                        ? 'text-red-600 hover:text-red-900' 
                        : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {userData.isActive ? '禁用' : '启用'}
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(userData)}
                    className="text-red-600 hover:text-red-900"
                  >
                    删除
                  </button>
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

  const renderAttendanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          考勤时间设置
        </h3>
        
        <div className="space-y-6">
          {/* 工作时间设置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上班时间
              </label>
              <input
                type="time"
                value={tempBusinessHours.workStartTime}
                onChange={(e) => setTempBusinessHours(prev => ({
                  ...prev,
                  workStartTime: e.target.value
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                下班时间
              </label>
              <input
                type="time"
                value={tempBusinessHours.workEndTime}
                onChange={(e) => setTempBusinessHours(prev => ({
                  ...prev,
                  workEndTime: e.target.value
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 容忍时间设置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                迟到容忍时间（分钟）
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={tempBusinessHours.lateThreshold}
                onChange={(e) => setTempBusinessHours(prev => ({
                  ...prev,
                  lateThreshold: parseInt(e.target.value) || 0
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                超过此时间将被标记为迟到
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                早退容忍时间（分钟）
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={tempBusinessHours.earlyLeaveThreshold}
                onChange={(e) => setTempBusinessHours(prev => ({
                  ...prev,
                  earlyLeaveThreshold: parseInt(e.target.value) || 0
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                提前此时间内下班不算早退
              </p>
            </div>
          </div>

          {/* 工作日设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              工作日设置
            </label>
            <div className="grid grid-cols-7 gap-2">
              {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleWorkDayToggle(index)}
                  className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                    tempBusinessHours.workDays.includes(index)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              选择需要考勤的工作日，当前选择：{getWorkDayNames(tempBusinessHours.workDays).join('、')}
            </p>
          </div>

          {/* 预览设置 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-3">考勤规则预览</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex justify-between">
                <span>工作时间：</span>
                <span className="font-medium">
                  {formatTimeRange(tempBusinessHours.workStartTime, tempBusinessHours.workEndTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>工作日：</span>
                <span className="font-medium">
                  {getWorkDayNames(tempBusinessHours.workDays).join('、')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>迟到标准：</span>
                <span className="font-medium">
                  超过 {tempBusinessHours.workStartTime} 后 {tempBusinessHours.lateThreshold} 分钟
                </span>
              </div>
              <div className="flex justify-between">
                <span>早退标准：</span>
                <span className="font-medium">
                  {tempBusinessHours.workEndTime} 前 {tempBusinessHours.earlyLeaveThreshold} 分钟内
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'users':
        return renderUserManagement();
      case 'attendance':
        return renderAttendanceSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
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
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;