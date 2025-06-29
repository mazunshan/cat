import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface WelcomeToastProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const WelcomeToast: React.FC<WelcomeToastProps> = ({ isOpen, message, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // 2秒后自动消失
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 - 点击可关闭 */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* 欢迎提示 */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 flex items-center space-x-4 min-w-[280px] animate-in slide-in-from-top-4 duration-500 ease-out">
          {/* 成功图标 */}
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          
          {/* 欢迎文字 */}
          <div className="flex-1">
            <p className="text-gray-800 font-semibold text-lg">{message}</p>
          </div>
          
          {/* 装饰性渐变边框 */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-green-500/10 to-purple-500/10 pointer-events-none" />
        </div>
      </div>
    </>
  );
};

export default WelcomeToast;