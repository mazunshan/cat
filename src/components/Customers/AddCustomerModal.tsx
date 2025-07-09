import React, { useState } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import { Customer } from '../../types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onSave }) => {
  const [customerType, setCustomerType] = useState<'retail' | 'installment'>('retail');
  const [formData, setFormData] = useState({
    // 基本信息
    name: '',
    gender: 'female' as 'male' | 'female',
    phone: '',
    wechat: '',
    address: '',
    occupation: '',
    tags: [] as string[],
    notes: '',
    assignedSales: '',
    
    // 零售客户字段
    orderDate: '',
    salesPerson: '',
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
    shippingVideoUrl: '',
    balance: 0,
    balancePaid: false,
    balanceConfirmMethod: '',
    sellingPrice: 0,
    cost: 0,
    shippingFee: 0,
    profit: 0,
    profitRate: 0,
    
    // 分期客户字段
    contractName: '',
    relationship: '',
    isInGroup: false,
    repaymentDate: '',
    installmentPeriod: '',
    catCost: 0,
    collectionAmount: 0,
    fundsDestination: '',
    installmentAmount: 0,
    installmentCount: 0,
    signingMethod: '',
    isFirstPaymentManual: false,
    hasESignContract: false,
    contractTotalPrice: 0,
    mallGrossProfit: 0,
    grossProfit: 0,
    monthlyProfit: 0,
    breakEvenPeriod: 0
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert('请填写客户姓名和电话');
      return;
    }

    // 计算利润和利润率
    let calculatedData = { ...formData };
    
    if (customerType === 'retail') {
      const profit = formData.sellingPrice - formData.cost - formData.shippingFee;
      const profitRate = formData.sellingPrice > 0 ? (profit / formData.sellingPrice) * 100 : 0;
      calculatedData.profit = profit;
      calculatedData.profitRate = profitRate;
    } else {
      const grossProfit = formData.contractTotalPrice - formData.catCost - formData.shippingFee;
      const profitRate = formData.contractTotalPrice > 0 ? (grossProfit / formData.contractTotalPrice) * 100 : 0;
      calculatedData.grossProfit = grossProfit;
      calculatedData.profitRate = profitRate;
      
      // 计算月毛利
      if (formData.installmentCount > 0) {
        calculatedData.monthlyProfit = grossProfit / formData.installmentCount;
      }
    }

    const customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'> = {
      ...calculatedData,
      customerType,
      installmentPayments: customerType === 'installment' ? generateInstallmentPayments() : undefined
    };

    onSave(customerData);
    resetForm();
    onClose();
  };

  // 生成分期还款记录
  const generateInstallmentPayments = () => {
    if (customerType !== 'installment' || !formData.installmentCount || !formData.repaymentDate) {
      return [];
    }

    const payments = [];
    const baseDate = new Date(formData.repaymentDate);
    
    for (let i = 1; i <= formData.installmentCount; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      
      payments.push({
        id: `payment-${i}`,
        installmentNumber: i,
        amount: formData.installmentAmount,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending' as const
      });
    }
    
    return payments;
  };

  const resetForm = () => {
    setCustomerType('retail');
    setFormData({
      name: '',
      gender: 'female',
      phone: '',
      wechat: '',
      address: '',
      occupation: '',
      tags: [],
      notes: '',
      assignedSales: '',
      orderDate: '',
      salesPerson: '',
      catName: '',
      catBirthday: '',
      isMallMember: false,
      catBreed: '',
      catGender: 'female',
      supplyChain: '',
      supplyChainDeposit: 0,
      totalAmount: 0,
      paymentMethod: 'full_payment',
      customerDeposit: 0,
      depositDestination: '',
      shippingDate: '',
      shippingVideoUrl: '',
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
      installmentCount: 0,
      signingMethod: '',
      isFirstPaymentManual: false,
      hasESignContract: false,
      contractTotalPrice: 0,
      mallGrossProfit: 0,
      grossProfit: 0,
      monthlyProfit: 0,
      breakEvenPeriod: 0
    });
    setNewTag('');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, shippingVideoUrl: url }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">新增客户</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 客户类型选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">客户类型 *</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="retail"
                  checked={customerType === 'retail'}
                  onChange={(e) => setCustomerType(e.target.value as 'retail' | 'installment')}
                  className="mr-2"
                />
                <span>零售客户</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="installment"
                  checked={customerType === 'installment'}
                  onChange={(e) => setCustomerType(e.target.value as 'retail' | 'installment')}
                  className="mr-2"
                />
                <span>分期客户</span>
              </label>
            </div>
          </div>

          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">客户姓名 *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">电话 *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">客户微信</label>
              <input
                type="text"
                value={formData.wechat}
                onChange={(e) => setFormData(prev => ({ ...prev, wechat: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">地址</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">销售员</label>
              <input
                type="text"
                value={customerType === 'retail' ? formData.salesPerson : formData.assignedSales}
                onChange={(e) => {
                  if (customerType === 'retail') {
                    setFormData(prev => ({ ...prev, salesPerson: e.target.value }));
                  } else {
                    setFormData(prev => ({ ...prev, assignedSales: e.target.value }));
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 猫咪信息 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">猫咪信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">猫咪姓名</label>
                <input
                  type="text"
                  value={formData.catName}
                  onChange={(e) => setFormData(prev => ({ ...prev, catName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">猫咪生日</label>
                <input
                  type="date"
                  value={formData.catBirthday}
                  onChange={(e) => setFormData(prev => ({ ...prev, catBirthday: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">猫咪品种</label>
                <input
                  type="text"
                  value={formData.catBreed}
                  onChange={(e) => setFormData(prev => ({ ...prev, catBreed: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">猫咪性别</label>
                <select
                  value={formData.catGender}
                  onChange={(e) => setFormData(prev => ({ ...prev, catGender: e.target.value as 'male' | 'female' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="female">妹妹</option>
                  <option value="male">弟弟</option>
                </select>
              </div>
            </div>
          </div>

          {/* 零售客户特有字段 */}
          {customerType === 'retail' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">零售客户信息</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">订单日期</label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">供应链</label>
                  <input
                    type="text"
                    value={formData.supplyChain}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplyChain: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">付款方式</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="full_payment">全款</option>
                    <option value="shipping_balance">发货补尾款</option>
                    <option value="cash_on_delivery">货到付款</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">供应链定金</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.supplyChainDeposit}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplyChainDeposit: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">全款额度</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">客户定金</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.customerDeposit}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerDeposit: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">尾款</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">定金去向</label>
                  <input
                    type="text"
                    value={formData.depositDestination}
                    onChange={(e) => setFormData(prev => ({ ...prev, depositDestination: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">发货时间</label>
                  <input
                    type="date"
                    value={formData.shippingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, shippingDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">尾款确认方式</label>
                  <input
                    type="text"
                    value={formData.balanceConfirmMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, balanceConfirmMethod: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">发货视频</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isMallMember}
                    onChange={(e) => setFormData(prev => ({ ...prev, isMallMember: e.target.checked }))}
                    className="mr-2"
                  />
                  <span>是否是商城会员</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.balancePaid}
                    onChange={(e) => setFormData(prev => ({ ...prev, balancePaid: e.target.checked }))}
                    className="mr-2"
                  />
                  <span>尾款是否补齐</span>
                </label>
              </div>

              {/* 财务信息 */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">财务信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">卖价</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">成本</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">运费</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.shippingFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, shippingFee: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">利润</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.sellingPrice - formData.cost - formData.shippingFee}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">利润率(%)</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.sellingPrice > 0 ? (((formData.sellingPrice - formData.cost - formData.shippingFee) / formData.sellingPrice) * 100).toFixed(2) : 0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 分期客户特有字段 */}
          {customerType === 'installment' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">分期客户信息</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">订单日期</label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">签约姓名</label>
                  <input
                    type="text"
                    value={formData.contractName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">关系</label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">供应链</label>
                  <input
                    type="text"
                    value={formData.supplyChain}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplyChain: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">还款时间</label>
                  <input
                    type="date"
                    value={formData.repaymentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, repaymentDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">分期时间范围</label>
                  <input
                    type="text"
                    value={formData.installmentPeriod}
                    onChange={(e) => setFormData(prev => ({ ...prev, installmentPeriod: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="如：2024年1月-2024年12月"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">猫咪成本</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.catCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, catCost: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">收款额度</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.collectionAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, collectionAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">分期金额</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.installmentAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, installmentAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">分期数</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.installmentCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, installmentCount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">款项去向</label>
                  <input
                    type="text"
                    value={formData.fundsDestination}
                    onChange={(e) => setFormData(prev => ({ ...prev, fundsDestination: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">运费</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.shippingFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, shippingFee: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">签约方式</label>
                  <input
                    type="text"
                    value={formData.signingMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, signingMethod: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isInGroup}
                    onChange={(e) => setFormData(prev => ({ ...prev, isInGroup: e.target.checked }))}
                    className="mr-2"
                  />
                  <span>是否拉群</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFirstPaymentManual}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFirstPaymentManual: e.target.checked }))}
                    className="mr-2"
                  />
                  <span>第一期是否手动转</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hasESignContract}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasESignContract: e.target.checked }))}
                    className="mr-2"
                  />
                  <span>e签宝合同已签</span>
                </label>
              </div>

              {/* 财务信息 */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">财务信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">合约总价</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.contractTotalPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, contractTotalPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">商城毛利</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.mallGrossProfit}
                      onChange={(e) => setFormData(prev => ({ ...prev, mallGrossProfit: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">成本</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.catCost}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">毛利润</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.contractTotalPrice - formData.catCost - formData.shippingFee}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">利润率(%)</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.contractTotalPrice > 0 ? (((formData.contractTotalPrice - formData.catCost - formData.shippingFee) / formData.contractTotalPrice) * 100).toFixed(2) : 0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">月毛利</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.installmentCount > 0 ? ((formData.contractTotalPrice - formData.catCost - formData.shippingFee) / formData.installmentCount).toFixed(2) : 0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">回本期</label>
                    <input
                      type="number"
                      value={formData.breakEvenPeriod}
                      onChange={(e) => setFormData(prev => ({ ...prev, breakEvenPeriod: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 标签和备注 */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">备注信息</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="请输入备注信息"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
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