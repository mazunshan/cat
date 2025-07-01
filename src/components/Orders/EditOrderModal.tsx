import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Order, Customer, Product } from '../../types';
import { SALES_STAFF } from '../../hooks/useDatabase';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderId: string, orderData: Partial<Order>) => void;
  order: Order | null;
  customers: Customer[];
  products: Product[];
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  order,
  customers, 
  products 
}) => {
  const [formData, setFormData] = useState({
    customerId: '',
    salesPerson: '',
    paymentMethod: 'full' as 'full' | 'installment',
    status: 'pending_payment' as Order['status'],
    products: [] as Array<{
      id: string;
      name: string;
      breed: string;
      price: number;
      quantity: number;
      image: string;
    }>,
    installmentPlan: {
      totalInstallments: 6,
      installmentAmount: 0
    }
  });

  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    if (order) {
      setFormData({
        customerId: order.customerId,
        salesPerson: order.salesPerson,
        paymentMethod: order.paymentMethod,
        status: order.status,
        products: [...order.products],
        installmentPlan: order.installmentPlan ? {
          totalInstallments: order.installmentPlan.totalInstallments,
          installmentAmount: order.installmentPlan.installmentAmount
        } : {
          totalInstallments: 6,
          installmentAmount: 0
        }
      });
    }
  }, [order]);

  const totalAmount = formData.products.reduce((sum, product) => 
    sum + (product.price * product.quantity), 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order) return;

    const orderData: Partial<Order> = {
      customerId: formData.customerId,
      amount: totalAmount,
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      salesPerson: formData.salesPerson,
      products: formData.products
    };

    if (formData.paymentMethod === 'installment') {
      const installmentAmount = Math.ceil(totalAmount / formData.installmentPlan.totalInstallments);
      orderData.installmentPlan = {
        ...order.installmentPlan,
        totalInstallments: formData.installmentPlan.totalInstallments,
        installmentAmount,
        // 保持现有的付款记录
        paidInstallments: order.installmentPlan?.paidInstallments || 0,
        nextPaymentDate: order.installmentPlan?.nextPaymentDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payments: order.installmentPlan?.payments || []
      };
    }

    onSave(order.id, orderData);
    onClose();
  };

  const addProduct = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (product && !formData.products.find(p => p.id === product.id)) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, {
          id: product.id,
          name: product.name,
          breed: product.breed,
          price: product.price,
          quantity: 1,
          image: product.images[0]
        }]
      }));
      setSelectedProductId('');
    }
  };

  const updateProductQuantity = (productId: string, change: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(product => 
        product.id === productId 
          ? { ...product, quantity: Math.max(1, product.quantity + change) }
          : product
      )
    }));
  };

  const removeProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(product => product.id !== productId)
    }));
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">编辑订单 - {order.orderNumber}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择客户 *
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">请选择客户</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                销售人员
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
                付款方式
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  paymentMethod: e.target.value as 'full' | 'installment' 
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="full">全款</option>
                <option value="installment">分期</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                订单状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  status: e.target.value as Order['status'] 
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending_payment">待付款</option>
                <option value="paid">已付款</option>
                <option value="pending_shipment">待发货</option>
                <option value="shipped">已发货</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
          </div>

          {formData.paymentMethod === 'installment' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分期期数
              </label>
              <select
                value={formData.installmentPlan.totalInstallments}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  installmentPlan: {
                    ...prev.installmentPlan,
                    totalInstallments: parseInt(e.target.value)
                  }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={3}>3期</option>
                <option value={6}>6期</option>
                <option value={12}>12期</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              订单产品
            </label>
            <div className="flex space-x-2 mb-4">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">选择产品</option>
                {products.filter(p => p.isAvailable).map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.breed} - ¥{product.price.toLocaleString()}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addProduct}
                disabled={!selectedProductId}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加
              </button>
            </div>

            {formData.products.length > 0 && (
              <div className="space-y-3">
                {formData.products.map((product) => (
                  <div key={product.id} className="flex items-center bg-gray-50 rounded-lg p-4">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover mr-4"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.breed}</p>
                      <p className="text-lg font-bold text-gray-900">¥{product.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateProductQuantity(product.id, -1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{product.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateProductQuantity(product.id, 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalAmount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-blue-800">订单总额</span>
                <span className="text-2xl font-bold text-blue-600">¥{totalAmount.toLocaleString()}</span>
              </div>
              {formData.paymentMethod === 'installment' && (
                <div className="mt-2 text-sm text-blue-600">
                  每期付款: ¥{Math.ceil(totalAmount / formData.installmentPlan.totalInstallments).toLocaleString()}
                </div>
              )}
            </div>
          )}

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
              disabled={formData.products.length === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal;