import React, { useState } from 'react';
import { Database, CheckCircle, AlertTriangle, XCircle, Settings, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { checkSupabaseConfiguration, getCurrentConfig } from '../../utils/supabaseConfig';

const SupabaseStatus: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const status = checkSupabaseConfiguration();
  const config = getCurrentConfig();

  const getStatusIcon = () => {
    if (status.isConfigured) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (status.isDevelopmentMode) {
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    if (status.isConfigured) {
      return 'border-green-200 bg-green-50';
    } else if (status.isDevelopmentMode) {
      return 'border-yellow-200 bg-yellow-50';
    } else {
      return 'border-red-200 bg-red-50';
    }
  };

  const getStatusText = () => {
    if (status.isConfigured) {
      return 'Supabase 已正确配置';
    } else if (status.isDevelopmentMode) {
      return 'Supabase 开发模式';
    } else {
      return 'Supabase 配置错误';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-800">Supabase 配置状态</h3>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-sm text-gray-600">{getStatusText()}</span>
            </div>
          </div>
        </div>
        <Settings className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* 配置状态详情 */}
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-medium text-gray-800 mb-3">配置检查结果</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {status.hasValidUrl ? 
                  <CheckCircle className="w-4 h-4 text-green-600" /> : 
                  <XCircle className="w-4 h-4 text-red-600" />
                }
                <span className="text-sm">URL 配置: {status.hasValidUrl ? '正确' : '错误'}</span>
              </div>
              <div className="flex items-center space-x-2">
                {status.hasValidKey ? 
                  <CheckCircle className="w-4 h-4 text-green-600" /> : 
                  <XCircle className="w-4 h-4 text-red-600" />
                }
                <span className="text-sm">密钥配置: {status.hasValidKey ? '正确' : '错误'}</span>
              </div>
              <div className="flex items-center space-x-2">
                {status.isDevelopmentMode ? 
                  <AlertTriangle className="w-4 h-4 text-yellow-600" /> : 
                  <CheckCircle className="w-4 h-4 text-green-600" />
                }
                <span className="text-sm">模式: {status.isDevelopmentMode ? '开发模式' : '生产模式'}</span>
              </div>
            </div>
          </div>

          {/* 配置问题 */}
          {status.configurationIssues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">配置问题</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {status.configurationIssues.map((issue, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 建议 */}
          {status.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">建议</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {status.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 当前配置详情 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800">当前配置</h4>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
              >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showDetails ? '隐藏' : '显示'}</span>
              </button>
            </div>
            
            {showDetails && (
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-gray-600 mb-1">Supabase URL:</label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-xs font-mono">
                      {config.url}
                    </code>
                    <button
                      onClick={() => copyToClipboard(config.url)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                      title="复制"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-600 mb-1">Anon Key:</label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-xs font-mono">
                      {config.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(import.meta.env.VITE_SUPABASE_ANON_KEY || '')}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                      title="复制完整密钥"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <span className="text-gray-600">环境模式:</span>
                    <span className="ml-2 font-mono text-xs">{config.mode}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">开发模式:</span>
                    <span className="ml-2 font-mono text-xs">{config.isDev ? 'true' : 'false'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 快速配置指南 */}
          {!status.isConfigured && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">快速配置指南</h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <div>
                    <p className="font-medium">创建 Supabase 项目</p>
                    <p>访问 <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a> 创建新项目</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <div>
                    <p className="font-medium">获取配置信息</p>
                    <p>在项目设置中找到 API URL 和 anon public key</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <div>
                    <p className="font-medium">配置环境变量</p>
                    <p>在 .env 文件中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <div>
                    <p className="font-medium">运行数据库迁移</p>
                    <p>确保数据库表结构已正确创建</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupabaseStatus;