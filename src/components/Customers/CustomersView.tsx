import React, { useState } from 'react';
import { Plus, Filter, Download, AlertTriangle, Search } from 'lucide-react';
import CustomerCard from './CustomerCard';
import CustomerDetail from './CustomerDetail';
import AddCustomerModal from './AddCustomerModal';
import EditCustomerModal from './EditCustomerModal';
import { useCustomers, useCustomerFiles, SALES_STAFF } from '../../hooks/useDatabase';
import { Customer, CustomerFile } from '../../types';

const CustomersView: React.FC = () => {
  const { customers, loading, error, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [filterTag, setFilterTag] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // 安全的数组操作
  const safeCustomers = Array.isArray(customers) ? customers : [];
  
  const allTags = ['all', ...Array.from(new Set(safeCustomers.flatMap(c => c.tags || [])))];

  const filteredCustomers = safeCustomers.filter(c => {
    const matchesTag = filterTag === 'all' || (c.tags || []).includes(filterTag);
    
    const matchesSearch = searchTerm === '' || 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.wechat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTag && matchesSearch;
  });

  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    try {
      await addCustomer(customerData);
    } catch (error) {
      console.error('Failed to add customer:', error);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

  const handleUpdateCustomer = async (customerId: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => {
    try {
      await updateCustomer(customerId, customerData);
      setShowEditModal(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCustomer = async () => {
    if (customerToDelete) {
      try {
        await deleteCustomer(customerToDelete.id);
        setShowDeleteConfirm(false);
        setCustomerToDelete(null);
        // 如果删除的是当前选中的客户，清除选择
        if (selectedCustomer?.id === customerToDelete.id) {
          setSelectedCustomer(null);
        }
      } catch (error) {
        console.error('Failed to delete customer:', error);
      }
    }
  };

  const handleAddCustomerFile = async (customerId: string, fileData: Omit<CustomerFile, 'id' | 'uploadedAt'>) => {
    try {
      const newFile = await addCustomerFile(customerId, fileData);
      
      // 更新选中的客户，以便立即显示新文件
      if (selectedCustomer && selectedCustomer.id === customerId) {
        setSelectedCustomer({
          ...selectedCustomer,
          files: [...selectedCustomer.files, newFile]
        });
      }
    } catch (error) {
      console.error('Failed to add customer file:', error);
      alert('添加文件失败，请重试');
    }
  };

  const handleExportData = () => {
    if (safeCustomers.length === 0) {
      alert('暂无客户数据可导出');
      return;
    }

    const csvContent = [
      ['姓名', '性别', '电话', '微信', '地址', '职业', '销售员', '创建时间'].join(','),
      ...safeCustomers.map(customer => [
        customer.name || '',
        customer.gender === 'female' ? '女' : '男',
        customer.phone || '',
        customer.wechat || '',
        customer.address || '',
        customer.occupation || '',
        customer.assignedSales || '',
        customer.createdAt || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `客户数据_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">加载客户数据失败: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增客户
          </button>
          <button 
            onClick={handleExportData}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索客户姓名、电话..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {allTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag === 'all' ? '全部标签' : tag}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">总客户数</p>
          <p className="text-2xl font-bold text-gray-800">{safeCustomers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">本月新增</p>
          <p className="text-2xl font-bold text-green-600">
            {safeCustomers.filter(c => {
              const createdDate = new Date(c.createdAt);
              const now = new Date();
              return createdDate.getMonth() === now.getMonth() && 
                     createdDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onClick={() => setSelectedCustomer(customer)}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无客户数据</h3>
            <p className="text-gray-600 mb-4">
              {filterTag === 'all' ? '还没有添加任何客户' : `没有找到标签为"${filterTag}"的客户`}
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加第一个客户
            </button>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onAddFile={handleAddCustomerFile}
        />
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddCustomer}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={showEditModal}
        onAddFile={handleAddCustomerFile}
        onClose={() => {
          setShowEditModal(false);
          setEditingCustomer(null);
        }}
        onSave={handleUpdateCustomer}
        customer={editingCustomer}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && customerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">确认删除客户</h3>
                <p className="text-sm text-gray-600">此操作无法撤销</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                您确定要删除客户 <span className="font-semibold">{customerToDelete.name}</span> 吗？
              </p>
              <p className="text-sm text-gray-500 mt-2">
                删除客户将同时删除其相关的所有订单和文件记录。
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCustomerToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteCustomer}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

export default CustomersView;