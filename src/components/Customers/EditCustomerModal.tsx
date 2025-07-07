import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Upload } from 'lucide-react';
import { Customer, CustomerFile } from '../../types';
import { SALES_STAFF } from '../../hooks/useDatabase'; 

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerId: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => void;
  onAddFile?: (customerId: string, fileData: Omit<CustomerFile, 'id' | 'uploadedAt'>) => Promise<void>;
  customer: Customer | null;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onAddFile,
  customer 
}) => {
  const [formData, setFormData] = useState({
    // 基本信息
    name: '',
    gender: 'female' as 'male' | 'female',
    phone: '',
    wechat: '',
    address: '',
    occupation: '',
    // 客户类型
    customerType: 'retail' as 'retail' | 'installment',
    // 零售客户特有字段
    orderDate: new Date().toISOString().split('T')[0],
    salesPerson: SALES_STAFF[0],
    catName: '',
    catBirthday: '',
    isMallMember: false,
    catBreed: '',
    catGender: 'female' as 'male' | 'female',
    supplyChain: '',
    supplyChainDeposit: 0,
    totalAmount: 0,
    paymentMethod: 'full' as 'full' | 'cod' | 'balance',
    customerDeposit: 0,
    depositDestination: '',
    shippingDate: '',
    shippingVideo: '',
    balance: 0,
    balancePaid: false,
    balanceConfirmMethod: '',
    sellingPrice: 0,
    cost: 0,
    shippingFee: 0,
    profit: 0,
    profitRate: 0,
    // 分期客户特有字段
    contractName: '',
    relationship: '',
    isInGroup: false,
    repaymentDate: '',
    installmentPeriod: '',
    catCost: 0,
    receivableAmount: 0,
    paymentDestination: '',
    installmentAmount: 0,
    installmentCount: 6,
    signingMethod: '',
    isFirstManualTransfer: false,
    hasESignContract: false,
    contractTotalPrice: 0,
    mallGrossProfit: 0,
    monthlyProfit: 0,
    breakEvenPeriod: 0,
    // 通用字段
    tags: [] as string[],
    notes: ''
  });

  // 文件上传相关状态
  const [fileType, setFileType] = useState<'image' | 'video' | 'document'>('image');
  const [fileDescription, setFileDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newTag, setNewTag] = useState('');
  const [fileUploadType, setFileUploadType] = useState<'image' | 'video' | 'document'>('image');
  const [files, setFiles] = useState<CustomerFile[]>([]);

  useEffect(() => {
    if (customer) {
      // 设置基本信息
      const customerType = customer.customerType || 'retail';
      
      // 根据客户类型设置不同的初始表单数据
      setFormData({
        // 基本信息
        name: customer.name,
        gender: customer.gender,
        phone: customer.phone,
        wechat: customer.wechat,
        address: customer.address,
        occupation: customer.occupation,
        // 客户类型 - 默认为零售客户
        customerType: customer.customerType || 'retail',
        // 零售客户特有字段
        orderDate: customer.orderDate || new Date().toISOString().split('T')[0],
        salesPerson: customer.salesPerson || SALES_STAFF[0],
        catName: customer.catName || '',
        catBirthday: customer.catBirthday || '',
        isMallMember: customer.isMallMember || false,
        catBreed: customer.catBreed || '',
        catGender: customer.catGender || 'female',
        supplyChain: customer.supplyChain || '',
        supplyChainDeposit: customer.supplyChainDeposit || 0,
        totalAmount: customer.totalAmount || 0,
        paymentMethod: customer.paymentMethod || 'full',
        customerDeposit: customer.customerDeposit || 0,
        depositDestination: customer.depositDestination || '',
        shippingDate: customer.shippingDate || '',
        shippingVideo: customer.shippingVideo || '',
        balance: customer.balance || 0,
        balancePaid: customer.balancePaid || false,
        balanceConfirmMethod: customer.balanceConfirmMethod || '',
        sellingPrice: customer.sellingPrice || 0,
        cost: customer.cost || 0,
        shippingFee: customer.shippingFee || 0,
        profit: customer.profit || 0,
        profitRate: customer.profitRate || 0,
        // 分期客户特有字段
        contractName: customer.contractName || '',
        relationship: customer.relationship || '',
        isInGroup: customer.isInGroup || false,
        repaymentDate: customer.repaymentDate || '',
        installmentPeriod: customer.installmentPeriod || '',
        catCost: customer.catCost || 0,
        receivableAmount: customer.receivableAmount || 0,
        paymentDestination: customer.paymentDestination || '',
        installmentAmount: customer.installmentAmount || 0,
        installmentCount: customer.installmentCount || 6,
        signingMethod: customer.signingMethod || '',
        isFirstManualTransfer: customer.isFirstManualTransfer || false,
        hasESignContract: customer.hasESignContract || false,
        contractTotalPrice: customer.contractTotalPrice || 0,
        mallGrossProfit: customer.mallGrossProfit || 0,
        monthlyProfit: customer.monthlyProfit || 0,
        breakEvenPeriod: customer.breakEvenPeriod || 0,
        // 通用字段
        tags: customer.tags || [],
        notes: customer.notes || ''
      });
    }
  }, [customer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customer) {
      onSave(customer.id, formData);
      onClose();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const file = selectedFiles[0];
      const fileUrl = URL.createObjectURL(file);

      if (customer && onAddFile) {
        onAddFile(customer.id, {
          name: file.name,
          type: fileUploadType,
          url: fileUrl,
          description: fileDescription
        }).then(() => {
          setFileDescription('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }).catch(error => {
          console.error('Failed to add file:', error);
          alert('添加文件失败，请重试');
        });
      }
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Upload className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Upload className="w-5 h-5 text-green-500" />;
      case 'document':
        return <Upload className="w-5 h-5 text-gray-500" />;
      default:
        return <Upload className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">编辑客户信息</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                性别
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="female">女</option>
                <option value="male">男</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                电话
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                微信
              </label>
              <input
                type="text"
                value={formData.wechat}
                onChange={(e) => setFormData(prev => ({ ...prev, wechat: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                地址
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                职业
              </label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                客户类型
              </label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData(prev => ({ ...prev, customerType: e.target.value as 'retail' | 'installment' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="retail">零售客户</option>
                <option value="installment">分期客户</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="添加标签"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="添加备注信息..."
            />
          </div>

          {/* File Upload Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">文件管理</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文件类型
                </label>
                <select
                  value={fileUploadType}
                  onChange={(e) => setFileUploadType(e.target.value as 'image' | 'video' | 'document')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="image">图片</option>
                  <option value="video">视频</option>
                  <option value="document">文档</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文件描述
                </label>
                <input
                  type="text"
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="描述文件内容"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择文件
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept={fileUploadType === 'image' ? 'image/*' : fileUploadType === 'video' ? 'video/*' : '*'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Display existing files */}
            {customer?.files && customer.files.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-2">已上传文件</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {customer.files.map((file) => (
                    <div key={file.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        {getFileTypeIcon(file.type)}
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                      {file.description && (
                        <p className="text-xs text-gray-600 mt-1">{file.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存更改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;