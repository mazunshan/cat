import React from 'react';
import { Users, ShoppingBag, DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import StatsCard from './StatsCard';
import { useCustomers, useOrders, useProducts } from '../../hooks/useDatabase';

const DashboardView: React.FC = () => {
  const { customers = [], loading: customersLoading, error: customersError } = useCustomers();
  const { orders = [], loading: ordersLoading, error: ordersError } = useOrders();
  const { products = [], loading: productsLoading, error: productsError } = useProducts();

  const loading = customersLoading || ordersLoading || productsLoading;
  const hasErrors = customersError || ordersError || productsError;

  // 安全的数组操作
  const safeCustomers = customers || [];
  const safeOrders = orders || [];
  const safeProducts = products || [];

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
  const totalRevenue = safeOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const completedOrders = safeOrders.filter(order => order.status === 'completed');
  const pendingPayments = safeOrders.filter(order => 
    order.status === 'pending_payment' || 
    (order.paymentMethod === 'installment' && order.installmentPlan && 
     (order.installmentPlan.paidInstallments || 0) < (order.installmentPlan.totalInstallments || 0))
  ).length;

  // 计算逾期付款
  const overduePayments = safeOrders.filter(order => {
    if (order.paymentMethod === 'installment' && order.installmentPlan) {
      return (order.installmentPlan.payments || []).some(payment => 
        payment.status === 'overdue' || 
        (payment.status === 'pending' && new Date(payment.dueDate) < new Date())
      );
    }
    return false;
  }).length;

  // 计算月度增长率
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthRevenue = safeOrders
    .filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    })
    .reduce((sum, order) => sum + (order.amount || 0), 0);

  const lastMonthRevenue = safeOrders
    .filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    })
    .reduce((sum, order) => sum + (order.amount || 0), 0);

  const monthlyGrowth = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  // 生成销售趋势数据（最近6个月）
  const salesData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthOrders = safeOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.getMonth() === month && orderDate.getFullYear() === year;
    });
    
    const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    salesData.push({
      name: `${month + 1}月`,
      sales: monthRevenue,
      orders: monthOrders.length
    });
  }

  // 品种销售分布
  const breedStats = safeProducts.reduce((acc, product) => {
    const orderCount = safeOrders.filter(order => 
      (order.products || []).some(p => p.id === product.id)
    ).length;
    
    if (acc[product.breed]) {
      acc[product.breed] += orderCount;
    } else {
      acc[product.breed] = orderCount;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalBreedOrders = Object.values(breedStats).reduce((sum, count) => sum + count, 0);
  
  const breedData = Object.entries(breedStats)
    .map(([breed, count], index) => ({
      name: breed,
      value: totalBreedOrders > 0 ? Math.round((count / totalBreedOrders) * 100) : 0,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // 付款方式分布
  const fullPaymentCount = safeOrders.filter(order => order.paymentMethod === 'full').length;
  const installmentCount = safeOrders.filter(order => order.paymentMethod === 'installment').length;
  const totalOrders = safeOrders.length;

  const paymentMethodData = [
    {
      name: '全款',
      value: totalOrders > 0 ? Math.round((fullPaymentCount / totalOrders) * 100) : 0,
      color: '#3B82F6'
    },
    {
      name: '分期',
      value: totalOrders > 0 ? Math.round((installmentCount / totalOrders) * 100) : 0,
      color: '#10B981'
    }
  ].filter(item => item.value > 0);

  // 最近活动数据
  const recentActivities = [
    ...safeCustomers.slice(0, 2).map(customer => ({
      type: 'customer',
      title: '新客户注册',
      description: `${customer.name} 刚刚注册`,
      time: new Date(customer.createdAt).getTime(),
      color: 'blue'
    })),
    ...safeOrders.slice(0, 2).map(order => ({
      type: 'order',
      title: order.status === 'completed' ? '订单完成' : '新订单',
      description: `订单 ${order.orderNumber} ${order.status === 'completed' ? '已完成' : '已创建'}`,
      time: new Date(order.orderDate).getTime(),
      color: order.status === 'completed' ? 'green' : 'blue'
    })),
    ...safeOrders
      .filter(order => order.paymentMethod === 'installment' && order.installmentPlan)
      .slice(0, 1)
      .map(order => ({
        type: 'payment',
        title: '付款提醒',
        description: `${safeCustomers.find(c => c.id === order.customerId)?.name || '客户'}的分期付款到期`,
        time: new Date(order.installmentPlan!.nextPaymentDate).getTime(),
        color: 'yellow'
      }))
  ]
  .sort((a, b) => b.time - a.time)
  .slice(0, 3);

  const getActivityTimeText = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  };

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
          title="总订单数"
          value={safeOrders.length}
          change={safeOrders.filter(o => {
            const orderDate = new Date(o.orderDate);
            const now = new Date();
            return orderDate.getMonth() === now.getMonth() && 
                   orderDate.getFullYear() === now.getFullYear();
          }).length > 0 ? 8.3 : 0}
          icon={ShoppingBag}
          color="green"
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
        <StatsCard
          title="待付款"
          value={pendingPayments}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="逾期付款"
          value={overduePayments}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">最近活动</h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className={`flex items-center p-3 rounded-lg ${
                  activity.color === 'blue' ? 'bg-blue-50' :
                  activity.color === 'green' ? 'bg-green-50' :
                  'bg-yellow-50'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.color === 'blue' ? 'bg-blue-500' :
                    activity.color === 'green' ? 'bg-green-500' :
                    'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{getActivityTimeText(activity.time)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无最近活动</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;