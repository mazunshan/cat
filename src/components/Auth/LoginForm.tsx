import React, { useState } from 'react';
import { Eye, EyeOff, RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginForm: React.FC = () => {
  const { login, generateVerificationCode, verificationRequired, loginStatus, loginMessage } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    verificationCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(
        formData.username, 
        formData.password, 
        formData.verificationCode
      );

      if (!success && !verificationRequired && loginStatus !== 'loading') {
        setError('用户名或密码错误');
      }
    } catch (err) {
      setError('登录失败，请重试');
    }
  };

  const handleGenerateCode = () => {
    const code = generateVerificationCode();
    alert(`验证码已生成: ${code}\n(实际应用中会通过短信或邮件发送)`);
  };

  // Check if the error is related to connection issues
  const isConnectionError = loginMessage.includes('无法连接') || loginMessage.includes('网络连接');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🐱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">猫咪销售系统</h1>
          <p className="text-gray-600 mt-2">请登录您的账户</p>
        </div>

        {/* 连接错误提示 */}
        {loginStatus === 'error' && isConnectionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center mb-2">
              <WifiOff className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-700 text-sm font-medium">连接失败</p>
            </div>
            <p className="text-red-600 text-sm">{loginMessage}</p>
            <div className="mt-3 text-xs text-red-600">
              <p>请检查以下项目：</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>网络连接是否正常</li>
                <li>Supabase 配置是否正确</li>
                <li>环境变量是否已设置</li>
              </ul>
            </div>
          </div>
        )}

        {/* 其他错误提示 */}
        {loginStatus === 'error' && !isConnectionError && loginMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-700 text-sm font-medium">{loginMessage}</p>
          </div>
        )}

        {/* 加载状态提示 */}
        {loginStatus === 'loading' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
            <RefreshCw className="w-5 h-5 text-blue-600 mr-3 animate-spin" />
            <p className="text-blue-700 text-sm font-medium">{loginMessage}</p>
          </div>
        )}

        {/* 成功状态提示 */}
        {loginStatus === 'success' && loginMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <Wifi className="w-5 h-5 text-green-600 mr-3" />
            <p className="text-green-700 text-sm font-medium">{loginMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="请输入用户名"
              required
              disabled={loginStatus === 'loading'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="请输入密码"
                required
                disabled={loginStatus === 'loading'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loginStatus === 'loading'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {verificationRequired && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                验证码
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({...formData, verificationCode: e.target.value})}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="请输入验证码"
                  required
                  disabled={loginStatus === 'loading'}
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center disabled:opacity-50"
                  disabled={loginStatus === 'loading'}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                销售人员和售后专员需要验证码才能登录
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loginStatus === 'loading'}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loginStatus === 'loading' ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </button>
        </form>

        {/* Supabase 配置提示 */}
        {loginStatus === 'error' && isConnectionError && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-xs font-medium mb-1">需要配置 Supabase？</p>
            <p className="text-yellow-700 text-xs">
              请点击右上角的 "Connect to Supabase" 按钮来设置数据库连接。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;