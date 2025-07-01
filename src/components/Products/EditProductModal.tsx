import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Play, Shield, Calendar, User, FileText, Clock } from 'lucide-react';
import { Product, QuarantineVideo } from '../../types';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, productData: Omit<Product, 'id'>) => void;
  product: Product | null;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    gender: 'female' as 'male' | 'female',
    price: 0,
    description: '',
    images: [] as string[],
    videos: [] as string[],
    quarantineVideos: [] as QuarantineVideo[],
    isAvailable: true,
    features: [] as string[]
  });

  const [newFeature, setNewFeature] = useState('');
  
  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const quarantineVideoInputRef = useRef<HTMLInputElement>(null);
  
  // 检疫视频相关状态
  const [quarantineVideoData, setQuarantineVideoData] = useState({
    url: '',
    title: '',
    description: '',
    recordedDate: '',
    veterinarian: '',
    quarantineStatus: 'healthy' as QuarantineVideo['quarantineStatus']
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        breed: product.breed,
        age: product.age,
        gender: product.gender,
        price: product.price,
        description: product.description,
        images: [...product.images],
        videos: [...product.videos],
        quarantineVideos: [...(product.quarantineVideos || [])],
        isAvailable: product.isAvailable,
        features: [...product.features]
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;
    
    onSave(product.id, formData);
    onClose();
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const newImages = selectedFiles.map(file => URL.createObjectURL(file));
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      
      // Reset the input value to allow selecting the same file again
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const removeImage = (imageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(image => image !== imageToRemove)
    }));
    
    // Only revoke if it's a blob URL (local file)
    if (imageToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove);
    }
  };

  // Handle video file selection
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const newVideos = selectedFiles.map(file => URL.createObjectURL(file));
      
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, ...newVideos]
      }));
      
      // Reset the input value
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };

  const removeVideo = (videoToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter(video => video !== videoToRemove)
    }));
    
    // Only revoke if it's a blob URL (local file)
    if (videoToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(videoToRemove);
    }
  };

  // Handle quarantine video file selection
  const handleQuarantineVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const videoUrl = URL.createObjectURL(file);
      
      setQuarantineVideoData(prev => ({
        ...prev,
        url: videoUrl
      }));
      
      // Reset the input value
      if (quarantineVideoInputRef.current) {
        quarantineVideoInputRef.current.value = '';
      }
    }
  };

  // 检疫视频相关函数
  const addQuarantineVideo = () => {
    if (!quarantineVideoData.url.trim() || !quarantineVideoData.title.trim()) {
      alert('请选择检疫视频并填写标题');
      return;
    }

    const newQuarantineVideo: QuarantineVideo = {
      id: Date.now().toString(),
      url: quarantineVideoData.url.trim(),
      title: quarantineVideoData.title.trim(),
      description: quarantineVideoData.description.trim(),
      recordedDate: quarantineVideoData.recordedDate || new Date().toISOString().split('T')[0],
      veterinarian: quarantineVideoData.veterinarian.trim(),
      quarantineStatus: quarantineVideoData.quarantineStatus,
      uploadedAt: new Date().toISOString()
    };

    setFormData(prev => ({
      ...prev,
      quarantineVideos: [...prev.quarantineVideos, newQuarantineVideo]
    }));

    // 重置检疫视频表单
    setQuarantineVideoData({
      url: '',
      title: '',
      description: '',
      recordedDate: '',
      veterinarian: '',
      quarantineStatus: 'healthy'
    });
  };

  const removeQuarantineVideo = (videoId: string) => {
    const videoToRemove = formData.quarantineVideos.find(video => video.id === videoId);
    if (videoToRemove && videoToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(videoToRemove.url);
    }
    
    setFormData(prev => ({
      ...prev,
      quarantineVideos: prev.quarantineVideos.filter(video => video.id !== videoId)
    }));
  };

  const getQuarantineStatusText = (status: QuarantineVideo['quarantineStatus']) => {
    const statusMap = {
      'healthy': '健康',
      'under_observation': '观察中',
      'treated': '已治疗',
      'cleared': '检疫通过'
    };
    return statusMap[status];
  };

  const getQuarantineStatusColor = (status: QuarantineVideo['quarantineStatus']) => {
    const colorMap = {
      'healthy': 'bg-green-100 text-green-600',
      'under_observation': 'bg-yellow-100 text-yellow-600',
      'treated': 'bg-orange-100 text-orange-600',
      'cleared': 'bg-blue-100 text-blue-600'
    };
    return colorMap[status];
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">编辑产品 - {product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                产品名称 *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入产品名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                品种 *
              </label>
              <select
                required
                value={formData.breed}
                onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">请选择品种</option>
                <option value="英国短毛猫">英国短毛猫</option>
                <option value="布偶猫">布偶猫</option>
                <option value="波斯猫">波斯猫</option>
                <option value="暹罗猫">暹罗猫</option>
                <option value="美国短毛猫">美国短毛猫</option>
                <option value="苏格兰折耳猫">苏格兰折耳猫</option>
                <option value="缅因猫">缅因猫</option>
                <option value="俄罗斯蓝猫">俄罗斯蓝猫</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年龄 *
              </label>
              <input
                type="text"
                required
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如: 3个月"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性别
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="female">母</option>
                <option value="male">公</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                价格 (元) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入价格"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <select
                value={formData.isAvailable ? 'available' : 'sold'}
                onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.value === 'available' }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="available">在售</option>
                <option value="sold">已售</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              产品描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="请输入产品详细描述"
            />
          </div>

          {/* 产品图片 - 使用本地文件选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              产品图片
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                multiple
                className="hidden"
                id="product-image-input"
              />
              <label 
                htmlFor="product-image-input"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                添加更多图片
              </label>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`产品图片 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
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

          {/* 产品视频 - 使用本地文件选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              产品视频
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoSelect}
                accept="video/*"
                multiple
                className="hidden"
                id="product-video-input"
              />
              <label 
                htmlFor="product-video-input"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center justify-center"
              >
                <Play className="w-4 h-4 mr-2" />
                添加更多视频
              </label>
            </div>
            {formData.videos.length > 0 && (
              <div className="space-y-2">
                {formData.videos.map((video, index) => (
                  <div key={index} className="flex items-center bg-gray-50 rounded-lg p-3">
                    <Play className="w-5 h-5 text-green-600 mr-3" />
                    <span className="flex-1 text-sm text-gray-700">
                      {video.startsWith('blob:') ? `新上传视频 ${index + 1}` : video}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVideo(video)}
                      className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 检疫视频部分 - 使用本地文件选择 */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-green-800">检疫视频管理</h3>
            </div>
            
            {/* 添加检疫视频表单 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  检疫视频 *
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    ref={quarantineVideoInputRef}
                    onChange={handleQuarantineVideoSelect}
                    accept="video/*"
                    className="hidden"
                    id="quarantine-video-input"
                  />
                  <label 
                    htmlFor="quarantine-video-input"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center justify-center"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    选择检疫视频
                  </label>
                </div>
                {quarantineVideoData.url && (
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <Play className="w-4 h-4 mr-1" />
                    <span>已选择视频文件</span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  视频标题 *
                </label>
                <input
                  type="text"
                  value={quarantineVideoData.title}
                  onChange={(e) => setQuarantineVideoData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="例如: 入场检疫视频"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  录制日期
                </label>
                <input
                  type="date"
                  value={quarantineVideoData.recordedDate}
                  onChange={(e) => setQuarantineVideoData(prev => ({ ...prev, recordedDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  检疫兽医
                </label>
                <input
                  type="text"
                  value={quarantineVideoData.veterinarian}
                  onChange={(e) => setQuarantineVideoData(prev => ({ ...prev, veterinarian: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="例如: 李兽医"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  检疫状态
                </label>
                <select
                  value={quarantineVideoData.quarantineStatus}
                  onChange={(e) => setQuarantineVideoData(prev => ({ 
                    ...prev, 
                    quarantineStatus: e.target.value as QuarantineVideo['quarantineStatus'] 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="healthy">健康</option>
                  <option value="under_observation">观察中</option>
                  <option value="treated">已治疗</option>
                  <option value="cleared">检疫通过</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  视频描述
                </label>
                <textarea
                  value={quarantineVideoData.description}
                  onChange={(e) => setQuarantineVideoData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="描述检疫视频的内容和检查项目"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={addQuarantineVideo}
              disabled={!quarantineVideoData.url || !quarantineVideoData.title}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shield className="w-4 h-4 mr-2" />
              添加检疫视频
            </button>
            
            {/* 已添加的检疫视频列表 */}
            {formData.quarantineVideos.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">已添加的检疫视频</h4>
                <div className="space-y-3">
                  {formData.quarantineVideos.map((video) => (
                    <div key={video.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Play className="w-4 h-4 text-green-600 mr-2" />
                            <h5 className="font-medium text-gray-800">{video.title}</h5>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getQuarantineStatusColor(video.quarantineStatus)}`}>
                              {getQuarantineStatusText(video.quarantineStatus)}
                            </span>
                          </div>
                          
                          {video.description && (
                            <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                          )}
                          
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            {video.recordedDate && (
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                录制: {new Date(video.recordedDate).toLocaleDateString('zh-CN')}
                              </div>
                            )}
                            {video.veterinarian && (
                              <div className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                兽医: {video.veterinarian}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              上传: {new Date(video.uploadedAt).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeQuarantineVideo(video.id)}
                          className="ml-4 p-1 text-red-600 hover:bg-red-50 rounded"
                          title="删除检疫视频"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 产品特色 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              产品特色
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入特色亮点"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(feature)}
                      className="ml-2 text-blue-400 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
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

export default EditProductModal;