import React, { useState } from 'react';
import { Bell, X, Edit, Megaphone, Users, Headphones, Globe, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Announcement } from '../../types';

interface AnnouncementProps {
  announcements: Announcement[];
  onAddAnnouncement?: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteAnnouncement?: (id: string) => Promise<void>;
}

const AnnouncementComponent: React.FC<AnnouncementProps> = ({ 
  announcements, 
  onAddAnnouncement,
  onDeleteAnnouncement
}) => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    visibleTo: 'all' as 'sales' | 'after_sales' | 'all',
    priority: 'normal' as 'normal' | 'important' | 'urgent'
  });
  const [formError, setFormError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // 过滤公告，只显示对当前用户可见的
  const filteredAnnouncements = announcements.filter(announcement => {
    if (user?.role === 'admin') return true;
    if (announcement.visibleTo === 'all') return true;
    if (announcement.visibleTo === 'sales' && user?.role === 'sales') return true;
    if (announcement.visibleTo === 'after_sales' && user?.role === 'after_sales') return true;
    return false;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError('标题和内容不能为空');
      return;
    }

    try {
      if (onAddAnnouncement) {
        await onAddAnnouncement({
          title: formData.title,
          content: formData.content,
          visibleTo: formData.visibleTo,
          priority: formData.priority,
          createdBy: user?.id || ''
        });
        
        // 重置表单
        setFormData({
          title: '',
          content: '',
          visibleTo: 'all',
          priority: 'normal'
        });
        
        setShowAddForm(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      setFormError('发布公告失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (onDeleteAnnouncement) {
      try {
        await onDeleteAnnouncement(id);
      } catch (error) {
        console.error('删除公告失败:', error);
      }
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'important':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  const getVisibilityIcon = (visibleTo: string) => {
    switch (visibleTo) {
      case 'sales':
        return <Users className="w-4 h-4" />;
      case 'after_sales':
        return <Headphones className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getVisibilityText = (visibleTo: string) => {
    switch (visibleTo) {
      case 'sales':
        return '仅销售员可见';
      case 'after_sales':
        return '仅售后专员可见';
      default:
        return '所有人可见';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Bell className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-gray-800">公告栏</h3>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {showAddForm ? (
              <>
                <X className="w-4 h-4 mr-1" />
                取消
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-1" />
                发布公告
              </>
            )}
          </button>
        )}
      </div>

      {/* 成功提示 */}
      {showSuccess && (
        <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <Check className="w-4 h-4 text-green-600 mr-2" />
          <p className="text-green-700 text-sm">公告发布成功</p>
        </div>
      )}

      {/* 添加公告表单 */}
      {showAddForm && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleSubmit}>
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                公告标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入公告标题"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                公告内容 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="输入公告内容"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  可见范围
                </label>
                <select
                  value={formData.visibleTo}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    visibleTo: e.target.value as 'sales' | 'after_sales' | 'all' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">所有人可见</option>
                  <option value="sales">仅销售员可见</option>
                  <option value="after_sales">仅售后专员可见</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  优先级
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    priority: e.target.value as 'normal' | 'important' | 'urgent' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="normal">普通</option>
                  <option value="important">重要</option>
                  <option value="urgent">紧急</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                发布公告
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 公告列表 */}
      <div className="max-h-[400px] overflow-y-auto">
        {filteredAnnouncements.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      announcement.priority === 'urgent' ? 'bg-red-500' :
                      announcement.priority === 'important' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <h4 className="font-medium text-gray-800">{announcement.title}</h4>
                  </div>
                  
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="删除公告"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-3 whitespace-pre-line">
                  {announcement.content}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full ${getPriorityStyles(announcement.priority)}`}>
                      {getVisibilityIcon(announcement.visibleTo)}
                      <span className="ml-1">{getVisibilityText(announcement.visibleTo)}</span>
                    </span>
                  </div>
                  <span>{new Date(announcement.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Megaphone className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-gray-500">暂无公告</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementComponent;