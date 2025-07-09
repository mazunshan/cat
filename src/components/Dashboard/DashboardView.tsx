import React from 'react';
import { Users, DollarSign, TrendingUp, Clock, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import StatsCard from './StatsCard';
import { useCustomers } from '../../hooks/useDatabase';
import { useAuth } from '../../context/AuthContext';
import { OverdueReminder } from '../../types';

const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const { customers = [], loading: customersLoading, error: customersError } = useCustomers();
  const [overdueReminders, setOverdueReminders] = React.useState<OverdueReminder[]>([]);

  const loading = customersLoading;
  const hasErrors = customersError;

  // 安全的数组操作
  const safeCustomers = customers || [];

  // 生成逾期提醒数据
  React.useEffect(() => {
    const reminders: OverdueReminder[] = [];
    const today = new Date();
    
    safeCustomers.forEach(customer => {
      if (customer.customerType === 'installment' && customer.installmentPayments) {
        customer.installmentPayments.forEach(payment => {
          if (!payment.isPaid) {
            const dueDate = new Date(payment.dueDate);
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
              // 逾期
              reminders.push({
                id: `${customer.id}-${payment.id}`,
                customerId: customer.id,
                customerName: customer.name,
                type: 'overdue',
                overdueCount: payment.overdueCount || Math.abs(diffDays),
                nextPaymentDate: payment.dueDate,
                amount: payment.amount,
                createdAt: new Date().toISOString()
              });
            } else if (diffDays <= 3) {
              // 即将到期
              reminders.push({
                id: `${customer.id}-${payment.id}`,
                customerId: customer.id,
                customerName: customer.name,
                type: 'due_soon',
                nextPaymentDate: payment.dueDate,
                amount: payment.amount,
                createdAt: new Date().toISOString()
              });
            }
          }
        });
      }
    });
    
    setOverdueReminders(reminders);
  }, [safeCustomers]);

  const handleEditReminder = (reminder: OverdueReminder) => {
    // 这里可以打开编辑模态框
    console.log('编辑提醒:', reminder);
  };

  const handleDeleteReminder = (reminderId: string) => {
    setOverdueReminders(prev => prev.filter(r => r.id !== reminderId));
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
  const pendingPayments = 0;
  const overduePayments = 0;

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

  // 最近活动数据
  const recentActivities = [
    ...safeCustomers.slice(0, 2).map(customer => ({
      type: 'customer',
      title: '新客户注册',
      description: `${customer.name} 刚刚注册`,
      time: new Date(customer.createdAt).getTime(),
      color: 'blue'
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
        {user?.role === 'admin' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">逾期提醒</h3>
            <div className="space-y-3">
              {overdueReminders.length > 0 ? (
                overdueReminders.map((reminder) => (
                  <div key={reminder.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                    reminder.type === 'overdue' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        reminder.type === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {reminder.customerName}
                          {reminder.type === 'overdue' && reminder.overdueCount && (
                            <span className="ml-2 text-red-600">
                              (逾期{reminder.overdueCount}天)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600">
                          {reminder.type === 'overdue' ? '逾期还款' : '即将到期'} - 
                          ¥{reminder.amount.toLocaleString()} - 
                          {new Date(reminder.nextPaymentDate).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditReminder(reminder)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无逾期提醒</p>
                </div>
              )}
            </div>
          </div>
        ) : (
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
        )}
      </div>

      {/* 逾期统计卡片 - 仅管理员可见 */}
      {user?.role === 'admin' && overdueReminders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">逾期统计</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">逾期客户</span>
                <span className="font-semibold text-red-600">
                  {overdueReminders.filter(r => r.type === 'overdue').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">待催款客户</span>
                <span className="font-semibold text-yellow-600">
                  {overdueReminders.filter(r => r.type === 'due_soon').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">逾期总金额</span>
                <span className="font-semibold text-red-600">
                  ¥{overdueReminders
                    .filter(r => r.type === 'overdue')
                    .reduce((sum, r) => sum + r.amount, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
  );
};

export default DashboardView;