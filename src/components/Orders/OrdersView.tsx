import React, { useState } from 'react';
import { Plus, Filter, Download, Search, Eye, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import InstallmentProgress from './InstallmentProgress';
import AddOrderModal from './AddOrderModal';
import EditOrderModal from './EditOrderModal';
import { useOrders, useCustomers, useProducts } from '../../hooks/useDatabase';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';

const OrdersView: React.FC = () => {
  const { user } = useAuth();
  const { orders = [], loading: ordersLoading, error: ordersError, addOrder, updateOrder, deleteOrder } = useOrders();
  const { customers = [], loading: customersLoading } = useCustomers();
  const { products = [], loading: productsLoading } = useProducts();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // 安全的数组操作
  const safeOrders = orders || [];
  const safeCustomers = customers || [];
  const safeProducts = products || [];

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'pending_payment', label: '待付款' },
    { value: 'paid', label: '已付款' },
    { value: 'pending_shipment', label: '待发货' },
    { value: 'shipped', label: '已发货' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      pending_payment: 'bg-yellow-100 text-yellow-600',
      paid: 'bg-blue-100 text-blue-600',
      pending_shipment: 'bg-purple-100 text-purple-600',
      shipped: 'bg-indigo-100 text-indigo-600',
      completed: 'bg-green-100 text-green-600',
      cancelled: 'bg-red-100 text-red-600'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const filteredOrders = safeOrders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeCustomers.find(c => c.id === order.customerId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAddOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>) => {
    try {
      await addOrder(orderData);
    } catch (error) {
      console.error('Failed to add order:', error);
      alert('添加订单失败，请重试');
    }
  };

  const handleEditOrder = (order: Order) => {
    // 检查权限
    if (user?.role !== 'admin' && order.salesPerson !== user?.name) {
      alert('您没有权限编辑此订单');
      return;
    }
    
    setEditingOrder(order);
    setShowEditModal(true);
  };

  const handleUpdateOrder = async (orderId: string, orderData: Partial<Order>) => {
    try {
      await updateOrder(orderId, orderData);
      setShowEditModal(false);
      setEditingOrder(null);
      
      // 如果当前选中的订单被更新了，也要更新选中状态
      if (selectedOrder?.id === orderId) {
        const updatedOrder = safeOrders.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      alert((error as Error).message || '更新订单失败，请重试');
    }
  };

  const handleDeleteOrder = (order: Order) => {
    // 检查权限
    if (user?.role !== 'admin' && order.salesPerson !== user?.name) {
      alert('您没有权限删除此订单');
      return;
    }
    
    setOrderToDelete(order);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteOrder = async () => {
    if (orderToDelete) {
      try {
        await deleteOrder(orderToDelete.id);
        setShowDeleteConfirm(false);
        setOrderToDelete(null);
        
        // 如果删除的是当前选中的订单，清除选择
        if (selectedOrder?.id === orderToDelete.id) {
          setSelectedOrder(null);
        }
      } catch (error) {
        console.error('Failed to delete order:', error);
        alert((error as Error).message || '删除订单失败，请重试');
      }
    }
  };

  const handleExportOrders = () => {
    if (safeOrders.length === 0) {
      alert('暂无订单数据可导出');
      return;
    }

    const csvContent = [
      ['订单号', '客户', '金额', '付款方式', '状态', '销售员', '订单日期'].join(','),
      ...safeOrders.map(order => {
        const customer = safeCustomers.find(c => c.id === order.customerId);
        return [
          order.orderNumber || '',
          customer?.name || '',
          order.amount || 0,
          order.paymentMethod === 'full' ? '全款' : '分期',
          statusOptions.find(s => s.value === order.status)?.label || '',
          order.salesPerson || '',
          order.orderDate || ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `订单数据_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (ordersLoading || customersLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载订单数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {ordersError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">数据加载警告</p>
              <p className="text-yellow-700 text-sm">
                订单数据加载失败: {ordersError}。显示的是模拟数据。
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
            新建订单
          </button>
          <button 
            onClick={handleExportOrders}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            导出订单
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索订单号或客户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">总订单数</p>
          <p className="text-2xl font-bold text-gray-800">{safeOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">本月订单</p>
          <p className="text-2xl font-bold text-blue-600">
            {safeOrders.filter(o => {
              const orderDate = new Date(o.orderDate);
              const now = new Date();
              return orderDate.getMonth() === now.getMonth() && 
                     orderDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">总销售额</p>
          <p className="text-2xl font-bold text-green-600">
            ¥{(safeOrders.reduce((sum, o) => sum + (o.amount || 0), 0) / 10000).toFixed(1)}万
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">分期订单</p>
          <p className="text-2xl font-bold text-orange-600">
            {safeOrders.filter(o => o.paymentMethod === 'installment').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">订单列表</h3>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const customer = safeCustomers.find(c => c.id === order.customerId);
              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">{order.orderNumber}</h4>
                      <p className="text-sm text-gray-600">{customer?.name || '未知客户'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {statusOptions.find(s => s.value === order.status)?.label}
                      </span>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOrder(order);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑订单"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除订单"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">订单金额</p>
                      <p className="font-bold text-lg text-gray-800">¥{(order.amount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">付款方式</p>
                      <p className="font-medium text-gray-800">
                        {order.paymentMethod === 'full' ? '全款' : '分期'}
                      </p>
                    </div>
                  </div>

                  {order.paymentMethod === 'installment' && order.installmentPlan && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600 font-medium">分期进度</span>
                        <span className="text-sm text-blue-600">
                          {order.installmentPlan.paidInstallments} / {order.installmentPlan.totalInstallments}
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${((order.installmentPlan.paidInstallments || 0) / (order.installmentPlan.totalInstallments || 1)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>销售: {order.salesPerson}</span>
                    <span>{new Date(order.orderDate).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无订单数据</h3>
              <p className="text-gray-600 mb-4">
                {filterStatus === 'all' ? '还没有创建任何订单' : `没有找到状态为"${statusOptions.find(s => s.value === filterStatus)?.label}"的订单`}
              </p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                创建第一个订单
              </button>
            </div>
          )}
        </div>

        {/* Order Detail / Installment Progress */}
        <div>
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">订单详情</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">订单编号</p>
                      <p className="font-medium">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">客户</p>
                      <p className="font-medium">
                        {safeCustomers.find(c => c.id === selectedOrder.customerId)?.name || '未知客户'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">销售人员</p>
                      <p className="font-medium">{selectedOrder.salesPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">订单日期</p>
                      <p className="font-medium">
                        {new Date(selectedOrder.orderDate).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">商品信息</p>
                    {(selectedOrder.products || []).map((product) => (
                      <div key={product.id} className="flex items-center bg-gray-50 rounded-lg p-3">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.breed}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">¥{(product.price || 0).toLocaleString()}</p>
                          <p className="text-sm text-gray-600">×{product.quantity || 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEditOrder(selectedOrder)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      disabled={user?.role !== 'admin' && selectedOrder.salesPerson !== user?.name}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      编辑订单
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(selectedOrder)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      disabled={user?.role !== 'admin' && selectedOrder.salesPerson !== user?.name}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除订单
                    </button>
                  </div>
                </div>
              </div>

              {selectedOrder.paymentMethod === 'installment' && selectedOrder.installmentPlan && (
                <InstallmentProgress installmentPlan={selectedOrder.installmentPlan} />
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">选择订单查看详情</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Order Modal */}
      <AddOrderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddOrder}
        customers={safeCustomers}
        products={safeProducts}
      />

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingOrder(null);
        }}
        onSave={handleUpdateOrder}
        order={editingOrder}
        customers={safeCustomers}
        products={safeProducts}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">确认删除订单</h3>
                <p className="text-sm text-gray-600">此操作无法撤销</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                您确定要删除订单 <span className="font-semibold">{orderToDelete.orderNumber}</span> 吗？
              </p>
              <p className="text-sm text-gray-500 mt-2">
                删除后，此订单将从系统中永久移除。
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setOrderToDelete(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteOrder}
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

export default OrdersView;