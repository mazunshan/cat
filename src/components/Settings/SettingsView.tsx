import React, { useState } from 'react';
import { Settings, Database, Shield, Bell, Users, Palette } from 'lucide-react';
import DatabaseConfigTab from './DatabaseConfigTab';
import SupabaseConfigTab from './SupabaseConfigTab';
import { useAuth } from '../../context/AuthContext';

const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('database');

  // Only admins can access settings
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">访问受限</h3>
          <p className="text-gray-600">只有管理员可以访问系统设置</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'database',
      label: '数据库配置',
      icon: Database,
      description: '配置 Supabase 数据库连接'
    },
    {
      id: 'supabase',
      label: 'Supabase 状态',
      icon: Settings,
      description: '查看 Supabase 配置状态'
    },
    {
      id: 'users',
      label: '用户管理',
      icon: Users,
      description: '管理系统用户和权限'
    },
    {
      id: 'notifications',
      label: '通知设置',
      icon: Bell,
      description: '配置系统通知和提醒'
    },
    {
      id: 'appearance',
      label: '外观设置',
      icon: Palette,
      description: '自定义系统外观和主题'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'database':
        return <DatabaseConfigTab />;
      case 'supabase':
        return <SupabaseConfigTab />;
      case 'users':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">用户管理</h3>
            <p className="text-gray-600">用户管理功能正在开发中...</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">通知设置</h3>
            <p className="text-gray-600">通知设置功能正在开发中...</p>
          </div>
        );
      case 'appearance':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">外观设置</h3>
            <p className="text-gray-600">外观设置功能正在开发中...</p>
          </div>
        );
      default:
        return <DatabaseConfigTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">系统设置</h2>
          <p className="text-gray-600 mt-1">管理系统配置和偏好设置</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">设置分类</h3>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{tab.label}</p>
                      <p className="text-xs text-gray-500 truncate">{tab.description}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;