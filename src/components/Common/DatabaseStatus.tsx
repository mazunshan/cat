import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { testConnection } from '../../lib/database';

const DatabaseStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [connectionDetails, setConnectionDetails] = useState<{
    type: string;
    status: string;
    message: string;
  }>({
    type: 'unknown',
    status: 'checking',
    message: '正在检查数据库连接...'
  });

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setConnectionDetails({
      type: 'checking',
      status: 'checking',
      message: '正在检查数据库连接...'
    });

    try {
      const isConnected = await testConnection();
      
      if (isConnected) {
        setConnectionStatus('connected');
        setConnectionDetails({
          type: 'supabase',
          status: 'connected',
          message: '已连接到 Supabase PostgreSQL 数据库'
        });
      } else {
        setConnectionStatus('disconnected');
        setConnectionDetails({
          type: 'mock',
          status: 'disconnected',
          message: '未连接数据库，使用本地模拟数据'
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionDetails({
        type: 'error',
        status: 'error',
        message: `数据库连接错误: ${(error as Error).message}`
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />;
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Database className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'disconnected':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getEnvironmentInfo = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    return {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : '未配置',
      environment: import.meta.env.MODE || 'development'
    };
  };

  const envInfo = getEnvironmentInfo();

  return (
    <div className="space-y-4">
      {/* 主要状态显示 */}
      <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
        <div className="flex items-center">
          {getStatusIcon()}
          <div className="ml-3">
            <h3 className="font-medium">数据库连接状态</h3>
            <p className="text-sm mt-1">{connectionDetails.message}</p>
          </div>
          <button
            onClick={checkConnection}
            className="ml-auto p-2 hover:bg-white/50 rounded-lg transition-colors"
            title="重新检查连接"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
          <Database className="w-4 h-4 mr-2" />
          连接详情
        </h4>
        
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">数据源类型:</span>
              <span className="ml-2 font-medium">
                {connectionStatus === 'connected' ? 'Supabase PostgreSQL' : '本地模拟数据'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">运行环境:</span>
              <span className="ml-2 font-medium">{envInfo.environment}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Supabase URL:</span>
                <div className="flex items-center">
                  {envInfo.hasSupabaseUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className="text-xs font-mono">
                    {envInfo.hasSupabaseUrl ? envInfo.supabaseUrl : '未配置'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Supabase Key:</span>
                <div className="flex items-center">
                  {envInfo.hasSupabaseKey ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className="text-xs">
                    {envInfo.hasSupabaseKey ? '已配置' : '未配置'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 数据说明 */}
          <div className="border-t border-gray-100 pt-3">
            <h5 className="font-medium text-gray-700 mb-2">当前数据说明:</h5>
            {connectionStatus === 'connected' ? (
              <div className="text-green-700 bg-green-50 p-2 rounded">
                <p>✅ 正在使用 Supabase 云数据库</p>
                <p className="text-xs mt-1">所有数据操作都会同步到云端数据库</p>
              </div>
            ) : (
              <div className="text-yellow-700 bg-yellow-50 p-2 rounded">
                <p>⚠️ 正在使用本地模拟数据</p>
                <p className="text-xs mt-1">
                  数据仅存储在浏览器内存中，刷新页面后会重置。
                  要使用真实数据库，请配置 Supabase 连接。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 配置指南 */}
      {connectionStatus !== 'connected' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">如何连接 Supabase 数据库？</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p>1. 点击右上角的 "Connect to Supabase" 按钮</p>
            <p>2. 创建或登录您的 Supabase 账户</p>
            <p>3. 创建新项目并获取连接信息</p>
            <p>4. 系统会自动配置环境变量并连接数据库</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseStatus;