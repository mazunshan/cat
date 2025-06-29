import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, AlertTriangle, RefreshCw, Wifi, WifiOff, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { checkSupabaseConfiguration } from '../../utils/supabaseConfig';

interface ConnectionStatus {
  isConnected: boolean;
  isConfigured: boolean;
  isDevelopmentMode: boolean;
  error: string | null;
  latency: number | null;
  lastChecked: Date | null;
  databaseInfo: {
    tablesCount: number;
    usersCount: number;
    hasData: boolean;
  } | null;
}

const DatabaseConnectionChecker: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isConfigured: false,
    isDevelopmentMode: false,
    error: null,
    latency: null,
    lastChecked: null,
    databaseInfo: null
  });
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    const startTime = Date.now();
    
    try {
      // 检查配置状态
      const configStatus = checkSupabaseConfiguration();
      
      if (configStatus.isDevelopmentMode) {
        setStatus({
          isConnected: false,
          isConfigured: false,
          isDevelopmentMode: true,
          error: 'Supabase 未配置 - 使用开发模式',
          latency: null,
          lastChecked: new Date(),
          databaseInfo: null
        });
        setIsChecking(false);
        return;
      }

      if (!configStatus.isConfigured) {
        setStatus({
          isConnected: false,
          isConfigured: false,
          isDevelopmentMode: false,
          error: '配置错误: ' + configStatus.configurationIssues.join(', '),
          latency: null,
          lastChecked: new Date(),
          databaseInfo: null
        });
        setIsChecking(false);
        return;
      }

      // 测试基本连接
      const { data: healthCheck, error: healthError } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

      if (healthError) {
        throw healthError;
      }

      // 获取数据库信息
      const [usersResult, customersResult, ordersResult, productsResult] = await Promise.all([
        supabase.from('users').select('count', { count: 'exact', head: true }),
        supabase.from('customers').select('count', { count: 'exact', head: true }),
        supabase.from('orders').select('count', { count: 'exact', head: true }),
        supabase.from('products').select('count', { count: 'exact', head: true })
      ]);

      const latency = Date.now() - startTime;
      
      setStatus({
        isConnected: true,
        isConfigured: true,
        isDevelopmentMode: false,
        error: null,
        latency,
        lastChecked: new Date(),
        databaseInfo: {
          tablesCount: 4, // users, customers, orders, products
          usersCount: usersResult.count || 0,
          hasData: (usersResult.count || 0) > 0 || (customersResult.count || 0) > 0
        }
      });

    } catch (error) {
      console.error('数据库连接检查失败:', error);
      
      let errorMessage = '未知错误';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = '网络连接失败 - 无法访问 Supabase 服务器';
        } else if (error.message.includes('JWT') || error.message.includes('invalid')) {
          errorMessage = '认证失败 - 请检查 API 密钥是否正确';
        } else if (error.message.includes('permission')) {
          errorMessage = '权限错误 - 请检查 RLS 策略配置';
        } else {
          errorMessage = error.message;
        }
      }

      setStatus({
        isConnected: false,
        isConfigured: true,
        isDevelopmentMode: false,
        error: errorMessage,
        latency: null,
        lastChecked: new Date(),
        databaseInfo: null
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    }
    
    if (status.isDevelopmentMode) {
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
    
    if (status.isConnected) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusText = () => {
    if (isChecking) return '正在检查连接...';
    if (status.isDevelopmentMode) return 'Supabase 开发模式';
    if (status.isConnected) return 'Supabase 连接正常';
    return 'Supabase 连接失败';
  };

  const getStatusColor = () => {
    if (status.isDevelopmentMode) return 'border-yellow-200 bg-yellow-50';
    if (status.isConnected) return 'border-green-200 bg-green-50';
    return 'border-red-200 bg-red-50';
  };

  return (
    <div className={`border rounded-xl p-6 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">数据库连接状态</h3>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-sm text-gray-600">{getStatusText()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="显示详情"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                检查中
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                重新检查
              </>
            )}
          </button>
        </div>
      </div>

      {/* 连接状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center space-x-2">
            {status.isConfigured ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <p className="text-sm text-gray-600">配置状态</p>
              <p className="font-medium">{status.isConfigured ? '已配置' : '未配置'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center space-x-2">
            {status.isConnected ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
            <div>
              <p className="text-sm text-gray-600">连接状态</p>
              <p className="font-medium">{status.isConnected ? '已连接' : '未连接'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">响应时间</p>
              <p className="font-medium">
                {status.latency ? `${status.latency}ms` : '未知'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 错误信息 */}
      {status.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">连接错误</p>
              <p className="text-red-700 text-sm">{status.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 开发模式提示 */}
      {status.isDevelopmentMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">开发模式</p>
              <p className="text-yellow-700 text-sm">
                当前使用模拟数据。要连接真实数据库，请配置 Supabase 连接信息。
              </p>
              <div className="mt-2">
                <button 
                  onClick={() => window.location.href = '#settings'}
                  className="text-yellow-700 hover:text-yellow-900 underline text-sm"
                >
                  前往配置 Supabase →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 数据库信息 */}
      {status.databaseInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">数据库信息</p>
              <div className="text-green-700 text-sm space-y-1">
                <p>• 数据表数量: {status.databaseInfo.tablesCount}</p>
                <p>• 用户数量: {status.databaseInfo.usersCount}</p>
                <p>• 数据状态: {status.databaseInfo.hasData ? '有数据' : '空数据库'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 详细信息 */}
      {showDetails && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">连接详情</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">最后检查时间:</span>
              <span className="font-mono">
                {status.lastChecked ? status.lastChecked.toLocaleString('zh-CN') : '未知'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Supabase URL:</span>
              <span className="font-mono text-xs">
                {import.meta.env.VITE_SUPABASE_URL || '未设置'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">环境模式:</span>
              <span className="font-mono">{import.meta.env.MODE}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">开发模式:</span>
              <span className="font-mono">{import.meta.env.DEV ? 'true' : 'false'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 操作建议 */}
      {!status.isConnected && !status.isDevelopmentMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-blue-800 mb-2">解决建议</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• 检查网络连接是否正常</li>
            <li>• 验证 Supabase URL 和 API 密钥是否正确</li>
            <li>• 确认 Supabase 项目是否正常运行</li>
            <li>• 检查数据库 RLS 策略是否正确配置</li>
            <li>• 查看浏览器控制台是否有详细错误信息</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DatabaseConnectionChecker;