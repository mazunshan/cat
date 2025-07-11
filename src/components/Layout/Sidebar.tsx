import React from 'react';
import { 
  Home, Users, ShoppingBag, Package, BookOpen, DollarSign,
  BarChart3, Settings, LogOut, HeadphonesIcon, Trophy, Megaphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  // 根据用户角色显示不同的菜单项
  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: '仪表盘', icon: Home, roles: ['admin', 'sales', 'after_sales'] },
      { id: 'customers', label: '客户管理', icon: Users, roles: ['admin', 'sales', 'after_sales'] },
      { id: 'knowledge', label: '知识库', icon: BookOpen, roles: ['admin', 'sales', 'after_sales'] },
      { id: 'announcements', label: '公告管理', icon: Megaphone, roles: ['admin', 'sales', 'after_sales'] },
      { id: 'financial', label: '收支明细', icon: DollarSign, roles: ['admin'] }
    ];

    // 售后专员特有的菜单项
    if (user?.role === 'after_sales') {
      baseItems.push({ 
        id: 'after_sales', 
        label: '售后服务', 
        icon: HeadphonesIcon, 
        roles: ['after_sales', 'admin'] 
      });
    }

    // 管理员特有的菜单项
    if (user?.role === 'admin') {
      baseItems.push({ 
        id: 'analytics', 
        label: '销售业绩排名', 
        icon: Trophy, 
        roles: ['admin'] 
      });
      baseItems.push({ 
        id: 'settings', 
        label: '系统设置', 
        icon: Settings, 
        roles: ['admin'] 
      });
    }

    // 根据当前用户角色过滤菜单项
    return baseItems.filter(item => item.roles.includes(user?.role || ''));
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">猫咪销售系统</h1>
        <p className="text-sm text-gray-600 mt-1">Cat Sales Management</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {user?.name.charAt(0)}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role === 'admin' ? '管理员' : 
               user?.role === 'sales' ? '销售员' : 
               user?.role === 'after_sales' ? '售后专员' : '未知角色'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm">退出登录</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;