import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, ThumbsUp, Calendar, AlertTriangle, Edit, Trash2, Lock } from 'lucide-react';
import AddKnowledgeModal from './AddKnowledgeModal';
import EditKnowledgeModal from './EditKnowledgeModal';
import { useKnowledgeBase } from '../../hooks/useDatabase';
import { useAuth } from '../../context/AuthContext';
import { KnowledgeBase } from '../../types';

const KnowledgeView: React.FC = () => {
  const { user } = useAuth();
  const { knowledgeBase = [], loading, error, addKnowledge, updateKnowledge, deleteKnowledge } = useKnowledgeBase();
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBase | null>(null);
  const [editingArticle, setEditingArticle] = useState<KnowledgeBase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<KnowledgeBase | null>(null);

  // 安全的数组操作
  const safeKnowledgeBase = knowledgeBase || [];

  const categories = ['all', ...Array.from(new Set(safeKnowledgeBase.map(kb => kb.category).filter(Boolean)))];

  const filteredKnowledge = safeKnowledgeBase.filter(kb => {
    const matchesSearch = searchTerm === '' || 
      kb.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kb.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (kb.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || kb.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 检查用户是否可以编辑/删除特定知识库条目
  const canEditKnowledge = (knowledge: KnowledgeBase) => {
    return user?.role === 'admin' || knowledge.createdBy === user?.id;
  };

  const handleAddKnowledge = async (knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addKnowledge(knowledgeData);
    } catch (error) {
      console.error('Failed to add knowledge:', error);
      alert((error as Error).message || '添加知识库条目失败，请重试');
    }
  };

  const handleEditKnowledge = (knowledge: KnowledgeBase) => {
    if (!canEditKnowledge(knowledge)) {
      alert('您只能编辑自己创建的知识库条目');
      return;
    }
    setEditingArticle(knowledge);
    setShowEditModal(true);
  };

  const handleUpdateKnowledge = async (knowledgeId: string, knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      await updateKnowledge(knowledgeId, knowledgeData);
      setShowEditModal(false);
      setEditingArticle(null);
      // 如果当前选中的文章被更新了，也要更新选中状态
      if (selectedArticle?.id === knowledgeId) {
        const updatedArticle = safeKnowledgeBase.find(kb => kb.id === knowledgeId);
        if (updatedArticle) {
          setSelectedArticle(updatedArticle);
        }
      }
    } catch (error) {
      console.error('Failed to update knowledge:', error);
      alert((error as Error).message || '更新知识库条目失败，请重试');
    }
  };

  const handleDeleteKnowledge = (knowledge: KnowledgeBase) => {
    if (!canEditKnowledge(knowledge)) {
      alert('您只能删除自己创建的知识库条目');
      return;
    }
    setArticleToDelete(knowledge);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteKnowledge = async () => {
    if (articleToDelete) {
      try {
        await deleteKnowledge(articleToDelete.id);
        setShowDeleteConfirm(false);
        setArticleToDelete(null);
        // 如果删除的是当前选中的文章，清除选择
        if (selectedArticle?.id === articleToDelete.id) {
          setSelectedArticle(null);
        }
      } catch (error) {
        console.error('Failed to delete knowledge:', error);
        alert((error as Error).message || '删除知识库条目失败，请重试');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载知识库数据...</p>
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
                知识库数据加载失败: {error}。显示的是模拟数据。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加问答
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索问题或答案..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? '全部分类' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">总问答数</p>
          <p className="text-2xl font-bold text-gray-800">{safeKnowledgeBase.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">本月新增</p>
          <p className="text-2xl font-bold text-green-600">
            {safeKnowledgeBase.filter(kb => {
              const createdDate = new Date(kb.createdAt);
              const now = new Date();
              return createdDate.getMonth() === now.getMonth() && 
                     createdDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">总浏览量</p>
          <p className="text-2xl font-bold text-blue-600">
            {safeKnowledgeBase.reduce((sum, kb) => sum + (kb.viewCount || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">我的贡献</p>
          <p className="text-2xl font-bold text-purple-600">
            {safeKnowledgeBase.filter(kb => kb.createdBy === user?.id).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Knowledge Base List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">知识库</h3>
          {filteredKnowledge.length > 0 ? (
            filteredKnowledge.map((kb) => (
              <div
                key={kb.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedArticle(kb)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                      {kb.question}
                    </h4>
                    <p className="text-gray-600 line-clamp-2 mb-3">{kb.answer}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                      {kb.category}
                    </span>
                    {/* 权限控制的操作按钮 */}
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEditKnowledge(kb) ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditKnowledge(kb);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="编辑问答"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteKnowledge(kb);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除问答"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="p-1.5 text-gray-400" title="只能编辑自己创建的内容">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {(kb.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {kb.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{kb.viewCount || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      <span>{Math.floor((kb.viewCount || 0) * 0.1)}</span>
                    </div>
                    {/* 显示创建者信息 */}
                    {kb.createdBy === user?.id && (
                      <span className="text-blue-600 text-xs">我的</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(kb.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无知识库数据</h3>
              <p className="text-gray-600 mb-4">
                {filterCategory === 'all' ? '还没有添加任何问答' : `没有找到分类为"${filterCategory}"的问答`}
              </p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                添加第一个问答
              </button>
            </div>
          )}
        </div>

        {/* Article Detail */}
        <div className="lg:col-span-1">
          {selectedArticle ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                  {selectedArticle.category}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{selectedArticle.viewCount || 0}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedArticle.question}
              </h3>

              <div className="prose prose-sm max-w-none mb-4">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedArticle.answer}
                </p>
              </div>

              {/* Images */}
              {(selectedArticle.images || []).length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">相关图片</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedArticle.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`相关图片 ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg';
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {(selectedArticle.tags || []).length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">标签</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedArticle.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>创建: {new Date(selectedArticle.createdAt).toLocaleDateString('zh-CN')}</span>
                  <span>更新: {new Date(selectedArticle.updatedAt).toLocaleDateString('zh-CN')}</span>
                </div>
                {selectedArticle.createdBy === user?.id && (
                  <div className="mt-2 text-xs text-blue-600">
                    由您创建
                  </div>
                )}
              </div>

              {/* 操作按钮 - 根据权限显示 */}
              {canEditKnowledge(selectedArticle) ? (
                <div className="flex space-x-2 mt-4">
                  <button 
                    onClick={() => handleEditKnowledge(selectedArticle)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    编辑
                  </button>
                  <button 
                    onClick={() => handleDeleteKnowledge(selectedArticle)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除问答"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                  <div className="flex items-center justify-center text-gray-500 mb-2">
                    <Lock className="w-4 h-4 mr-2" />
                    <span className="text-sm">只能编辑自己创建的内容</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {user?.role === 'admin' ? '管理员可以编辑所有内容' : '您可以编辑自己创建的知识库条目'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">选择问答查看详情</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Knowledge Modal */}
      <AddKnowledgeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddKnowledge}
      />

      {/* Edit Knowledge Modal */}
      <EditKnowledgeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingArticle(null);
        }}
        onSave={handleUpdateKnowledge}
        knowledge={editingArticle}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && articleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">确认删除问答</h3>
                <p className="text-sm text-gray-600">此操作无法撤销</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                您确定要删除问答 <span className="font-semibold">"{articleToDelete.question}"</span> 吗？
              </p>
              <p className="text-sm text-gray-500 mt-2">
                删除后，此问答将从知识库中永久移除。
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setArticleToDelete(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteKnowledge}
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

export default KnowledgeView;