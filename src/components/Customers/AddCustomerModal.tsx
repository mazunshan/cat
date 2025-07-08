import React, { useState } from 'react';
import { X, Plus, Calendar, User, Phone, MapPin, MessageCircle, Briefcase, Tag, CreditCard, Percent, DollarSign, Truck, Building, Check } from 'lucide-react';
import { Customer } from '../../types';
import { SALES_STAFF } from '../../hooks/useDatabase';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onSave }) => {
  const [customerType, setCustomerType] = useState<'retail' | 'installment'>('retail');
  const [formData, setFormData] = useState({
    name: '',
    gender: 'female' as 'male' | 'female',
    phone: '',
    wechat: '',
    address: '',
    occupation: '',
    tags: [] as string[],
    notes: '',
    assignedSales: SALES_STAFF[0],
    
    // 零售客户字段
    orderDate: '',
    salesPerson: SALES_STAFF[0],
    catName: '',
    catBirthday: '',
    isMallMember: false,
    catBreed: '',
    catGender: 'female' as 'male' | 'female',
    supplyChain: '',
    supplyChainDeposit: 0,
    totalAmount: 0,
    paymentMethod: 'full' as 'full' | 'shipping_balance' | 'cash_on_delivery',
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
    installmentCount: 6,
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

    const customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'> = {
      name: formData.name,
      gender: formData.gender,
      phone: formData.phone,
      wechat: formData.wechat,
      address: formData.address,
      occupation: formData.occupation,
      tags: formData.tags,
      notes: formData.notes,
      assignedSales: formData.assignedSales,
      customerType
    };

    // 根据客户类型添加相应字段
    if (customerType === 'retail') {
      Object.assign(customerData, {
        orderDate: formData.orderDate,
        salesPerson: formData.salesPerson,
        catName: formData.catName,
        catBirthday: formData.catBirthday,
        isMallMember: formData.isMallMember,
        catBreed: formData.catBreed,
        catGender: formData.catGender,
        supplyChain: formData.supplyChain,
        supplyChainDeposit: formData.supplyChainDeposit,
        totalAmount: formData.totalAmount,
        paymentMethod: formData.paymentMethod,
        customerDeposit: formData.customerDeposit,
        depositDestination: formData.depositDestination,
        shippingDate: formData.shippingDate,
        shippingVideo: formData.shippingVideo,
        balance: formData.balance,
        balancePaid: formData.balancePaid,
        balanceConfirmMethod: formData.balanceConfirmMethod,
        sellingPrice: formData.sellingPrice,
        cost: formData.cost,
        shippingFee: formData.shippingFee,
        profit: formData.profit,
        profitRate: formData.profitRate
      });
    } else {
      Object.assign(customerData, {
        orderDate: formData.orderDate,
        salesPerson: formData.salesPerson,
        catName: formData.catName,
        contractName: formData.contractName,
        relationship: formData.relationship,
        catBreed: formData.catBreed,
        catGender: formData.catGender,
        isInGroup: formData.isInGroup,
        catBirthday: formData.catBirthday,
        supplyChain: formData.supplyChain,
        repaymentDate: formData.repaymentDate,
        installmentPeriod: formData.installmentPeriod,
        catCost: formData.catCost,
        collectionAmount: formData.collectionAmount,
        fundsDestination: formData.fundsDestination,
        installmentAmount: formData.installmentAmount,
        installmentCount: formData.installmentCount,
        shippingFee: formData.shippingFee,
        signingMethod: formData.signingMethod,
        isFirstPaymentManual: formData.isFirstPaymentManual,
        hasESignContract: formData.hasESignContract,
        contractTotalPrice: formData.contractTotalPrice,
        mallGrossProfit: formData.mallGrossProfit,
        cost: formData.cost,
        grossProfit: formData.grossProfit,
        profitRate: formData.profitRate,
        monthlyProfit: formData.monthlyProfit,
        breakEvenPeriod: formData.breakEvenPeriod
      });
    }

    onSave(customerData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gender: 'female',
      phone: '',
      wechat: '',
      address: '',
      occupation: '',
      tags: [],
      notes: '',
      assignedSales: SALES_STAFF[0],
      
      // 零售客户字段
      orderDate: '',
      salesPerson: SALES_STAFF[0],
      catName: '',
      catBirthday: '',
      isMallMember: false,
      catBreed: '',
      catGender: 'female',
      supplyChain: '',
      supplyChainDeposit: 0,
      totalAmount: 0,
      paymentMethod: 'full',
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
      installmentCount: 6,
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
    setCustomerType('retail');
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

  // 计算利润和利润率
  const calculateProfit = () => {
    if (customerType === 'retail') {
      const profit = formData.sellingPrice - formData.cost - formData.shippingFee;
      const profitRate = formData.sellingPrice > 0 ? (profit / formData.sellingPrice) * 100 : 0;
      
      setFormData(prev => ({
        ...prev,
        profit,
        profitRate: Math.round(profitRate * 100) / 100
      }));
    } else {
      const grossProfit = formData.contractTotalPrice - formData.cost - formData.shippingFee;
      const profitRate = formData.contractTotalPrice > 0 ? (grossProfit / formData.contractTotalPrice) * 100 : 0;
      const monthlyProfit = formData.installmentCount > 0 ? grossProfit / formData.installmentCount : 0;
      const breakEvenPeriod = formData.cost > 0 && monthlyProfit > 0 ? Math.ceil(formData.cost / monthlyProfit) : 0;
      
      setFormData(prev => ({
        ...prev,
        grossProfit,
        profitRate: Math.round(profitRate * 100) / 100,
        monthlyProfit: Math.round(monthlyProfit * 100) / 100,
        breakEvenPeriod
      }));
    }
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        shippingVideo: fileUrl
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">添加客户</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 客户类型选择 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">客户类型</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={customerType === 'retail'}
                  onChange={() => setCustomerType('retail')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">零售客户</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={customerType === 'installment'}
                  onChange={() => setCustomerType('installment')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">分期客户</span>
              </label>
            </div>
          </div>

          {/* 基本信息 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h3>
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
                  电话 *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入电话号码"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  微信
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  销售员
                </label>
                <select
                  value={formData.assignedSales}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedSales: e.target.value, salesPerson: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {SALES_STAFF.map(staff => (
                    <option key={staff} value={staff}>{staff}</option>
                  ))}
                </select>
              </div>

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
            </div>
          </div>

          {/* 猫咪信息 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">猫咪信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <select
                  value={formData.catBreed}
                  onChange={(e) => setFormData(prev => ({ ...prev, catBreed: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择品种</option>
                  <option value="英国短毛猫">英国短毛猫</option>
                  <option value="布偶猫">布偶猫</option>
                  <option value="波斯猫">波斯猫</option>
                  <option value="暹罗猫">暹罗猫</option>
                  <option value="美国短毛猫">美国短毛猫</option>
                  <option value="苏格兰折耳猫">苏格兰折耳猫</option>
                  <option value="缅因猫">缅因猫</option>
                  <option value="俄罗斯蓝猫">俄罗斯蓝猫</option>
                </select>
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
          </div>

          {/* 零售客户特有字段 */}
          {customerType === 'retail' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">零售客户信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    是否商城会员
                  </label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={formData.isMallMember}
                      onChange={(e) => setFormData(prev => ({ ...prev, isMallMember: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">是</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    供应链定金
                  </label>
                  <input
                    type="number"
                    value={formData.supplyChainDeposit}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplyChainDeposit: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入供应链定金"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    全款额度
                  </label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入全款额度"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    付款方式
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as 'full' | 'shipping_balance' | 'cash_on_delivery' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="full">全款</option>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, customerDeposit: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入客户定金"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    发货视频
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    尾款
                  </label>
                  <input
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData(prev => ({ ...prev, balance: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入尾款"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    尾款是否补齐
                  </label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={formData.balancePaid}
                      onChange={(e) => setFormData(prev => ({ ...prev, balancePaid: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">是</span>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入尾款确认方式"
                  />
                </div>
              </div>

              {/* 财务信息 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">财务信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      卖价
                    </label>
                    <input
                      type="number"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                      onBlur={calculateProfit}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入卖价"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      成本
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                      onBlur={calculateProfit}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入成本"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      运费
                    </label>
                    <input
                      type="number"
                      value={formData.shippingFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, shippingFee: Number(e.target.value) }))}
                      onBlur={calculateProfit}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入运费"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      利润率
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={formData.profitRate}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 分期客户特有字段 */}
          {customerType === 'installment' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">分期客户信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    签约姓名
                  </label>
                  <input
                    type="text"
                    value={formData.contractName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入签约姓名"
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
                    placeholder="请输入关系"
                  />
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
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">是</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    还款时间
                  </label>
                  <input
                    type="text"
                    value={formData.repaymentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, repaymentDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：每月15号"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    onChange={(e) => setFormData(prev => ({ ...prev, catCost: Number(e.target.value) }))}
                    onBlur={calculateProfit}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入猫咪成本"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    收款额度
                  </label>
                  <input
                    type="number"
                    value={formData.collectionAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, collectionAmount: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入收款额度"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入分期金额"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分期数
                  </label>
                  <select
                    value={formData.installmentCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, installmentCount: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="3">3期</option>
                    <option value="6">6期</option>
                    <option value="12">12期</option>
                    <option value="24">24期</option>
                    <option value="36">36期</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    运费
                  </label>
                  <input
                    type="number"
                    value={formData.shippingFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, shippingFee: Number(e.target.value) }))}
                    onBlur={calculateProfit}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入运费"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      checked={formData.isFirstPaymentManual}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFirstPaymentManual: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">是</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    e签宝合同
                  </label>
                  <select
                    value={formData.hasESignContract ? 'yes' : 'no'}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasESignContract: e.target.value === 'yes' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="yes">已签</option>
                    <option value="no">未签</option>
                  </select>
                </div>
              </div>

              {/* 财务信息 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">财务信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      合约总价
                    </label>
                    <input
                      type="number"
                      value={formData.contractTotalPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, contractTotalPrice: Number(e.target.value) }))}
                      onBlur={calculateProfit}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入合约总价"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      商城毛利
                    </label>
                    <input
                      type="number"
                      value={formData.mallGrossProfit}
                      onChange={(e) => setFormData(prev => ({ ...prev, mallGrossProfit: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入商城毛利"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      成本
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                      onBlur={calculateProfit}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入成本"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      毛利润
                    </label>
                    <input
                      type="number"
                      value={formData.grossProfit}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      利润率
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={formData.profitRate}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
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
                      value={formData.monthlyProfit}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签
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

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="请输入备注信息"
            />
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
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;