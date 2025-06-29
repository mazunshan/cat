import React, { useState } from 'react';
import { Trophy, TrendingUp, Users, DollarSign, Calendar, Award, Target, Star, Filter, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useOrders, useCustomers } from '../../hooks/useDatabase';

const SalesPerformanceView: React.FC = () => {
  const { orders = [], loading: ordersLoading } = useOrders();
  const { customers = [], loading: customersLoading } = useCustomers();
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'revenue' | 'orders' | 'customers'>('revenue');

  // 安全的数组操作
  const safeOrders = orders || [];
  const safeCustomers = customers || [];

  if (ordersLoading || customersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载销售业绩数据...</p>
        </div>
      </div>
    );
  }

  // 计算时间范围
  const getTimeRangeFilter = () => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return startDate;
  };

  const startDate = getTimeRangeFilter();
  const filteredOrders = safeOrders.filter(order => 
    new Date(order.orderDate) >= startDate
  );

  // 计算销售员业绩
  const salesPerformance = () => {
    const salesStats: Record<string, {
      name: string;
      revenue: number;
      orders: number;
      customers: Set<string>;
      avgOrderValue: number;
      completionRate: number;
    }> = {};

    filteredOrders.forEach(order => {
      const salesperson = order.salesPerson;
      if (!salesStats[salesperson]) {
        salesStats[salesperson] = {
          name: salesperson,
          revenue: 0,
          orders: 0,
          customers: new Set(),
          avgOrderValue: 0,
          completionRate: 0
        };
      }

      salesStats[salesperson].revenue += order.amount;
      salesStats[salesperson].orders += 1;
      salesStats[salesperson].customers.add(order.customerId);
    });

    // 计算平均订单价值和完成率
    Object.keys(salesStats).forEach(salesperson => {
      const stats = salesStats[salesperson];
      stats.avgOrderValue = stats.orders > 0 ? stats.revenue / stats.orders : 0;
      
      const salespersonOrders = filteredOrders.filter(o => o.salesPerson === salesperson);
      const completedOrders = salespersonOrders.filter(o => o.status === 'completed');
      stats.completionRate = salespersonOrders.length > 0 ? (completedOrders.length / salespersonOrders.length) * 100 : 0;
    });

    // 转换为数组并排序
    const performanceArray = Object.values(salesStats).map(stats => ({
      ...stats,
      customers: stats.customers.size
    }));

    return performanceArray.sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.revenue - a.revenue;
        case 'orders':
          return b.orders - a.orders;
        case 'customers':
          return b.customers - a.customers;
        default:
          return b.revenue - a.revenue;
      }
    });
  };

  const performanceData = salesPerformance();

  // 月度趋势数据
  const getMonthlyTrends = () => {
    const monthlyData: Record<string, Record<string, number>> = {};
    
    filteredOrders.forEach(order => {
      const month = new Date(order.orderDate).toLocaleDateString('zh-CN', { month: 'short' });
      const salesperson = order.salesPerson;
      
      if (!monthlyData[month]) {
        monthlyData[month] = {};
      }
      
      if (!monthlyData[month][salesperson]) {
        monthlyData[month][salesperson] = 0;
      }
      
      monthlyData[month][salesperson] += order.amount;
    });

    return Object.entries(monthlyData).map(([month, salesData]) => ({
      month,
      ...salesData
    }));
  };

  const monthlyTrends = getMonthlyTrends();

  // 销售分布数据
  const getSalesDistribution = () => {
    const totalRevenue = performanceData.reduce((sum, p) => sum + p.revenue, 0);
    
    return performanceData.map((performance, index) => ({
      name: performance.name,
      value: totalRevenue > 0 ? Math.round((performance.revenue / totalRevenue) * 100) : 0,
      revenue: performance.revenue,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6]
    }));
  };

  const salesDistribution = getSalesDistribution();

  // 获取排名图标
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Award className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Star className="w-6 h-6 text-orange-500" />;
      default:
        return <Target className="w-6 h-6 text-gray-300" />;
    }
  };

  // 获取排名样式
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-white border border-gray-200';
    }
  };

  const exportPerformanceData = () => {
    if (performanceData.length === 0) {
      alert('暂无业绩数据可导出');
      return;
    }

    const csvContent = [
      ['排名', '销售员', '销售额', '订单数', '客户数', '平均订单价值', '完成率'].join(','),
      ...performanceData.map((performance, index) => [
        index + 1,
        performance.name,
        performance.revenue,
        performance.orders,
        performance.customers,
        Math.round(performance.avgOrderValue),
        `${performance.completionRate.toFixed(1)}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `销售业绩排名_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">销售业绩排名</h2>
          <p className="text-gray-600 mt-1">团队销售表现分析与排名</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'month' | 'quarter' | 'year')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="month">最近一个月</option>
              <option value="quarter">最近三个月</option>
              <option value="year">最近一年</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'revenue' | 'orders' | 'customers')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="revenue">按销售额排序</option>
              <option value="orders">按订单数排序</option>
              <option value="customers">按客户数排序</option>
            </select>
          </div>
          
          <button 
            onClick={exportPerformanceData}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </button>
        </div>
      </div>

      {/* 总体统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总销售额</p>
              <p className="text-2xl font-bold text-gray-800">
                ¥{(performanceData.reduce((sum, p) => sum + p.revenue, 0) / 10000).toFixed(1)}万
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总订单数</p>
              <p className="text-2xl font-bold text-green-600">
                {performanceData.reduce((sum, p) => sum + p.orders, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">服务客户</p>
              <p className="text-2xl font-bold text-purple-600">
                {performanceData.reduce((sum, p) => sum + p.customers, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <Trophy className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">平均完成率</p>
              <p className="text-2xl font-bold text-orange-600">
                {performanceData.length > 0 
                  ? (performanceData.reduce((sum, p) => sum + p.completionRate, 0) / performanceData.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 销售排行榜 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">销售业绩排行榜</h3>
        
        {performanceData.length > 0 ? (
          <div className="space-y-4">
            {performanceData.map((performance, index) => (
              <div
                key={performance.name}
                className={`p-6 rounded-xl transition-all hover:shadow-md ${getRankStyle(index + 1)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center mr-6">
                      {getRankIcon(index + 1)}
                      <span className={`ml-2 text-2xl font-bold ${
                        index < 3 ? 'text-white' : 'text-gray-800'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className={`text-xl font-bold ${
                        index < 3 ? 'text-white' : 'text-gray-800'
                      }`}>
                        {performance.name}
                      </h4>
                      <p className={`text-sm ${
                        index < 3 ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        销售专员
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-8 text-right">
                    <div>
                      <p className={`text-sm ${
                        index < 3 ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        销售额
                      </p>
                      <p className={`text-lg font-bold ${
                        index < 3 ? 'text-white' : 'text-gray-800'
                      }`}>
                        ¥{(performance.revenue / 10000).toFixed(1)}万
                      </p>
                    </div>
                    
                    <div>
                      <p className={`text-sm ${
                        index < 3 ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        订单数
                      </p>
                      <p className={`text-lg font-bold ${
                        index < 3 ? 'text-white' : 'text-gray-800'
                      }`}>
                        {performance.orders}
                      </p>
                    </div>
                    
                    <div>
                      <p className={`text-sm ${
                        index < 3 ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        客户数
                      </p>
                      <p className={`text-lg font-bold ${
                        index < 3 ? 'text-white' : 'text-gray-800'
                      }`}>
                        {performance.customers}
                      </p>
                    </div>
                    
                    <div>
                      <p className={`text-sm ${
                        index < 3 ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        完成率
                      </p>
                      <p className={`text-lg font-bold ${
                        index < 3 ? 'text-white' : 'text-gray-800'
                      }`}>
                        {performance.completionRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 平均订单价值 */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${
                      index < 3 ? 'text-white/80' : 'text-gray-600'
                    }`}>
                      平均订单价值
                    </span>
                    <span className={`font-medium ${
                      index < 3 ? 'text-white' : 'text-gray-800'
                    }`}>
                      ¥{performance.avgOrderValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无销售数据</h3>
            <p className="text-gray-600">选择的时间范围内没有销售记录</p>
          </div>
        )}
      </div>

      {/* 图表分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 销售趋势图 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">销售趋势对比</h3>
          {monthlyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [`¥${Number(value).toLocaleString()}`, name]}
                />
                {performanceData.slice(0, 3).map((performance, index) => (
                  <Line
                    key={performance.name}
                    type="monotone"
                    dataKey={performance.name}
                    stroke={['#3B82F6', '#10B981', '#F59E0B'][index]}
                    strokeWidth={3}
                    dot={{ fill: ['#3B82F6', '#10B981', '#F59E0B'][index], strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>暂无趋势数据</p>
            </div>
          )}
        </div>

        {/* 销售分布饼图 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">销售额分布</h3>
          {salesDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {salesDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [`${value}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {salesDistribution.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">
                      {item.name}: {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>暂无分布数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesPerformanceView;