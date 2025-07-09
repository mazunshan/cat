import React, { useState } from 'react';
import { X, Upload, Calendar } from 'lucide-react';
import { Customer, InstallmentPayment } from '../../types';
import { SALES_STAFF } from '../../hooks/useDatabase';

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
  const [installmentPayments, setInstallmentPayments] = useState<InstallmentPayment[]>([]);

  // 生成分期还款计划
  const generateInstallmentPayments = () => {
    if (customerType !== 'installment' || !formData.installmentCount || !formData.installmentAmount) {
      return;
    }

    const payments: InstallmentPayment[] = [];
    const startDate = new Date(formData.repaymentDate || new Date());
    
    for (let i = 1; i <= formData.installmentCount; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      
      payments.push({
        id: `payment-${i}`,
        installmentNumber: i,
        amount: formData.installmentAmount,
        dueDate: dueDate.toISOString().split('T')[0],
        isPaid: false,
        isOverdue: false
      });
    }
    
    setInstallmentPayments(payments);
  };

  // 当分期相关字段变化时重新生成还款计划
  React.useEffect(() => {
    if (customerType === 'installment') {
      generateInstallmentPayments();
    }
  }, [formData.installmentCount, formData.installmentAmount, formData.repaymentDate, customerType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert('请填写客户姓名和电话');
      return;
    }

    const customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'> = {
      ...formData,
      customerType,
      assignedSales: formData.salesPerson,
      installmentPayments: customerType === 'installment' ? installmentPayments : undefined
    };

    onSave(customerData);
    resetForm();
    onClose();
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
    setInstallmentPayments([]);
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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 这里应该上传到服务器，现在只是模拟
      const videoUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, shippingVideoUrl: videoUrl }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">添加客户</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">订单日期</label>
              <input
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">销售员</label>
              <select
                value={formData.salesPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, salesPerson: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">请选择销售员</option>
                {SALES_STAFF.map(staff => (
                  <option key={staff} value={staff}>{staff}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 猫咪信息 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">猫咪信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">供应链</label>
                <input
                  type="text"
                  value={formData.supplyChain}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplyChain: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {customerType === 'retail' && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isMallMember}
                      onChange={(e) => setFormData(prev => ({ ...prev, isMallMember: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">是否是商城会员</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 零售客户特有字段 */}
          {customerType === 'retail' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">零售客户信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">发货视频</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
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

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.balancePaid}
                      onChange={(e) => setFormData(prev => ({ ...prev, balancePaid: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">是否补齐</span>
                  </label>
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

              {/* 财务信息 */}
              <h4 className="text-md font-semibold text-gray-800 mt-6 mb-4">财务信息</h4>
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
                    min="0"
                    step="0.01"
                    value={formData.profit}
                    onChange={(e) => setFormData(prev => ({ ...prev, profit: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">利润率 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.profitRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, profitRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 分期客户特有字段 */}
          {customerType === 'installment' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">分期客户信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isInGroup}
                      onChange={(e) => setFormData(prev => ({ ...prev, isInGroup: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">是否拉群</span>
                  </label>
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
                    placeholder="例如：2024年1月-2024年12月"
                  />
                </div>

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
                  <label className="block text-sm font-medium text-gray-700 mb-2">款项去向</label>
                  <input
                    type="text"
                    value={formData.fundsDestination}
                    onChange={(e) => setFormData(prev => ({ ...prev, fundsDestination: e.target.value }))}
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

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFirstPaymentManual}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFirstPaymentManual: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">第一期是否手动转</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">e签宝合同</label>
                  <select
                    value={formData.hasESignContract ? 'signed' : 'unsigned'}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasESignContract: e.target.value === 'signed' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="unsigned">未签</option>
                    <option value="signed">已签</option>
                  </select>
                </div>
              </div>

              {/* 分期财务信息 */}
              <h4 className="text-md font-semibold text-gray-800 mt-6 mb-4">财务信息</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">毛利润</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.grossProfit}
                    onChange={(e) => setFormData(prev => ({ ...prev, grossProfit: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">利润率 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.profitRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, profitRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">月毛利</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthlyProfit}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyProfit: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">回本期</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.breakEvenPeriod}
                    onChange={(e) => setFormData(prev => ({ ...prev, breakEvenPeriod: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 分期还款计划 */}
              {installmentPayments.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">还款计划</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {installmentPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={payment.isPaid}
                          onChange={(e) => {
                            const updatedPayments = installmentPayments.map(p =>
                              p.id === payment.id ? { ...p, isPaid: e.target.checked } : p
                            );
                            setInstallmentPayments(updatedPayments);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">第{payment.installmentNumber}期</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    添加
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
                  placeholder="输入备注信息"
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