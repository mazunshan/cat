import React, { useState } from 'react';
import { Plus, Filter, Grid, List, AlertTriangle, Trash2 } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductDetail from './ProductDetail';
import AddProductModal from './AddProductModal';
import { useProducts } from '../../hooks/useDatabase';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';

const ProductsView: React.FC = () => {
  const { user } = useAuth();
  const { products = [], loading, error, addProduct, deleteProduct } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterBreed, setFilterBreed] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // 安全的数组操作
  const safeProducts = products || [];

  const breeds = ['all', ...Array.from(new Set(safeProducts.map(p => p.breed).filter(Boolean)))];

  const filteredProducts = filterBreed === 'all' 
    ? safeProducts 
    : safeProducts.filter(p => p.breed === filterBreed);

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      await addProduct(productData);
    } catch (error) {
      console.error('Failed to add product:', error);
      alert((error as Error).message || '添加产品失败，请重试');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        setShowDeleteConfirm(false);
        setProductToDelete(null);
        // 如果删除的是当前选中的产品，清除选择
        if (selectedProduct?.id === productToDelete.id) {
          setSelectedProduct(null);
        }
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert((error as Error).message || '删除产品失败，请重试');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载产品数据...</p>
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
                产品数据加载失败: {error}。显示的是模拟数据。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* 只有管理员可以添加产品 */}
          {user?.role === 'admin' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加产品
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <select
              value={filterBreed}
              onChange={(e) => setFilterBreed(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {breeds.map(breed => (
                <option key={breed} value={breed}>
                  {breed === 'all' ? '全部品种' : breed}
                </option>
              ))}
            </select>
          </div>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">总产品数</p>
          <p className="text-2xl font-bold text-gray-800">{safeProducts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">在售产品</p>
          <p className="text-2xl font-bold text-green-600">
            {safeProducts.filter(p => p.isAvailable).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">已售产品</p>
          <p className="text-2xl font-bold text-red-600">
            {safeProducts.filter(p => !p.isAvailable).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">平均价格</p>
          <p className="text-2xl font-bold text-blue-600">
            ¥{safeProducts.length > 0 ? Math.round(safeProducts.reduce((sum, p) => sum + (p.price || 0), 0) / safeProducts.length / 1000) : 0}k
          </p>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      }>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
              {/* 只有管理员可以删除产品 */}
              {user?.role === 'admin' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProduct(product);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="删除产品"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无产品数据</h3>
            <p className="text-gray-600 mb-4">
              {filterBreed === 'all' ? '还没有添加任何产品' : `没有找到品种为"${filterBreed}"的产品`}
            </p>
            {user?.role === 'admin' && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                添加第一个产品
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Add Product Modal - 只有管理员可以看到 */}
      {user?.role === 'admin' && (
        <AddProductModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddProduct}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">确认删除产品</h3>
                <p className="text-sm text-gray-600">此操作无法撤销</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                您确定要删除产品 <span className="font-semibold">{productToDelete.name}</span> 吗？
              </p>
              <p className="text-sm text-gray-500 mt-2">
                删除产品后，相关的订单记录将保留，但产品信息将不再可用。
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProductToDelete(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteProduct}
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

export default ProductsView;