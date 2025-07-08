import React, { useState } from 'react';
import { X, Upload, Plus, Camera, Video, FileText } from 'lucide-react';
import { Customer } from '../../types';
import { SALES_STAFF } from '../../hooks/useDatabase'; 
import { CustomerFile } from '../../types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    // 基本信息
    customerType: 'retail' as 'retail' | 'installment',
    name: '',
    gender: 'female' as 'male' | 'female',
    phone: '',
    wechat: '',
    address: '',
    occupation: '',
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
    paymentMethod: 'full_payment' as 'full_payment' | 'shipping_balance' | 'cash_on_delivery',
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
    collectionAmount: 0,
    fundsDestination: '',
    installmentAmount: 0,
    installmentCount: 6,
    signingMethod: '',
    isFirstPaymentManual: false,
    hasESignContract: false,
    contractTotalPrice: 0,
    mallGrossProfit: 0,
    grossProfit: 0,
    monthlyProfit: 0,
    breakEvenPeriod: 0,
    // 通用字段
    tags: [] as string[],
    notes: '',
    assignedSales: SALES_STAFF[0]
  });

  // 文件上传相关状态
  const [files, setFiles] = useState<CustomerFile[]>([]);
  const [fileDescription, setFileDescription] = useState('');
  const [fileUploadType, setFileUploadType] = useState<'image' | 'video' | 'document'>('image');
  
  const [newTag, setNewTag] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 计算利润和利润率（零售客户）
    if (formData.customerType === 'retail') {
      const profit = formData.sellingPrice - formData.cost - formData.shippingFee;
      const profitRate = formData.sellingPrice > 0 ? (profit / formData.sellingPrice) * 100 : 0;
      
      onSave({
        ...formData,
        profit,
        profitRate
      });
    } else {
      // 计算分期客户的相关数据
      const monthlyProfit = formData.installmentCount > 0 ? formData.grossProfit / formData.installmentCount : 0;
      const breakEvenPeriod = formData.catCost > 0 && monthlyProfit > 0 ? Math.ceil(formData.catCost / monthlyProfit) : 0;
      
      onSave({
        ...formData,
        monthlyProfit,
        breakEvenPeriod
      });
    }
    
    // 重置表单
    const resetForm = {
      customerType: 'retail' as 'retail' | 'installment',
      name: '',
      gender: 'female' as 'male' | 'female',
      phone: '',
      wechat: '',
      address: '',
      occupation: '',
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
      paymentMethod: 'full_payment' as 'full_payment' | 'shipping_balance' | 'cash_on_delivery',
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
      contractName: '',
      relationship: '',
      isInGroup: false,
      repaymentDate: '',
      installmentPeriod: '',
      catCost: 0,
      collectionAmount: 0,
      fundsDestination: '',
      installmentAmount: 0,
      installmentCount: 6,
      signingMethod: '',
      isFirstPaymentManual: false,
      hasESignContract: false,
      contractTotalPrice: 0,
      mallGrossProfit: 0,
      grossProfit: 0,
      monthlyProfit: 0,
      breakEvenPeriod: 0,
      tags: [] as string[],
      notes: '',
      assignedSales: SALES_STAFF[0]
    };
    
    setFormData(resetForm);
    setFiles([]);
    onClose();
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

  // 计算零售客户的利润和利润率
  const calculateRetailProfit = () => {
    const profit = formData.sellingPrice - formData.cost - formData.shippingFee;
    const profitRate = formData.sellingPrice > 0 ? (profit / formData.sellingPrice) * 100 : 0;
    return { profit, profitRate: profitRate.toFixed(2) };
  };

  // 计算分期客户的月利润和回本期
  const calculateInstallmentProfit = () => {
    const monthlyProfit = formData.installmentCount > 0 ? formData.grossProfit / formData.installmentCount : 0;
    const breakEvenPeriod = formData.catCost > 0 && monthlyProfit > 0 ? Math.ceil(formData.catCost / monthlyProfit) : 0;
    return { monthlyProfit: monthlyProfit.toFixed(2), breakEvenPeriod };
  };

  // 当零售客户的价格相关字段变化时，自动计算利润和利润率
  React.useEffect(() => {
    if (formData.customerType === 'retail') {
      const { profit, profitRate } = calculateRetailProfit();
      setFormData(prev => ({
        ...prev,
        profit,
        profitRate: parseFloat(profitRate)
      }));
    }
  }, [formData.sellingPrice, formData.cost, formData.shippingFee]);

  // 当分期客户的相关字段变化时，自动计算月利润和回本期
  React.useEffect(() => {
    if (formData.customerType === 'installment') {
      const { monthlyProfit, breakEvenPeriod } = calculateInstallmentProfit();
      setFormData(prev => ({
        ...prev,
        monthlyProfit: parseFloat(monthlyProfit),
        breakEvenPeriod
      }));
    }
  }, [formData.grossProfit, formData.installmentCount, formData.catCost]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">新增客户</h2>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                地址
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入地址"
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

          {/* 零售客户特有字段 */}
          {formData.customerType === 'retail' && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">零售客户信息</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    订单日期
                  </label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫猫姓名
                  </label>
                  <input
                    type="text"
                    value={formData.catName}
                    onChange={(e) => setFormData(prev => ({ ...prev, catName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="猫咪名字"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫猫生日
                  </label>
                  <input
                    type="date"
                    value={formData.catBirthday}
                    onChange={(e) => setFormData(prev => ({ ...prev, catBirthday: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    是否商城会员
                  </label>
                  <select
                    value={formData.isMallMember ? 'yes' : 'no'}
                    onChange={(e) => setFormData(prev => ({ ...prev, isMallMember: e.target.value === 'yes' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="yes">是</option>
                    <option value="no">否</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪品种
                  </label>
                  <input
                    type="text"
                    value={formData.catBreed}
                    onChange={(e) => setFormData(prev => ({ ...prev, catBreed: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：英短银渐层"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪性别
                  </label>
                  <select
                    value={formData.catGender}
                    onChange={(e) => setFormData(prev => ({ ...prev, catGender: e.target.value as 'male' | 'female' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="female">妹妹</option>
                    <option value="male">弟弟</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    供应链
                  </label>
                  <input
                    type="text"
                    value={formData.supplyChain}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplyChain: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="供应商名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    供应链定金
                  </label>
                  <input
                    type="number"
                    value={formData.supplyChainDeposit}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplyChainDeposit: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    全款额度
                  </label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    付款方式
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="full_payment">全款</option>
                    <option value="shipping_balance">发货补尾款</option>
                    <option value="cash_on_delivery">货到付款</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    客户定金
                  </label>
                  <input
                    type="number"
                    value={formData.customerDeposit}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerDeposit: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
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
                    placeholder="例如：公司账户"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    尾款
                  </label>
                  <input
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    是否补齐
                  </label>
                  <select
                    value={formData.balancePaid ? 'yes' : 'no'}
                    onChange={(e) => setFormData(prev => ({ ...prev, balancePaid: e.target.value === 'yes' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="yes">是</option>
                    <option value="no">否</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    尾款确认方式
                  </label>
                  <input
                    type="text"
                    value={formData.balanceConfirmMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, balanceConfirmMethod: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：微信转账"
                  />
                </div>
              </div>
              
              {/* 财务信息 */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-800 mb-3">财务信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      卖价
                    </label>
                    <input
                      type="number"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      成本
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      运费
                    </label>
                    <input
                      type="number"
                      value={formData.shippingFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, shippingFee: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      利润
                    </label>
                    <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 font-medium">
                      ¥{calculateRetailProfit().profit.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      利润率
                    </label>
                    <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 font-medium">
                      {calculateRetailProfit().profitRate}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 分期客户特有字段 */}
          {formData.customerType === 'installment' && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">分期客户信息</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    订单日期
                  </label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪姓名
                  </label>
                  <input
                    type="text"
                    value={formData.catName}
                    onChange={(e) => setFormData(prev => ({ ...prev, catName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="猫咪名字"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="签约人姓名"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    关系
                  </label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：本人/父母"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：英短银渐层"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪性别
                  </label>
                  <select
                    value={formData.catGender}
                    onChange={(e) => setFormData(prev => ({ ...prev, catGender: e.target.value as 'male' | 'female' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="female">妹妹</option>
                    <option value="male">弟弟</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    是否拉群
                  </label>
                  <select
                    value={formData.isInGroup ? 'yes' : 'no'}
                    onChange={(e) => setFormData(prev => ({ ...prev, isInGroup: e.target.value === 'yes' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="yes">是</option>
                    <option value="no">否</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪生日
                  </label>
                  <input
                    type="date"
                    value={formData.catBirthday}
                    onChange={(e) => setFormData(prev => ({ ...prev, catBirthday: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="供应商名称"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    还款时间
                  </label>
                  <input
                    type="text"
                    value={formData.repaymentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, repaymentDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：每月15日"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分期时间范围
                  </label>
                  <input
                    type="text"
                    value={formData.installmentPeriod}
                    onChange={(e) => setFormData(prev => ({ ...prev, installmentPeriod: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：2024.6-2025.6"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    猫咪成本
                  </label>
                  <input
                    type="number"
                    value={formData.catCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, catCost: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    收款额度
                  </label>
                  <input
                    type="number"
                    value={formData.collectionAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, collectionAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    款项去向
                  </label>
                  <input
                    type="text"
                    value={formData.fundsDestination}
                    onChange={(e) => setFormData(prev => ({ ...prev, fundsDestination: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：公司账户"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分期金额
                  </label>
                  <input
                    type="number"
                    value={formData.installmentAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, installmentAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分期数
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
                    onChange={(e) => setFormData(prev => ({ ...prev, shippingFee: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
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
                    placeholder="例如：线上/线下"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    第一期是否手动转
                  </label>
                  <select
                    value={formData.isFirstPaymentManual ? 'yes' : 'no'}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFirstPaymentManual: e.target.value === 'yes' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="yes">是</option>
                    <option value="no">否</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    e签宝合同
                  </label>
                  <select
                    value={formData.hasESignContract ? 'yes' : 'no'}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasESignContract: e.target.value === 'yes' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="yes">已签</option>
                    <option value="no">未签</option>
                  </select>
                </div>
              </div>
              
              {/* 财务信息 */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-800 mb-3">财务信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      合约总价
                    </label>
                    <input
                      type="number"
                      value={formData.contractTotalPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, contractTotalPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      商城毛利
                    </label>
                    <input
                      type="number"
                      value={formData.mallGrossProfit}
                      onChange={(e) => setFormData(prev => ({ ...prev, mallGrossProfit: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      成本
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      毛利润
                    </label>
                    <input
                      type="number"
                      value={formData.grossProfit}
                      onChange={(e) => setFormData(prev => ({ ...prev, grossProfit: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      利润率
                    </label>
                    <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 font-medium">
                      {formData.contractTotalPrice > 0 ? ((formData.grossProfit / formData.contractTotalPrice) * 100).toFixed(2) : '0.00'}%
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      月毛利
                    </label>
                    <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 font-medium">
                      ¥{calculateInstallmentProfit().monthlyProfit}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      回本期
                    </label>
                    <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 font-medium">
                      {calculateInstallmentProfit().breakEvenPeriod} 期
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 标签管理 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">标签管理</h3>
            <div className="flex flex-wrap gap-2 mb-3">
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
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入标签名称"
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

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入备注信息"
            />
          </div>

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
              保存客户
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;