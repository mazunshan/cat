import React, { useState, useEffect } from 'react';
import { X, Plus, Camera, Video, FileText, Upload } from 'lucide-react';
import { Customer, CustomerFile } from '../../types';
import { SALES_STAFF } from '../../hooks/useDatabase'; 

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerId: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => void;
  customer: Customer | null;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ isOpen, onClose, onSave, customer }) => {
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

  const [newTag, setNewTag] = useState('');
  
  // 文件上传相关状态
  const [files, setFiles] = useState<CustomerFile[]>([]);
  const [fileUploadType, setFileUploadType] = useState<'image' | 'video' | 'document'>('image');
  const [fileDescription, setFileDescription] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customer) {
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
        tags: [...customer.tags],
        notes: customer.notes
      });
    } else {
      // 重置表单
      setFormData({
        ...formData,
        customerType: 'retail'
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

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      selectedFiles.forEach(file => {
        const fileUrl = URL.createObjectURL(file);
        const newFile: CustomerFile = {
          id: Date.now().toString() + Math.random().toString(36).substring(2),
          name: file.name,
          type: fileUploadType,
          url: fileUrl,
          description: fileDescription,
          uploadedAt: new Date().toISOString()
        };
        
        setFiles(prev => [...prev, newFile]);
      });
      
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFileDescription('');
    }
  };

  // 删除已选择的文件
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // 获取文件类型图标
  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Camera className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-green-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-gray-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
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
          {/* 客户类型选择 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-md font-semibold text-blue-800 mb-3">客户类型</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.customerType === 'retail'}
                  onChange={() => setFormData(prev => ({ ...prev, customerType: 'retail' }))}
                  className="mr-2"
                />
                <span className="text-gray-700">零售客户</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.customerType === 'installment'}
                  onChange={() => setFormData(prev => ({ ...prev, customerType: 'installment' }))}
                  className="mr-2"
                />
                <span className="text-gray-700">分期客户</span>
              </label>
            </div>
          </div>

          {/* 备注信息 */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">备注信息</h3>
      
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="请输入客户备注信息"
            />
           </div>
       


          
          
          {/* 基本信息 */}
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">基本信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                客户姓名 *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入客户姓名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性别
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="female">女</option>
                <option value="male">男</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系电话 *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入联系电话"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                微信号
              </label>
              <input
                type="text"
                value={formData.wechat}
                onChange={(e) => setFormData(prev => ({ ...prev, wechat: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入微信号"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                地址
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入详细地址"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                职业
              </label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入职业"
              />
            </div>
          </div>

          {/* 销售信息 - 根据客户类型显示不同字段 */}
          {formData.customerType === 'retail' ? (
            <>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-6">零售客户信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    订单日期
                  </label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    销售员
                  </label>
                  <select
                    value={formData.salesPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, salesPerson: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {SALES_STAFF.map(salesperson => (
                      <option key={salesperson} value={salesperson}>
                        {salesperson}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪姓名
                  </label>
                  <input
                    type="text"
                    value={formData.catName}
                    onChange={(e) => setFormData(prev => ({ ...prev, catName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入猫咪姓名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪生日
                  </label>
                  <input
                    type="date"
                    value={formData.catBirthday}
                    onChange={(e) => setFormData(prev => ({ ...prev, catBirthday: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪品种
                  </label>
                  <input
                    type="text"
                    value={formData.catBreed}
                    onChange={(e) => setFormData(prev => ({ ...prev, catBreed: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入猫咪品种"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪性别
                  </label>
                  <select
                    value={formData.catGender}
                    onChange={(e) => setFormData(prev => ({ ...prev, catGender: e.target.value as 'male' | 'female' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="female">妹妹</option>
                    <option value="male">弟弟</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    是否商城会员
                  </label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={formData.isMallMember}
                      onChange={(e) => setFormData(prev => ({ ...prev, isMallMember: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">是商城会员</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    供应链
                  </label>
                  <input
                    type="text"
                    value={formData.supplyChain}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplyChain: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入供应链"
                  />
                </div>
              </div>
              
              {/* 付款信息 */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-gray-800 mb-3">付款信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      供应链定金
                    </label>
                    <input
                      type="number"
                      value={formData.supplyChainDeposit}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplyChainDeposit: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      全款额度
                    </label>
                    <input
                      type="number"
                      value={formData.totalAmount}
                      onChange={(e) => {
                        const totalAmount = Number(e.target.value);
                        const cost = formData.cost;
                        const shippingFee = formData.shippingFee;
                        const profit = totalAmount - cost - shippingFee;
                        const profitRate = cost > 0 ? (profit / cost) * 100 : 0;
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          totalAmount,
                          profit,
                          profitRate
                        }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      付款方式
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as 'full' | 'cod' | 'balance' }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="full">全款</option>
                      <option value="balance">发货补尾款</option>
                      <option value="cod">货到付款</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      客户定金
                    </label>
                    <input
                      type="number"
                      value={formData.customerDeposit}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerDeposit: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      定金去向
                    </label>
                    <input
                      type="text"
                      value={formData.depositDestination}
                      onChange={(e) => setFormData(prev => ({ ...prev, depositDestination: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入定金去向"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      发货时间
                    </label>
                    <input
                      type="date"
                      value={formData.shippingDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, shippingDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {formData.paymentMethod !== 'full' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          尾款
                        </label>
                        <input
                          type="number"
                          value={formData.balance}
                          onChange={(e) => setFormData(prev => ({ ...prev, balance: Number(e.target.value) }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          是否补齐
                        </label>
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            checked={formData.balancePaid}
                            onChange={(e) => setFormData(prev => ({ ...prev, balancePaid: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-gray-700">已补齐</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          尾款确认方式
                        </label>
                        <input
                          type="text"
                          value={formData.balanceConfirmMethod}
                          onChange={(e) => setFormData(prev => ({ ...prev, balanceConfirmMethod: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="请输入确认方式"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* 财务信息 */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-gray-800 mb-3">财务信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      卖价
                    </label>
                    <input
                      type="number"
                      value={formData.sellingPrice}
                      onChange={(e) => {
                        const sellingPrice = Number(e.target.value);
                        const cost = formData.cost;
                        const shippingFee = formData.shippingFee;
                        const profit = sellingPrice - cost - shippingFee;
                        const profitRate = cost > 0 ? (profit / cost) * 100 : 0;
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          sellingPrice,
                          profit,
                          profitRate
                        }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      成本
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => {
                        const cost = Number(e.target.value);
                        const sellingPrice = formData.sellingPrice;
                        const shippingFee = formData.shippingFee;
                        const profit = sellingPrice - cost - shippingFee;
                        const profitRate = cost > 0 ? (profit / cost) * 100 : 0;
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          cost,
                          profit,
                          profitRate
                        }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      运费
                    </label>
                    <input
                      type="number"
                      value={formData.shippingFee}
                      onChange={(e) => {
                        const shippingFee = Number(e.target.value);
                        const sellingPrice = formData.sellingPrice;
                        const cost = formData.cost;
                        const profit = sellingPrice - cost - shippingFee;
                        const profitRate = cost > 0 ? (profit / cost) * 100 : 0;
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          shippingFee,
                          profit,
                          profitRate
                        }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      利润
                    </label>
                    <input
                      type="number"
                      value={formData.profit}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      利润率
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={formData.profitRate.toFixed(2)}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-6">分期客户信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    订单日期
                  </label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    销售员
                  </label>
                  <select
                    value={formData.salesPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, salesPerson: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {SALES_STAFF.map(salesperson => (
                      <option key={salesperson} value={salesperson}>
                        {salesperson}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪姓名
                  </label>
                  <input
                    type="text"
                    value={formData.catName}
                    onChange={(e) => setFormData(prev => ({ ...prev, catName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入猫咪姓名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    签约姓名
                  </label>
                  <input
                    type="text"
                    value={formData.contractName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入签约人姓名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    关系
                  </label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入与签约人关系"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪品种
                  </label>
                  <input
                    type="text"
                    value={formData.catBreed}
                    onChange={(e) => setFormData(prev => ({ ...prev, catBreed: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入猫咪品种"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪性别
                  </label>
                  <select
                    value={formData.catGender}
                    onChange={(e) => setFormData(prev => ({ ...prev, catGender: e.target.value as 'male' | 'female' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="female">妹妹</option>
                    <option value="male">弟弟</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    是否拉群
                  </label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={formData.isInGroup}
                      onChange={(e) => setFormData(prev => ({ ...prev, isInGroup: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">已拉群</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪生日
                  </label>
                  <input
                    type="date"
                    value={formData.catBirthday}
                    onChange={(e) => setFormData(prev => ({ ...prev, catBirthday: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    供应链
                  </label>
                  <input
                    type="text"
                    value={formData.supplyChain}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplyChain: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入供应链"
                  />
                </div>
              </div>
              
              {/* 分期付款信息 */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-gray-800 mb-3">分期付款信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      还款时间 *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required={formData.customerType === 'installment'}
                        value={formData.repaymentDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, repaymentDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">选择每月还款日期</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      分期时间范围
                    </label>
                    <input
                      type="text"
                      required={formData.customerType === 'installment'}
                      value={formData.installmentPeriod}
                      onChange={(e) => setFormData(prev => ({ ...prev, installmentPeriod: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：2024.5-2024.11"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      猫咪成本
                    </label>
                    <input
                      type="number"
                      value={formData.catCost}
                      onChange={(e) => {
                        const catCost = Number(e.target.value);
                        const contractTotalPrice = formData.contractTotalPrice;
                        const shippingFee = formData.shippingFee;
                        const mallGrossProfit = contractTotalPrice - catCost - shippingFee;
                        const profitRate = catCost > 0 ? (mallGrossProfit / catCost) * 100 : 0;
                        const monthlyProfit = formData.installmentCount > 0 ? mallGrossProfit / formData.installmentCount : 0;
                        const breakEvenPeriod = mallGrossProfit > 0 ? Math.ceil(catCost / monthlyProfit) : 0;
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          catCost,
                          mallGrossProfit,
                          profitRate,
                          monthlyProfit,
                          breakEvenPeriod
                        }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      收款额度
                    </label>
                    <input
                      type="number"
                      value={formData.receivableAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, receivableAmount: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      款项去向
                    </label>
                    <input
                      type="text"
                      value={formData.paymentDestination}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentDestination: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入款项去向"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      分期金额
                    </label>
                    <input
                      type="number"
                      value={formData.installmentAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, installmentAmount: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      分期数 *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.installmentCount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, installmentCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入分期数"
                      required={formData.customerType === 'installment'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      运费
                    </label>
                    <input
                      type="number"
                      value={formData.shippingFee}
                      onChange={(e) => {
                        const shippingFee = Number(e.target.value);
                        const contractTotalPrice = formData.contractTotalPrice;
                        const catCost = formData.catCost;
                        const mallGrossProfit = contractTotalPrice - catCost - shippingFee;
                        const profitRate = catCost > 0 ? (mallGrossProfit / catCost) * 100 : 0;
                        const installmentCount = formData.installmentCount;
                        const monthlyProfit = installmentCount > 0 ? mallGrossProfit / installmentCount : 0;
                        const breakEvenPeriod = monthlyProfit > 0 ? Math.ceil(catCost / monthlyProfit) : 0;
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          shippingFee,
                          mallGrossProfit,
                          profitRate,
                          monthlyProfit,
                          breakEvenPeriod
                        }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      签约方式
                    </label>
                    <input
                      type="text"
                      value={formData.signingMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, signingMethod: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入签约方式"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      第一期是否手动转
                    </label>
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={formData.isFirstManualTransfer}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFirstManualTransfer: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">是</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      e签宝合同
                    </label>
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={formData.hasESignContract}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasESignContract: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">已签</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 财务信息 */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-gray-800 mb-3">财务信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      合约总价
                    </label>
                    <input
                      type="number"
                      value={formData.contractTotalPrice}
                      onChange={(e) => {
                        const contractTotalPrice = Number(e.target.value);
                        const catCost = formData.catCost;
                        const shippingFee = formData.shippingFee;
                        const mallGrossProfit = contractTotalPrice - catCost - shippingFee;
                        const profitRate = catCost > 0 ? (mallGrossProfit / catCost) * 100 : 0;
                        const installmentCount = formData.installmentCount;
                        const monthlyProfit = installmentCount > 0 ? mallGrossProfit / installmentCount : 0;
                        const breakEvenPeriod = monthlyProfit > 0 ? Math.ceil(catCost / monthlyProfit) : 0;
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          contractTotalPrice,
                          mallGrossProfit,
                          profitRate,
                          monthlyProfit,
                          breakEvenPeriod
                        }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      商城毛利
                    </label>
                    <input
                      type="number"
                      value={formData.mallGrossProfit}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      成本
                    </label>
                    <input
                      type="number"
                      value={formData.catCost}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      毛利润
                    </label>
                    <input
                      type="number"
                      value={formData.mallGrossProfit}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      利润率
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={formData.profitRate.toFixed(2)}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      月毛利
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyProfit.toFixed(2)}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      回本期
                    </label>
                    <input
                      type="number"
                      value={formData.breakEvenPeriod}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 客户标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              客户标签
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入标签"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-400 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

           {/* 文件上传 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">文件上传</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文件类型
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={fileUploadType === 'image'}
                    onChange={() => setFileUploadType('image')}
                    className="mr-2"
                  />
                  <Camera className="w-4 h-4 mr-1" />
                  <span className="text-gray-700">图片</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={fileUploadType === 'video'}
                    onChange={() => setFileUploadType('video')}
                    className="mr-2"
                  />
                  <Video className="w-4 h-4 mr-1" />
                  <span className="text-gray-700">视频</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={fileUploadType === 'document'}
                    onChange={() => setFileUploadType('document')}
                    className="mr-2"
                  />
                  <FileText className="w-4 h-4 mr-1" />
                  <span className="text-gray-700">文档</span>
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文件描述
              </label>
              <input
                type="text"
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入文件描述（可选）"
              />
            </div>
            
            <div className="flex space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept={fileUploadType === 'image' ? 'image/*' : fileUploadType === 'video' ? 'video/*' : '*/*'}
                id="customer-file-input"
              />
              <label 
                htmlFor="customer-file-input"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                选择{fileUploadType === 'image' ? '图片' : fileUploadType === 'video' ? '视频' : '文档'}
              </label>
            </div>
            
            {/* 已选择的文件列表 */}
            {files.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-sm font-medium text-gray-700">已选择的文件：</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center bg-gray-50 rounded-lg p-3 group">
                      {getFileTypeIcon(file.type)}
                      <div className="ml-3 flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                        {file.description && (
                          <p className="text-xs text-gray-500 truncate">{file.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;