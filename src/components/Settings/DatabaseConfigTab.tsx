import React, { useState, useEffect } from 'react';
import { Database, Save, RefreshCw, AlertTriangle, CheckCircle, ExternalLink, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DatabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

const DatabaseConfigTab: React.FC = () => {
  const [config, setConfig] = useState<DatabaseConfig>({
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    serviceRoleKey: ''
  });
  
  const [showKeys, setShowKeys] = useState({
    anonKey: false,
    serviceRoleKey: false
  });
  
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Check current connection status
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    checkCurrentConnection();
  }, []);

  const checkCurrentConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      if (error) {
        setConnectionStatus('disconnected');
      } else {
        setConnectionStatus('connected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const validateConfig = () => {
    const errors: string[] = [];
    
    if (!config.url) {
      errors.push('Supabase URL is required');
    } else if (!config.url.startsWith('https://') || !config.url.includes('.supabase.co')) {
      errors.push('Invalid Supabase URL format. Should be: https://your-project-ref.supabase.co');
    }
    
    if (!config.anonKey) {
      errors.push('Anon Key is required');
    } else if (config.anonKey.length < 100 || !config.anonKey.startsWith('eyJ')) {
      errors.push('Invalid Anon Key format. Should be a JWT token starting with "eyJ"');
    }
    
    return errors;
  };

  const testConnection = async () => {
    const errors = validateConfig();
    if (errors.length > 0) {
      setTestResult('error');
      setTestMessage(errors.join(', '));
      return;
    }

    setTestResult('testing');
    setTestMessage('Testing connection...');

    try {
      // Create a temporary Supabase client with the new config
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(config.url, config.anonKey);
      
      // Test the connection
      const { data, error } = await testClient.from('users').select('count', { count: 'exact', head: true });
      
      if (error) {
        setTestResult('error');
        setTestMessage(`Connection failed: ${error.message}`);
      } else {
        setTestResult('success');
        setTestMessage('Connection successful! Database is accessible.');
      }
    } catch (error) {
      setTestResult('error');
      setTestMessage(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const saveConfiguration = async () => {
    const errors = validateConfig();
    if (errors.length > 0) {
      alert(`Configuration errors:\n${errors.join('\n')}`);
      return;
    }

    setSaving(true);
    try {
      // In a real application, you would save these to your environment variables
      // For now, we'll show instructions to the user
      const envContent = `VITE_SUPABASE_URL=${config.url}
VITE_SUPABASE_ANON_KEY=${config.anonKey}`;

      // Create a downloadable .env file
      const blob = new Blob([envContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '.env';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Configuration saved! Please:\n1. Replace your .env file with the downloaded one\n2. Restart your development server\n3. Refresh this page');
    } catch (error) {
      alert('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const generateEnvFile = () => {
    const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${config.url}
VITE_SUPABASE_ANON_KEY=${config.anonKey}

# Optional: Service Role Key (for admin operations)
# VITE_SUPABASE_SERVICE_ROLE_KEY=${config.serviceRoleKey || 'your-service-role-key-here'}`;

    return envContent;
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Current Connection Status</h3>
          <button
            onClick={checkCurrentConnection}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          {connectionStatus === 'checking' && (
            <>
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-blue-600">Checking connection...</span>
            </>
          )}
          {connectionStatus === 'connected' && (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-600">Connected to Supabase</span>
            </>
          )}
          {connectionStatus === 'disconnected' && (
            <>
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-600">Not connected to Supabase</span>
            </>
          )}
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Database className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">Database Configuration</h3>
        </div>

        <div className="space-y-6">
          {/* Supabase URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supabase Project URL *
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={config.url}
                onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="https://your-project-ref.supabase.co"
              />
              <button
                onClick={() => copyToClipboard(config.url, 'url')}
                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy URL"
              >
                {copied === 'url' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Found in your Supabase project settings under API → Project URL
            </p>
          </div>

          {/* Anon Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anon Public Key *
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type={showKeys.anonKey ? 'text' : 'password'}
                  value={config.anonKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
                <button
                  type="button"
                  onClick={() => setShowKeys(prev => ({ ...prev, anonKey: !prev.anonKey }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showKeys.anonKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={() => copyToClipboard(config.anonKey, 'anonKey')}
                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy Anon Key"
              >
                {copied === 'anonKey' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Found in your Supabase project settings under API → anon public
            </p>
          </div>

          {/* Service Role Key (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Role Key (Optional)
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type={showKeys.serviceRoleKey ? 'text' : 'password'}
                  value={config.serviceRoleKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, serviceRoleKey: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
                <button
                  type="button"
                  onClick={() => setShowKeys(prev => ({ ...prev, serviceRoleKey: !prev.serviceRoleKey }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showKeys.serviceRoleKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={() => copyToClipboard(config.serviceRoleKey || '', 'serviceRoleKey')}
                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy Service Role Key"
              >
                {copied === 'serviceRoleKey' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Found in your Supabase project settings under API → service_role (for admin operations)
            </p>
          </div>

          {/* Test Result */}
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
                    {testResult === 'testing' && 'Testing Connection...'}
                    {testResult === 'success' && 'Connection Successful!'}
                    {testResult === 'error' && 'Connection Failed'}
                  </p>
                  <p className={`text-sm ${
                    testResult === 'success' ? 'text-green-700' :
                    testResult === 'error' ? 'text-red-700' :
                    'text-blue-700'
                  }`}>
                    {testMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={testConnection}
              disabled={testResult === 'testing'}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {testResult === 'testing' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </button>
            <button
              onClick={saveConfiguration}
              disabled={saving || testResult === 'testing'}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Environment File Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Environment File Preview</h4>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <pre>{generateEnvFile()}</pre>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            Copy this content to your .env file in the project root
          </p>
          <button
            onClick={() => copyToClipboard(generateEnvFile(), 'env')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            {copied === 'env' ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
            Copy .env Content
          </button>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-800 mb-4">Setup Instructions</h4>
        <div className="space-y-4 text-sm text-blue-700">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <p className="font-medium">Create or Access Your Supabase Project</p>
              <p>Visit <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">supabase.com <ExternalLink className="w-3 h-3 ml-1" /></a> and create a new project or access an existing one</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <p className="font-medium">Get Your API Credentials</p>
              <p>In your Supabase dashboard, go to Settings → API and copy your Project URL and anon public key</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <p className="font-medium">Run Database Migrations</p>
              <p>Execute the SQL migration files in the supabase/migrations folder in your Supabase SQL editor</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <p className="font-medium">Update Environment Variables</p>
              <p>Save the configuration above and restart your development server</p>
            </div>
          </div>
        </div>
      </div>

      {/* Migration Helper */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h4 className="font-semibold text-yellow-800 mb-4">Database Migration Required</h4>
        <p className="text-yellow-700 text-sm mb-4">
          After updating your database connection, make sure to run the database migrations to set up the required tables and data.
        </p>
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
          <p className="text-yellow-800 text-sm font-medium mb-2">Migration Files Location:</p>
          <code className="text-yellow-900 text-xs bg-yellow-200 px-2 py-1 rounded">
            supabase/migrations/
          </code>
          <p className="text-yellow-700 text-xs mt-2">
            Copy and execute these SQL files in your Supabase SQL editor in chronological order.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConfigTab;