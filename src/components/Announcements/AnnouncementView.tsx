import React, { useState } from 'react';
import { Megaphone, Plus, AlertTriangle, Edit, Trash2, Info, Calendar, User, Clock, X } from 'lucide-react';
import { useAnnouncements } from '../../hooks/useDatabase';
import { useAuth } from '../../context/AuthContext';
import { Announcement } from '../../types';
import AddAnnouncementModal from './AddAnnouncementModal';
import EditAnnouncementModal from './EditAnnouncementModal';

const AnnouncementView: React.FC = () => {
  const { user } = useAuth();
  const { announcements = [], loading, error, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);

  const handleAddAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      await addAnnouncement(announcementData);
      setShowAddModal(false);
    } catch (error) {
      console.error('添加公告失败:', error);
      alert('添加公告失败，请重试');
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowEditModal(true);
  };

  const handleUpdateAnnouncement = async (announcementId: string, announcementData: Partial<Omit<Announcement, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) => {
    try {
      await updateAnnouncement(announcementId, announcementData);
      setShowEditModal(false);
      setEditingAnnouncement(null);
    } catch (error) {
      console.error('更新公告失败:', error);
      alert('更新公告失败，请重试');
    }
  };

  const handleDeleteAnnouncement = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAnnouncement = async () => {
    if (announcementToDelete) {
      try {
        await deleteAnnouncement(announcementToDelete.id);
        setShowDeleteConfirm(false);
        setAnnouncementToDelete(null);
      } catch (error) {
        console.error('删除公告失败:', error);
        alert('删除公告失败，请重试');
      }
    }
  };

  const toggleExpandAnnouncement = (id: string) => {
    if (expandedAnnouncementId === id) {
      setExpandedAnnouncementId(null);
    } else {
      setExpandedAnnouncementId(id);
    }
  };

  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'important':
        return 'bg-amber-100 text-amber-600 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  const getPriorityIcon = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-5 h-5" />;
      case 'important':
        return <Info className="w-5 h-5" />;
      default:
        return <Megaphone className="w-5 h-5" />;
    }
  };

  const getVisibilityText = (visibleTo: Announcement['visible_to']) => {
    switch (visibleTo) {
      case 'sales':
        return '仅销售员可见';
      case 'after_sales':
        return '仅售后专员可见';
      default:
        return '所有人可见';
    }
  };

  const getPriorityText = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent':
        return '紧急';
      case 'important':
        return '重要';
      default:
        return '普通';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载公告...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">数据加载警告</p>
              <p className="text-yellow-700 text-sm">
                公告数据加载失败: {error}。显示的是模拟数据。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">公告管理</h2>
        
        {/* 只有管理员可以添加公告 */}
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            发布公告
          </button>
        )}
      </div>

      {/* 公告列表 */}
      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className={`border rounded-xl overflow-hidden transition-all ${
                expandedAnnouncementId === announcement.id 
                  ? 'shadow-md' 
                  : 'shadow-sm hover:shadow-md'
              }`}
            >
              <div 
                className={`p-4 cursor-pointer ${getPriorityColor(announcement.priority)}`}
                onClick={() => toggleExpandAnnouncement(announcement.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getPriorityIcon(announcement.priority)}
                    <h3 className="font-semibold ml-3">{announcement.title}</h3>
                    <span className="ml-3 px-2 py-1 text-xs rounded-full bg-white bg-opacity-50">
                      {getPriorityText(announcement.priority)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">{getVisibilityText(announcement.visible_to)}</span>
                    {user?.role === 'admin' && (
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAnnouncement(announcement);
                          }}
                          className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition-colors"
                          title="编辑公告"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnnouncement(announcement);
                          }}
                          className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition-colors"
                          title="删除公告"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {expandedAnnouncementId === announcement.id && (
                <div className="p-6 bg-white">
                  <div className="whitespace-pre-line text-gray-700 mb-4">
                    {announcement.content}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(announcement.created_at).toLocaleDateString('zh-CN')}
                      </span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        管理员
                      </span>
                    </div>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(announcement.created_at).toLocaleTimeString('zh-CN')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无公告</h3>
            <p className="text-gray-600">
              {user?.role === 'admin' 
                ? '点击"发布公告"按钮创建新的公告' 
                : '目前没有任何公告'}
            </p>
          </div>
        )}
      </div>

      {/* 添加公告模态框 */}
      <AddAnnouncementModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddAnnouncement}
      />

      {/* 编辑公告模态框 */}
      <EditAnnouncementModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAnnouncement(null);
        }}
        onSave={handleUpdateAnnouncement}
        announcement={editingAnnouncement}
      />

      {/* 删除确认模态框 */}
      {showDeleteConfirm && announcementToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">确认删除公告</h3>
                <p className="text-sm text-gray-600">此操作无法撤销</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                您确定要删除公告 <span className="font-semibold">"{announcementToDelete.title}"</span> 吗？
              </p>
              <p className="text-sm text-gray-500 mt-2">
                删除后，此公告将从系统中永久移除。
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAnnouncementToDelete(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteAnnouncement}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementView;