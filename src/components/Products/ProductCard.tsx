import React, { useState } from 'react';
import { Play, Heart, Eye, Star } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Video Badge */}
        {product.videos.length > 0 && (
          <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg flex items-center text-xs">
            <Play className="w-3 h-3 mr-1" />
            视频
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium ${
          product.isAvailable 
            ? 'bg-green-100 text-green-600' 
            : 'bg-red-100 text-red-600'
        }`}>
          {product.isAvailable ? '在售' : '已售'}
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-2">
              <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                <Heart className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">4.8</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3">{product.breed}</p>

        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div className="flex items-center">
            <span className="text-gray-500">年龄:</span>
            <span className="ml-1 text-gray-800">{product.age}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500">性别:</span>
            <span className={`ml-1 ${product.gender === 'female' ? 'text-pink-600' : 'text-blue-600'}`}>
              {product.gender === 'female' ? '母' : '公'}
            </span>
          </div>
        </div>

        {/* Features */}
        {product.features.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {product.features.slice(0, 2).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                >
                  {feature}
                </span>
              ))}
              {product.features.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{product.features.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-red-600">¥{product.price.toLocaleString()}</span>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;