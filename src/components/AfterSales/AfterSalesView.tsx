import React, { useState } from 'react';
import { Search, Filter, Calendar, Clock, CheckCircle, AlertTriangle, MessageSquare, Phone, User, RefreshCw } from 'lucide-react';
import { useOrders, useCustomers } from '../../hooks/useDatabase';
import { Order } from '../../types';

const AfterSalesView: React.FC = () => {
  const { orders = [], loading: ordersLoading, error: ordersError } = useOrders();
  const { customers = [], loading: customersLoading } = useCustomers();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 安全的数组操作
  const safeOrders = orders || [];
  const safeCustomers = customers || [];

  // 获取已完成或已发货的订单（售后服务的主要对象）
  const afterSalesOrders = safeOrders.filter(order => 
    order.status === 'completed' || order.status === 'shipped'
  );

  // 根据筛选条件过滤订单
  const filteredOrders = afterSalesOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeCustomers.find(c => c.id === order.customerId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeCustomers.find(c => c.id === order.customerId)?.phone.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'recent' && new Date(order.orderDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (filterStatus === 'completed' && order.status === 'completed') ||
      (filterStatus === 'shipped' && order.status === 'shipped');
    
    return matchesSearch && matchesFilter;
  });

  // 模拟售后服务记录
  const afterSalesRecords = [
    { 
      id: '1', 
      orderId: afterSalesOrders[0]?.id || '1',
      type: '电话回访',
      status: 'completed',
      date: '2024-06-15',
      notes: '客户反馈猫咪适应良好，无特殊问题',
      agent: 'David Zhang'
    },
    { 
      id: '2', 
      orderId: afterSalesOrders[1]?.id || '2',
      type: '健康咨询',
      status: 'pending',
      date: '2024-06-20',
      notes: '客户咨询猫咪饮食问题，已提供专业建议',
      agent: 'David Zhang'
    },
    { 
      id: '3', 
      orderId: afterSalesOrders[0]?.id || '1',
      type: '上门检查',
      status: 'scheduled',
      date: '2024-06-25',
      notes: '预约上门检查猫咪健康状况',
      agent: 'David Zhang'
    }
  ];

  // 获取订单对应的售后记录
  const getOrderAfterSalesRecords = (orderId: string) => {
    return afterSalesRecords.filter(record => record.orderId === orderId);
  };

  // 获取状态标签样式
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'shipped':
        return 'bg-blue-100 text-blue-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'scheduled':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // 获取售后服务类型图标
  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case '电话回访':
        return <Phone className="w-4 h-4" />;
      case '健康咨询':
        return <MessageSquare className="w-4 h-4" />;
      case '上门检查':
        return <User className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (ordersLoading || customersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载售后服务数据...</p>
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
                售后服务数据加载失败: {ordersError}。显示的是模拟数据。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">售后服务管理</h2>
        
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
              <option value="all">全部订单</option>
              <option value="recent">最近30天</option>
              <option value="completed">已完成</option>
              <option value="shipped">已发货</option>
            </select>
          </div>
        </div>
      </div>

      {/* 售后服务统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">售后服务总数</p>
          <p className="text-2xl font-bold text-gray-800">{afterSalesRecords.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">已完成</p>
          <p className="text-2xl font-bold text-green-600">
            {afterSalesRecords.filter(record => record.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">待处理</p>
          <p className="text-2xl font-bold text-yellow-600">
            {afterSalesRecords.filter(record => record.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">已预约</p>
          <p className="text-2xl font-bold text-purple-600">
            {afterSalesRecords.filter(record => record.status === 'scheduled').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 订单列表 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">售后服务订单</h3>
          
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const customer = safeCustomers.find(c => c.id === order.customerId);
              const orderAfterSalesRecords = getOrderAfterSalesRecords(order.id);
              
              return (
                <div
                  key={order.id}
                  className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer ${
                    selectedOrder?.id === order.id ? 'border-blue-300 ring-2 ring-blue-100' : ''
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">{order.orderNumber}</h4>
                      <p className="text-sm text-gray-600">{customer?.name || '未知客户'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {order.status === 'completed' ? '已完成' : '已发货'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">联系电话</p>
                      <p className="font-medium">{customer?.phone || '无'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">订单日期</p>
                      <p className="font-medium">{new Date(order.orderDate).toLocaleDateString('zh-CN')}</p>
                    </div>
                  </div>

                  {/* 售后服务记录摘要 */}
                  {orderAfterSalesRecords.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-2">售后记录 ({orderAfterSalesRecords.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {orderAfterSalesRecords.map((record) => (
                          <span 
                            key={record.id}
                            className={`px-2 py-1 text-xs rounded-full flex items-center ${getStatusBadgeStyle(record.status)}`}
                          >
                            {getServiceTypeIcon(record.type)}
                            <span className="ml-1">{record.type}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无售后服务订单</h3>
              <p className="text-gray-600 mb-4">
                {filterStatus === 'all' 
                  ? '目前没有需要售后服务的订单' 
                  : `没有符合"${filterStatus === 'recent' ? '最近30天' : filterStatus === 'completed' ? '已完成' : '已发货'}"条件的订单`}
              </p>
            </div>
          )}
        </div>

        {/* 售后服务详情 */}
        <div>
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">售后服务详情</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedOrder.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {selectedOrder.status === 'completed' ? '已完成' : '已发货'}
                  </span>
                </div>

                {/* 订单基本信息 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
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
                    <p className="text-sm text-gray-600">联系电话</p>
                    <p className="font-medium">
                      {safeCustomers.find(c => c.id === selectedOrder.customerId)?.phone || '无'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">微信</p>
                    <p className="font-medium">
                      {safeCustomers.find(c => c.id === selectedOrder.customerId)?.wechat || '无'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">订单日期</p>
                    <p className="font-medium">
                      {new Date(selectedOrder.orderDate).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">销售人员</p>
                    <p className="font-medium">{selectedOrder.salesPerson}</p>
                  </div>
                </div>

                {/* 产品信息 */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">产品信息</h4>
                  <div className="space-y-3">
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
                      </div>
                    ))}
                  </div>
                </div>

                {/* 售后服务记录 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800">售后服务记录</h4>
                    <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      刷新
                    </button>
                  </div>

                  {getOrderAfterSalesRecords(selectedOrder.id).length > 0 ? (
                    <div className="space-y-4">
                      {getOrderAfterSalesRecords(selectedOrder.id).map((record) => (
                        <div key={record.id} className={`p-4 rounded-lg border ${
                          record.status === 'completed' ? 'bg-green-50 border-green-200' :
                          record.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-purple-50 border-purple-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              {record.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600 mr-2" />}
                              {record.status === 'pending' && <Clock className="w-4 h-4 text-yellow-600 mr-2" />}
                              {record.status === 'scheduled' && <Calendar className="w-4 h-4 text-purple-600 mr-2" />}
                              <span className="font-medium text-gray-800">{record.type}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeStyle(record.status)}`}>
                              {record.status === 'completed' ? '已完成' : 
                               record.status === 'pending' ? '待处理' : '已预约'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{record.notes}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>处理人: {record.agent}</span>
                            <span>{record.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">暂无售后服务记录</p>
                    </div>
                  )}
                </div>

                {/* 添加售后记录按钮 */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Phone className="w-4 h-4 mr-2" />
                      记录电话回访
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Calendar className="w-4 h-4 mr-2" />
                      安排上门服务
                    </button>
                  </div>
                </div>
              </div>

              {/* 客户反馈表单 */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">客户反馈</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      反馈类型
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">请选择反馈类型</option>
                      <option value="question">咨询问题</option>
                      <option value="complaint">投诉</option>
                      <option value="suggestion">建议</option>
                      <option value="praise">表扬</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      反馈内容
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="请输入客户反馈内容..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      处理结果
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="请输入处理结果..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      保存反馈
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeadphonesIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">售后服务中心</h3>
              <p className="text-gray-600">选择一个订单查看售后服务详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 导入缺失的图标
function HeadphonesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 14h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2c0-4.95 3.13-9.22 7.48-10.6" />
      <path d="M21 14h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2c0-4.95-3.13-9.22-7.48-10.6" />
      <path d="M12 4C9.56 4 7.46 5.07 6 7" />
      <path d="M18 7a6.38 6.38 0 0 0-6 0" />
    </svg>
  );
}

export default AfterSalesView;