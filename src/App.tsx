import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import WelcomeToast from './components/Common/WelcomeToast';
import DashboardView from './components/Dashboard/DashboardView';
import CustomersView from './components/Customers/CustomersView';
import KnowledgeView from './components/Knowledge/KnowledgeView';
import SettingsView from './components/Settings/SettingsView';
import AfterSalesView from './components/AfterSales/AfterSalesView';
import SalesPerformanceView from './components/SalesPerformance/SalesPerformanceView';
import FinancialDetailsView from './components/Financial/FinancialDetailsView';
import AnnouncementView from './components/Announcements/AnnouncementView';
import AnnouncementBanner from './components/Announcements/AnnouncementBanner';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, loginStatus, loginMessage, clearLoginMessage } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const getTabTitle = (tab: string): string => {
    const titles = {
      dashboard: '仪表盘',
      customers: '客户管理',
      orders: '订单管理',
      products: '产品管理',
      knowledge: '知识库',
      analytics: '销售业绩排名',
      settings: '系统设置',
      after_sales: '售后服务',
      announcements: '公告管理',
      financial: '收支明细'
    };
    return titles[tab as keyof typeof titles] || '仪表盘';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'customers':
        return <CustomersView />;
      case 'knowledge':
        return <KnowledgeView />;
      case 'analytics':
        return <SalesPerformanceView />;
      case 'settings':
        return <SettingsView />;
      case 'after_sales':
        return <AfterSalesView />;
      case 'announcements':
        return <AnnouncementView />;
      case 'financial':
        return <FinancialDetailsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getTabTitle(activeTab)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab !== 'announcements' && <AnnouncementBanner />}
          {renderContent()}
        </main>
      </div>

      {/* 欢迎提示 */}
      <WelcomeToast
        isOpen={loginStatus === 'success' && !!loginMessage}
        message={loginMessage}
        onClose={clearLoginMessage}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;