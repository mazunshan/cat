import React from 'react';
import { Users, DollarSign, TrendingUp, AlertTriangle, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import StatsCard from './StatsCard';
import CustomerRegionStats from './CustomerMap';
import { useCustomers } from '../../hooks/useDatabase';
import { useAuth } from '../../context/AuthContext';
import { Customer, PaymentStatus } from '../../types';

// 计算还款状态
const calculatePaymentStatus = (customer: Customer): PaymentStatus => {
  if (customer.customerType !== 'installment' || !customer.installmentPayments) {
    return { status: 'normal', message: '正常' };
  }

  const today = new Date();
  const overduePayments = customer.installmentPayments.filter(payment => {
    if (payment.isPaid) return false;
    const dueDate = new Date(payment.dueDate);
    return dueDate < today;
  });

  if (overduePayments.length > 0) {
    return {
      status: 'overdue',
      overdueCount: overduePayments.length,
      message: `逾期 ${overduePayments.length} 期`
    };
  }

  // 检查是否有3天内到期的还款
  const upcomingPayments = customer.installmentPayments.filter(payment => {
    if (payment.isPaid) return false;
    const dueDate = new Date(payment.dueDate);
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= threeDaysLater;
  });

  if (upcomingPayments.length > 0) {
    return {
      status: 'reminder',
      nextDueDate: upcomingPayments[0].dueDate,
      message: '待催款'
    };
  }

  return { status: 'normal', message: '还款正常' };
};

const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const { customers = [], loading: customersLoading, error: customersError } = useCustomers();
  const [overdueReminders, setOverdueReminders] = React.useState<Array<{
    id: string;
    customer: Customer;
    status: PaymentStatus;
  }>>([]);

  const loading = customersLoading;
  const hasErrors = customersError;

  // 安全的数组操作
  const safeCustomers = customers || [];

  // 计算逾期提醒列表
  React.useEffect(() => {
    const reminders = safeCustomers
      .filter(customer => customer.customerType === 'installment')
      .map(customer => ({
        id: customer.id,
        customer,
        status: calculatePaymentStatus(customer)
      }))
      .filter(item => item.status.status !== 'normal');
    
    setOverdueReminders(reminders);
  }, [safeCustomers]);

  const handleDeleteReminder = (reminderId: string) => {
    setOverdueReminders(prev => prev.filter(item => item.id !== reminderId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载数据...</p>
        </div>
      </div>
    );
  }

  // 计算统计数据
  const totalRevenue = 0;

  // 计算月度增长率
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const currentMonthRevenue = 0;
  const lastMonthRevenue = 0;
  const monthlyGrowth = 0;

  // 生成销售趋势数据（最近6个月）
  const salesData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();

    // 模拟数据
    const monthRevenue = Math.floor(Math.random() * 500000) + 100000;
    const monthOrders = Math.floor(Math.random() * 20) + 5;

    salesData.push({
      name: `${month + 1}月`,
      sales: monthRevenue,
      orders: monthOrders
    });
  }

  // 模拟品种销售分布数据
  const breedData = [
    { name: '英国短毛猫', value: 35, color: '#3B82F6' },
    { name: '布偶猫', value: 25, color: '#10B981' },
    { name: '波斯猫', value: 20, color: '#F59E0B' },
    { name: '暹罗猫', value: 15, color: '#EF4444' },
    { name: '美国短毛猫', value: 5, color: '#8B5CF6' }
  ];

  // 模拟付款方式分布
  const paymentMethodData = [
    {
      name: '全款',
      value: 65,
      color: '#3B82F6'
    },
    {
      name: '分期',
      value: 35,
      color: '#10B981'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {hasErrors && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">数据加载警告</p>
              <p className="text-yellow-700 text-sm">
                部分数据可能无法正常加载，显示的是模拟数据。请检查网络连接或联系管理员。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 逾期提醒列表 - 仅管理员可见，移到顶部 */}
      {user?.role === 'admin' && overdueReminders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">逾期提醒</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {overdueReminders.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border ${
                  item.status.status === 'overdue'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">
                        {item.customer.name}
                      </span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        item.status.status === 'overdue'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {item.status.message}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.customer.phone}
                    </div>
                    {item.status.nextDueDate && (
                      <div className="text-xs text-gray-500">
                        下次还款: {new Date(item.status.nextDueDate).toLocaleDateString('zh-CN')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => handleDeleteReminder(item.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="移除提醒"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="总客户数"
          value={safeCustomers.length}
          change={safeCustomers.filter(c => {
            const createdDate = new Date(c.createdAt);
            const now = new Date();
            return createdDate.getMonth() === now.getMonth() && 
                   createdDate.getFullYear() === now.getFullYear();
          }).length > 0 ? 12.5 : 0}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="总营收"
          value={`¥${(totalRevenue / 10000).toFixed(1)}万`}
          change={monthlyGrowth}
          icon={DollarSign}
          color="purple"
        />
        <StatsCard
          title="月度增长"
          value={`${monthlyGrowth.toFixed(1)}%`}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Customer Region Statistics */}
        <div>
          <CustomerRegionStats customers={safeCustomers} />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">销售趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  name === 'sales' ? `¥${value.toLocaleString()}` : value,
                  name === 'sales' ? '销售额' : '订单数'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Breed Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">品种销售分布</h3>
          {breedData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={breedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {breedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value}%`, '占比']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {breedData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>暂无销售数据</p>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">付款方式分布</h3>
          {paymentMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value}%`, '占比']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>暂无订单数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;