import React, { useState, useRef } from 'react';
import { X, Heart, Share2, Star, Play, Camera, Shield, Calendar, User, Clock, FileText } from 'lucide-react';
import { Product, QuarantineVideo } from '../../types';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'images' | 'videos' | 'quarantine'>('images');
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const playVideo = (videoUrl: string) => {
    if (videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.play();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Media Section */}
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('images')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'images'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Camera className="w-4 h-4 inline mr-2" />
                  产品图片 ({product.images.length})
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'videos'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Play className="w-4 h-4 inline mr-2" />
                  产品视频 ({product.videos.length})
                </button>
                <button
                  onClick={() => setActiveTab('quarantine')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'quarantine'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  检疫视频 ({product.quarantineVideos?.length || 0})
                </button>
              </div>

              {/* Content based on active tab */}
              {activeTab === 'images' && (
                <>
                  {/* Main Image */}
                  <div className="relative rounded-xl overflow-hidden bg-gray-100">
                    {product.images.length > 0 ? (
                      <img 
                        src={product.images[currentImageIndex]} 
                        alt={product.name}
                        className="w-full h-96 object-cover"
                      />
                    ) : (
                      <div className="w-full h-96 flex items-center justify-center text-gray-400">
                        <Camera className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.isAvailable 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {product.isAvailable ? '在售' : '已售'}
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  {product.images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                            currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img 
                            src={image} 
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'videos' && (
                <div className="space-y-4">
                  {/* Video Player */}
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video 
                      ref={videoRef}
                      controls
                      className="w-full h-80 object-contain"
                      poster={product.images[0]}
                    >
                      您的浏览器不支持视频播放
                    </video>
                  </div>
                  
                  {/* Video List */}
                  {product.videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {product.videos.map((video, index) => (
                        <div 
                          key={index} 
                          className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => playVideo(video)}
                        >
                          <div className="flex items-center">
                            <Play className="w-5 h-5 text-blue-600 mr-3" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">产品视频 {index + 1}</p>
                              <p className="text-sm text-gray-600 truncate">点击播放</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Play className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>暂无产品视频</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'quarantine' && (
                <div className="space-y-4">
                  {/* Quarantine Video Player */}
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video 
                      ref={videoRef}
                      controls
                      className="w-full h-80 object-contain"
                      poster={product.images[0]}
                    >
                      您的浏览器不支持视频播放
                    </video>
                  </div>
                  
                  {/* Quarantine Video List */}
                  {product.quarantineVideos && product.quarantineVideos.length > 0 ? (
                    <div className="space-y-3">
                      {product.quarantineVideos.map((video) => (
                        <div 
                          key={video.id} 
                          className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
                          onClick={() => playVideo(video.url)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <Shield className="w-5 h-5 text-green-600 mr-3" />
                              <div>
                                <h4 className="font-medium text-gray-800">{video.title}</h4>
                                <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${getQuarantineStatusColor(video.quarantineStatus)}`}>
                                  {getQuarantineStatusText(video.quarantineStatus)}
                                </span>
                              </div>
                            </div>
                            <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                              播放
                            </button>
                          </div>
                          
                          {video.description && (
                            <p className="text-sm text-gray-700 mb-3">{video.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
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
                            {video.duration && (
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                时长: {formatDuration(video.duration)}
                              </div>
                            )}
                            {video.fileSize && (
                              <div className="flex items-center">
                                <FileText className="w-3 h-3 mr-1" />
                                大小: {formatFileSize(video.fileSize)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>暂无检疫视频</p>
                      <p className="text-sm mt-2">检疫视频用于展示猫咪的健康状况和检疫过程</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-gray-600 ml-1">4.8 (12 评价)</span>
                  </div>
                </div>
                <p className="text-xl text-gray-600">{product.breed}</p>
              </div>

              {/* Price */}
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-4xl font-bold text-red-600">¥{product.price.toLocaleString()}</span>
                    <p className="text-sm text-gray-500 mt-1">支持分期付款</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">月供低至</p>
                    <p className="text-xl font-bold text-blue-600">¥{Math.round(product.price / 6).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">年龄</p>
                  <p className="font-semibold text-gray-800">{product.age}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">性别</p>
                  <p className={`font-semibold ${product.gender === 'female' ? 'text-pink-600' : 'text-blue-600'}`}>
                    {product.gender === 'female' ? '母猫' : '公猫'}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">特色亮点</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-blue-50 text-blue-600 px-3 py-2 rounded-lg"
                    >
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Certification */}
              {product.quarantineVideos && product.quarantineVideos.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-green-800">健康认证</h3>
                  </div>
                  <div className="space-y-2">
                    {product.quarantineVideos.map((video) => (
                      <div key={video.id} className="flex items-center justify-between">
                        <span className="text-sm text-green-700">{video.title}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getQuarantineStatusColor(video.quarantineStatus)}`}>
                          {getQuarantineStatusText(video.quarantineStatus)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">详细描述</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  立即预定
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                  咨询客服
                </button>
              </div>

              {/* Additional Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-2">购买须知</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• 所有猫咪均已完成基础疫苗接种</li>
                  <li>• 提供健康保证书和血统证明</li>
                  <li>• 支持上门看猫，满意后付款</li>
                  <li>• 全国包邮，安全送达</li>
                  {product.quarantineVideos && product.quarantineVideos.length > 0 && (
                    <li>• 提供完整的检疫视频记录</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;