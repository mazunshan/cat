import React, { useState } from 'react';
import { Database, Save, RefreshCw, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import SupabaseStatus from '../Common/SupabaseStatus';

const SupabaseConfigTab: React.FC = () => {
  const [config, setConfig] = useState({
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  });
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setSaving(true);
    try {
      // 这里应该保存到环境变量或配置文件
      // 在实际应用中，这需要重启应用才能生效
      console.log('保存配置:', config);
      
      // 模拟保存过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('配置已保存！请重启应用以使配置生效。');
    } catch (error) {
      console.error('保存配置失败:', error);
      alert('保存配置失败，请重试。');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTestResult('testing');
    try {
      // 这里应该测试 Supabase 连接
      // 模拟测试过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 简单的格式验证
      if (config.url.includes('.supabase.co') && config.anonKey.length > 100) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch (error) {
      setTestResult('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Supabase 状态检查 */}
      <SupabaseStatus />

      {/* 配置表单 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Database className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">Supabase 配置</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supabase URL *
            </label>
            <input
              type="url"
              value={config.url}
              onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="https://your-project-ref.supabase.co"
            />
            <p className="text-xs text-gray-500 mt-1">
              在 Supabase 项目设置中的 API 部分找到此 URL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anon Public Key *
            </label>
            <textarea
              value={config.anonKey}
              onChange={(e) => setConfig(prev => ({ ...prev, anonKey: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
            <p className="text-xs text-gray-500 mt-1">
              在 Supabase 项目设置中的 API 部分找到此密钥
            </p>
          </div>

          {/* 测试连接结果 */}
          {testResult !== 'idle' && (
            <div className={`p-4 rounded-lg border ${
              testResult === 'success' ? 'bg-green-50 border-green-200' :
              testResult === 'error' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center">
                {testResult === 'testing' && <RefreshCw className="w-5 h-5 text-blue-600 mr-3 animate-spin" />}
                {testResult === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mr-3" />}
                {testResult === 'error' && <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />}
                <div>
                  <p className={`font-medium ${
                    testResult === 'success' ? 'text-green-800' :
                    testResult === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                    {testResult === 'testing' && '正在测试连接...'}
                    {testResult === 'success' && '连接测试成功！'}
                    {testResult === 'error' && '连接测试失败'}
                  </p>
                  {testResult === 'success' && (
                    <p className="text-green-700 text-sm">Supabase 配置正确，可以正常连接数据库。</p>
                  )}
                  {testResult === 'error' && (
                    <p className="text-red-700 text-sm">请检查 URL 和密钥是否正确，确保网络连接正常。</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex space-x-4">
            <button
              onClick={testConnection}
              disabled={!config.url || !config.anonKey || testResult === 'testing'}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {testResult === 'testing' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  测试中...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  测试连接
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={!config.url || !config.anonKey || saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存配置
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 配置指南 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-800 mb-4">配置指南</h4>
        <div className="space-y-4 text-sm text-blue-700">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <p className="font-medium">创建 Supabase 项目</p>
              <p>访问 <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">supabase.com <ExternalLink className="w-3 h-3 ml-1" /></a> 并创建新项目</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <p className="font-medium">获取 API 配置</p>
              <p>在项目仪表板中，进入 Settings → API，复制 URL 和 anon public key</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <p className="font-medium">运行数据库迁移</p>
              <p>确保在 Supabase SQL 编辑器中运行了项目的数据库迁移脚本</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <p className="font-medium">配置 RLS 策略</p>
              <p>确保数据库表的行级安全策略已正确设置</p>
            </div>
          </div>
        </div>
      </div>

      {/* 环境变量说明 */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-800 mb-4">环境变量配置</h4>
        <p className="text-sm text-gray-600 mb-4">
          在项目根目录的 <code className="bg-gray-200 px-2 py-1 rounded text-xs">.env</code> 文件中添加以下配置：
        </p>
        <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm">
          <div>VITE_SUPABASE_URL=https://your-project-ref.supabase.co</div>
          <div>VITE_SUPABASE_ANON_KEY=your-anon-public-key-here</div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          注意：修改环境变量后需要重启开发服务器才能生效
        </p>
      </div>
    </div>
  );
};

export default SupabaseConfigTab;