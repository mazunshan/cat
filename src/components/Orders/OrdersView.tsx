import React, { useState } from 'react';
import { Plus, Filter, Download, Search, Eye, AlertTriangle } from 'lucide-react';
import InstallmentProgress from './InstallmentProgress';
import AddOrderModal from './AddOrderModal';
import { useOrders, useCustomers, useProducts } from '../../hooks/useDatabase';
import { Order } from '../../types';

const OrdersView: React.FC = () => {
  const { orders = [], loading: ordersLoading, error: ordersError, addOrder } = useOrders();
  const { customers = [], loading: customersLoading } = useCustomers();
  const { products = [], loading: productsLoading } = useProducts();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

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
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
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
                      <button className="p-1 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
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
    </div>
  );
};

export default OrdersView;