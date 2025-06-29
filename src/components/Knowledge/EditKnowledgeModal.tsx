import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { KnowledgeBase } from '../../types';

interface EditKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (knowledgeId: string, knowledgeData: Omit<KnowledgeBase, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>) => void;
  knowledge: KnowledgeBase | null;
}

const EditKnowledgeModal: React.FC<EditKnowledgeModalProps> = ({ isOpen, onClose, onSave, knowledge }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    tags: [] as string[],
    images: [] as string[]
  });

  const [newTag, setNewTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const categories = [
    '选购指南',
    '健康护理',
    '饲养技巧',
    '品种介绍',
    '常见问题',
    '售后服务'
  ];

  useEffect(() => {
    if (knowledge) {
      setFormData({
        question: knowledge.question,
        answer: knowledge.answer,
        category: knowledge.category,
        tags: [...(knowledge.tags || [])],
        images: [...(knowledge.images || [])]
      });
    }
  }, [knowledge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (knowledge) {
      onSave(knowledge.id, formData);
      onClose();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addImage = () => {
    if (imageUrl.trim() && !formData.images.includes(imageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }));
      setImageUrl('');
    }
  };

  const removeImage = (imageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(image => image !== imageToRemove)
    }));
  };

  if (!isOpen || !knowledge) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">编辑问答</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              问题标题 *
            </label>
            <input
              type="text"
              required
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入问题标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类 *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择分类</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              详细回答 *
            </label>
            <textarea
              required
              value={formData.answer}
              onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="请输入详细的回答内容"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入标签"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-400 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              相关图片
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入图片URL"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.images && formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`相关图片 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditKnowledgeModal;