import React, { useState } from 'react';
import { Search, Filter, Calendar, Clock, CheckCircle, AlertTriangle, MessageSquare, Phone, User, RefreshCw, Plus, Edit, Trash2, Star, FileText, Tag } from 'lucide-react';
import { useOrders, useCustomers, useAfterSalesRecords, useServiceTemplates } from '../../hooks/useDatabase';
import { useAuth } from '../../context/AuthContext';
import { Order, AfterSalesRecord } from '../../types';
import AddAfterSalesModal from './AddAfterSalesModal';
import EditAfterSalesModal from './EditAfterSalesModal';
import AfterSalesDetail from './AfterSalesDetail';

const AfterSalesView: React.FC = () => {
  const { user } = useAuth();
  const { orders = [], loading: ordersLoading, error: ordersError } = useOrders();
  const { customers = [], loading: customersLoading } = useCustomers();
  const { afterSalesRecords = [], loading: recordsLoading, error: recordsError, addAfterSalesRecord, updateAfterSalesRecord, deleteAfterSalesRecord } = useAfterSalesRecords();
  const { serviceTemplates = [] } = useServiceTemplates();
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AfterSalesRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<AfterSalesRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<AfterSalesRecord | null>(null);

  // 安全的数组操作
  const safeOrders = orders || [];
  const safeCustomers = customers || [];
  const safeAfterSalesRecords = afterSalesRecords || [];

  // 获取已完成或已发货的订单（售后服务的主要对象）
  const afterSalesOrders = safeOrders.filter(order => 
    order.status === 'completed' || order.status === 'shipped'
  );

  // 根据筛选条件过滤售后记录
  const filteredRecords = safeAfterSalesRecords.filter(record => {
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesPriority = filterPriority === 'all' || record.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeCustomers.find(c => c.id === record.customerId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesPriority && matchesSearch;
  });

  // 获取状态标签样式
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'in_progress':
        return 'bg-blue-100 text-blue-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // 获取优先级标签样式
  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-600';
      case 'high':
        return 'bg-orange-100 text-orange-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-600';
      case 'low':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // 获取服务类型图标
  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'phone_visit':
        return <Phone className="w-4 h-4" />;
      case 'health_consultation':
        return <MessageSquare className="w-4 h-4" />;
      case 'home_service':
        return <User className="w-4 h-4" />;
      case 'complaint':
        return <AlertTriangle className="w-4 h-4" />;
      case 'feedback':
        return <Star className="w-4 h-4" />;
      case 'maintenance':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  // 获取服务类型文本
  const getServiceTypeText = (type: string) => {
    const typeMap = {
      'phone_visit': '电话回访',
      'health_consultation': '健康咨询',
      'home_service': '上门服务',
      'complaint': '投诉处理',
      'feedback': '客户反馈',
      'maintenance': '维护服务'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap = {
      'pending': '待处理',
      'in_progress': '处理中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  // 获取优先级文本
  const getPriorityText = (priority: string) => {
    const priorityMap = {
      'low': '低',
      'medium': '中',
      'high': '高',
      'urgent': '紧急'
    };
    return priorityMap[priority as keyof typeof priorityMap] || priority;
  };

  const handleAddRecord = async (recordData: Omit<AfterSalesRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addAfterSalesRecord(recordData);
      setShowAddModal(false);
    } catch (error) {
      console.error('添加售后记录失败:', error);
      alert('添加售后记录失败，请重试');
    }
  };

  const handleEditRecord = (record: AfterSalesRecord) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const handleUpdateRecord = async (recordId: string, recordData: Partial<AfterSalesRecord>) => {
    try {
      await updateAfterSalesRecord(recordId, recordData);
      setShowEditModal(false);
      setEditingRecord(null);
      // 如果当前选中的记录被更新了，也要更新选中状态
      if (selectedRecord?.id === recordId) {
        const updatedRecord = safeAfterSalesRecords.find(r => r.id === recordId);
        if (updatedRecord) {
          setSelectedRecord(updatedRecord);
        }
      }
    } catch (error) {
      console.error('更新售后记录失败:', error);
      alert('更新售后记录失败，请重试');
    }
  };

  const handleDeleteRecord = (record: AfterSalesRecord) => {
    setRecordToDelete(record);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteRecord = async () => {
    if (recordToDelete) {
      try {
        await deleteAfterSalesRecord(recordToDelete.id);
        setShowDeleteConfirm(false);
        setRecordToDelete(null);
        // 如果删除的是当前选中的记录，清除选择
        if (selectedRecord?.id === recordToDelete.id) {
          setSelectedRecord(null);
        }
      } catch (error) {
        console.error('删除售后记录失败:', error);
        alert('删除售后记录失败，请重试');
      }
    }
  };

  const handleViewDetail = (record: AfterSalesRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  if (ordersLoading || customersLoading || recordsLoading) {
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
      {(ordersError || recordsError) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">数据加载警告</p>
              <p className="text-yellow-700 text-sm">
                售后服务数据加载失败: {ordersError || recordsError}。显示的是模拟数据。
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
              placeholder="搜索标题、描述或客户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="pending">待处理</option>
              <option value="in_progress">处理中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部类型</option>
              <option value="phone_visit">电话回访</option>
              <option value="health_consultation">健康咨询</option>
              <option value="home_service">上门服务</option>
              <option value="complaint">投诉处理</option>
              <option value="feedback">客户反馈</option>
              <option value="maintenance">维护服务</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部优先级</option>
              <option value="urgent">紧急</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建服务记录
          </button>
        </div>
      </div>

      {/* 售后服务统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">总服务记录</p>
          <p className="text-2xl font-bold text-gray-800">{safeAfterSalesRecords.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">待处理</p>
          <p className="text-2xl font-bold text-yellow-600">
            {safeAfterSalesRecords.filter(record => record.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">处理中</p>
          <p className="text-2xl font-bold text-blue-600">
            {safeAfterSalesRecords.filter(record => record.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">已完成</p>
          <p className="text-2xl font-bold text-green-600">
            {safeAfterSalesRecords.filter(record => record.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* 售后服务记录列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">服务记录列表</h3>
        </div>
        
        <div className="overflow-x-auto">
          {filteredRecords.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    服务信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客户
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    优先级
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    负责人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => {
                  const customer = safeCustomers.find(c => c.id === record.customerId);
                  const order = safeOrders.find(o => o.id === record.orderId);
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">{record.description}</div>
                          {order && (
                            <div className="text-xs text-blue-600 mt-1">订单: {order.orderNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{customer?.name || '未知客户'}</div>
                        <div className="text-sm text-gray-500">{customer?.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getServiceTypeIcon(record.type)}
                          <span className="ml-2 text-sm text-gray-900">{getServiceTypeText(record.type)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeStyle(record.priority)}`}>
                          {getPriorityText(record.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(record.status)}`}>
                          {getStatusText(record.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.assignedTo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetail(record)}
                            className="text-blue-600 hover:text-blue-900"
                            title="查看详情"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="text-green-600 hover:text-green-900"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record)}
                            className="text-red-600 hover:text-red-900"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无售后服务记录</h3>
              <p className="text-gray-600 mb-4">
                还没有创建任何售后服务记录
              </p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                创建第一个服务记录
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 新建售后记录模态框 */}
      <AddAfterSalesModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddRecord}
        orders={afterSalesOrders}
        customers={safeCustomers}
        serviceTemplates={serviceTemplates}
        currentUser={user}
      />

      {/* 编辑售后记录模态框 */}
      <EditAfterSalesModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingRecord(null);
        }}
        onSave={handleUpdateRecord}
        record={editingRecord}
        orders={afterSalesOrders}
        customers={safeCustomers}
        serviceTemplates={serviceTemplates}
      />

      {/* 售后记录详情模态框 */}
      <AfterSalesDetail
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        customer={selectedRecord ? safeCustomers.find(c => c.id === selectedRecord.customerId) : null}
        order={selectedRecord ? safeOrders.find(o => o.id === selectedRecord.orderId) : null}
        onEdit={handleEditRecord}
      />

      {/* 删除确认模态框 */}
      {showDeleteConfirm && recordToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">确认删除服务记录</h3>
                <p className="text-sm text-gray-600">此操作无法撤销</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                您确定要删除服务记录 <span className="font-semibold">"{recordToDelete.title}"</span> 吗？
              </p>
              <p className="text-sm text-gray-500 mt-2">
                删除后，此服务记录将从系统中永久移除。
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRecordToDelete(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteRecord}
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

export default AfterSalesView;