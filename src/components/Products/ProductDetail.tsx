import React, { useState } from 'react';
import { X, Heart, Share2, Star, Play, Camera } from 'lucide-react';
import { Product } from '../../types';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
              {/* Main Image/Video */}
              <div className="relative rounded-xl overflow-hidden bg-gray-100">
                <img 
                  src={product.images[currentImageIndex]} 
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
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
                {product.videos.map((video, index) => (
                  <button
                    key={`video-${index}`}
                    className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center hover:border-blue-500 transition-colors"
                  >
                    <Play className="w-6 h-6 text-gray-600" />
                  </button>
                ))}
              </div>
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