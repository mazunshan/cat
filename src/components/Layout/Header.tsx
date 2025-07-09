import React from 'react';
import { Search, Bell, MessageCircle } from 'lucide-react';

interface HeaderProps {
  title: string;
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, onSearch }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {new Date().toLocaleDateString('zh-CN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {onSearch && (
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索客户、订单..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;