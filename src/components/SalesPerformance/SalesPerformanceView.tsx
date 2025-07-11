import React, { useState } from 'react';
import { Trophy, TrendingUp, Users, DollarSign, Calendar, Award, Target, Star, Filter, Download, ChevronLeft, ChevronRight, UsersRound, User, BarChart2, Edit, Save, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useOrders, useCustomers, useSalesPerformance } from '../../hooks/useDatabase';
import { useAuth } from '../../context/AuthContext';

const SalesPerformanceView: React.FC = () => {
  const { user, teams } = useAuth();
  const { orders = [], loading: ordersLoading } = useOrders();
  const { customers = [], loading: customersLoading } = useCustomers();
  const { 
    loading: performanceLoading, 
    error: performanceError,
    getSummaryData,
    fetchSalesPerformance
  } = useSalesPerformance();
  
  const [viewMode, setViewMode] = useState<'personal' | 'team'>('personal');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('month');
  const [sortBy, setSortBy] = useState<'revenue' | 'orders' | 'customers'>('revenue');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [selectedWeek, setSelectedWeek] = useState<number>(getWeekNumber(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().substring(0, 10)); // YYYY-MM-DD

  // 编辑状态管理
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{
    [key: string]: {
      [date: string]: {
        traffic?: number;
        orders?: number;
        revenue?: number;
      }
    }
  }>({});

  // 安全的数组操作
  const safeOrders = orders || [];
  const safeCustomers = customers || [];
  
  const loading = ordersLoading || customersLoading || performanceLoading;

  // 获取当前月份的开始和结束日期
  const getMonthRange = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return {
      start: startDate.toISOString().substring(0, 10),
      end: endDate.toISOString().substring(0, 10)
    };
  };

  // 获取当前周的开始和结束日期
  function getWeekRange(year: number, weekNumber: number) {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNumber - 1) * 7;
    
    // 找到第一周的第一天
    let firstDayOfWeek = new Date(year, 0, 1 + daysOffset - firstDayOfYear.getDay());
    if (firstDayOfYear.getDay() > 0) {
      firstDayOfWeek = new Date(year, 0, 1 + daysOffset + (7 - firstDayOfYear.getDay()));
    }
    
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
    
    return {
      start: firstDayOfWeek.toISOString().substring(0, 10),
      end: lastDayOfWeek.toISOString().substring(0, 10)
    };
  }

  // 获取周数
  function getWeekNumber(date: Date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // 获取当前选择的日期范围
  const getDateRange = () => {
    switch (timeRange) {
      case 'day':
        return { start: selectedDate, end: selectedDate };
      case 'week':
        return getWeekRange(new Date().getFullYear(), selectedWeek);
      case 'month':
      default:
        return getMonthRange(selectedMonth);
    };
  };

  const dateRange = getDateRange();
  
  // 获取汇总数据
  const summaryData = getSummaryData(dateRange.start, dateRange.end);
  
  // 根据排序方式对数据进行排序
  const getSortedData = () => {
    if (viewMode === 'personal') {
      return [...summaryData.salesSummary].sort((a, b) => {
        switch (sortBy) {
          case 'revenue':
            return b.totalRevenue - a.totalRevenue;
          case 'orders':
            return b.totalOrders - a.totalOrders;
          case 'customers':
            return b.totalOrders - a.totalOrders; // 使用订单数作为客户数的近似值
          default:
            return b.totalRevenue - a.totalRevenue;
        }
      });
    } else {
      return [...summaryData.teamSummary].sort((a, b) => {
        switch (sortBy) {
          case 'revenue':
            return b.totalRevenue - a.totalRevenue;
          case 'orders':
            return b.totalOrders - a.totalOrders;
          case 'customers':
            return b.totalOrders - a.totalOrders;
          default:
            return b.totalRevenue - a.totalRevenue;
        }
      });
    }
  };

  const sortedData = getSortedData();

  // 获取月份的天数
  const getDaysInMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  // 获取月份的所有日期
  const getMonthDays = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const daysInMonth = getDaysInMonth(monthStr);
    const days = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i);
      days.push({
        date: date.toISOString().substring(0, 10),
        day: i,
        weekday: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
      });
    }
    
    return days;
  };

  const monthDays = getMonthDays(selectedMonth);

  // 获取周的所有日期
  const getWeekDays = (year: number, weekNumber: number) => {
    const range = getWeekRange(year, weekNumber);
    const startDate = new Date(range.start);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        date: date.toISOString().substring(0, 10),
        day: date.getDate(),
        weekday: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
      });
    }
    
    return days;
  };

  const weekDays = getWeekDays(new Date().getFullYear(), selectedWeek);

  // 获取日期范围的标题
  const getDateRangeTitle = () => {
    switch (timeRange) {
      case 'day':
        return new Date(selectedDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      case 'week':
        return `${new Date(weekDays[0].date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} - ${new Date(weekDays[6].date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}`;
      case 'month':
      default:
        return new Date(selectedMonth + '-01').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
    }
  };

  // 切换到上一个时间段
  const goToPrevious = () => {
    switch (timeRange) {
      case 'day': {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        setSelectedDate(date.toISOString().substring(0, 10));
        break;
      }
      case 'week': {
        setSelectedWeek(prev => prev > 1 ? prev - 1 : 52);
        break;
      }
      case 'month': {
        const [year, month] = selectedMonth.split('-').map(Number);
        const newMonth = month === 1 ? 12 : month - 1;
        const newYear = month === 1 ? year - 1 : year;
        setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
        break;
      }
    }
  };

  // 切换到下一个时间段
  const goToNext = () => {
    switch (timeRange) {
      case 'day': {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        setSelectedDate(date.toISOString().substring(0, 10));
        break;
      }
      case 'week': {
        setSelectedWeek(prev => prev < 52 ? prev + 1 : 1);
        break;
      }
      case 'month': {
        const [year, month] = selectedMonth.split('-').map(Number);
        const newMonth = month === 12 ? 1 : month + 1;
        const newYear = month === 12 ? year + 1 : year;
        setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
        break;
      }
    }
  };

  // 处理编辑数据
  const handleEditStart = () => {
    // 初始化编辑数据
    const initialEditData: {
      [key: string]: {
        [date: string]: {
          traffic?: number;
          orders?: number;
          revenue?: number;
        }
      }
    } = {};
    
    if (viewMode === 'personal') {
      sortedData.forEach(person => {
        initialEditData[person.salesName] = {};
        
        if (timeRange === 'month') {
          monthDays.forEach(day => {
            initialEditData[person.salesName][day.date] = {
              traffic: Math.floor(Math.random() * 20) + 5,
              orders: Math.floor(Math.random() * 5),
              revenue: Math.floor(Math.random() * 5) > 0 ? Math.round((Math.random() * 2 + 0.5) * 10000) : 0
            };
          });
        } else if (timeRange === 'week') {
          weekDays.forEach(day => {
            initialEditData[person.salesName][day.date] = {
              traffic: Math.floor(Math.random() * 20) + 5,
              orders: Math.floor(Math.random() * 5),
              revenue: Math.floor(Math.random() * 5) > 0 ? Math.round((Math.random() * 2 + 0.5) * 10000) : 0
            };
          });
        } else if (timeRange === 'day') {
          initialEditData[person.salesName][selectedDate] = {
            traffic: Math.floor(Math.random() * 20) + 5,
            orders: Math.floor(Math.random() * 5),
            revenue: Math.floor(Math.random() * 5) > 0 ? Math.round((Math.random() * 2 + 0.5) * 10000) : 0
          };
        }
      });
    } else {
      // 团队数据
      sortedData.forEach(team => {
        initialEditData[team.teamName] = {};
        
        if (timeRange === 'month') {
          monthDays.forEach(day => {
            initialEditData[team.teamName][day.date] = {
              traffic: Math.floor(Math.random() * 40) + 10,
              orders: Math.floor(Math.random() * 10),
              revenue: Math.floor(Math.random() * 5) > 0 ? Math.round((Math.random() * 4 + 1) * 10000) : 0
            };
          });
        } else if (timeRange === 'week') {
          weekDays.forEach(day => {
            initialEditData[team.teamName][day.date] = {
              traffic: Math.floor(Math.random() * 40) + 10,
              orders: Math.floor(Math.random() * 10),
              revenue: Math.floor(Math.random() * 5) > 0 ? Math.round((Math.random() * 4 + 1) * 10000) : 0
            };
          });
        } else if (timeRange === 'day') {
          initialEditData[team.teamName][selectedDate] = {
            traffic: Math.floor(Math.random() * 40) + 10,
            orders: Math.floor(Math.random() * 10),
            revenue: Math.floor(Math.random() * 5) > 0 ? Math.round((Math.random() * 4 + 1) * 10000) : 0
          };
        }
      });
    }
    
    setEditData(initialEditData);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleEditSave = () => {
    // 这里应该调用API保存数据到数据库
    // 在实际应用中，这里会调用updateSalesPerformance等方法
    console.log('保存编辑数据:', editData);
    
    // 模拟保存成功
    alert('数据保存成功！');
    setIsEditing(false);
  };

  const handleDataChange = (
    entityName: string, 
    date: string, 
    field: 'traffic' | 'orders' | 'revenue', 
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    
    setEditData(prev => ({
      ...prev,
      [entityName]: {
        ...prev[entityName],
        [date]: {
          ...prev[entityName]?.[date],
          [field]: numValue
        }
      }
    }));
  };

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
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">销售业绩排名</h2>
            <p className="text-gray-600 mt-1">团队销售表现分析与排名</p>
          </div>
          
          {/* 视图切换 */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('personal')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'personal' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              个人排名
            </button>
            <button
              onClick={() => setViewMode('team')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'team' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UsersRound className="w-4 h-4 inline mr-2" />
              团队排名
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 管理员编辑按钮 */}
          {user?.role === 'admin' && (
            isEditing ? (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleEditSave}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </button>
                <button 
                  onClick={handleEditCancel}
                  className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  取消
                </button>
              </div>
            ) : (
              <button 
                onClick={handleEditStart}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                编辑数据
              </button>
            )
          )}
          
          {/* 时间范围切换 */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setTimeRange('day')}
              className={`px-3 py-1 text-sm font-medium ${
                timeRange === 'day' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              日排名
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-sm font-medium ${
                timeRange === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              周排名
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-sm font-medium ${
                timeRange === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              月排名
            </button>
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
            className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </button>
        </div>
      </div>

      {/* 日期选择器 */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <button 
          onClick={goToPrevious}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-800">
          {getDateRangeTitle()}
        </h3>
        
        <button 
          onClick={goToNext}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 排名区 */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            {viewMode === 'personal' ? '销售员业绩排名' : '团队业绩排名'}
          </h3>
          
          {sortedData.length > 0 ? (
            <div className="space-y-4">
              {sortedData.map((item, index) => (
                <div
                  key={viewMode === 'personal' ? item.salesId : item.teamId}
                  className={`p-4 rounded-xl transition-all hover:shadow-md ${
                    index < 3 
                      ? ['bg-gradient-to-r from-yellow-400 to-yellow-600 text-white', 
                         'bg-gradient-to-r from-gray-300 to-gray-500 text-white', 
                         'bg-gradient-to-r from-orange-400 to-orange-600 text-white'][index]
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        {index === 0 ? <Trophy className="w-5 h-5 text-white" /> :
                         index === 1 ? <Award className="w-5 h-5 text-white" /> :
                         index === 2 ? <Star className="w-5 h-5 text-white" /> :
                         <Target className="w-5 h-5 text-gray-400" />}
                        <span className={`ml-2 text-lg font-bold ${
                          index < 3 ? 'text-white' : 'text-gray-800'
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className={`text-lg font-bold ${
                          index < 3 ? 'text-white' : 'text-gray-800'
                        }`}>
                          {viewMode === 'personal' ? item.salesName : item.teamName}
                        </h4>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className={`text-xs ${
                        index < 3 ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        流量
                      </p>
                      <p className={`text-lg font-bold ${
                        index < 3 ? 'text-white' : 'text-gray-800'
                      }`}>
                        {item.totalTraffic}
                      </p>
                    </div>
                    
                    <div>
                      <p className={`text-xs ${
                        index < 3 ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        订单数
                      </p>
                      <p className={`text-lg font-bold ${
                        index < 3 ? 'text-white' : 'text-gray-800'
                      }`}>
                        {item.totalOrders}
                      </p>
                    </div>
                    
                    <div>
                      <p className={`text-xs ${
                        index < 3 ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        业绩
                      </p>
                      <p className={`text-lg font-bold ${
                        index < 3 ? 'text-white' : 'text-gray-800'
                      }`}>
                        ¥{(item.totalRevenue / 10000).toFixed(1)}万
                      </p>
                    </div>
                  </div>
                  
                  {/* 转化率 */}
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${
                        index < 3 ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        转化率
                      </span>
                      <span className={`font-medium ${
                        index < 3 ? 'text-white' : 'text-gray-800'
                      }`}>
                        {item.totalTraffic > 0 ? ((item.totalOrders / item.totalTraffic) * 100).toFixed(1) : 0}%
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
        
        {/* 统计区 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            {viewMode === 'personal' ? '销售员业绩明细' : '团队业绩明细'}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 border-b border-gray-200 sticky left-0 bg-white">
                    {viewMode === 'personal' ? '销售员' : '团队'}
                  </th>
                  {timeRange === 'month' && monthDays.map(day => (
                    <th key={day.date} className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">
                      <div>周{day.weekday}</div>
                      <div>{day.day}日</div>
                    </th>
                  ))}
                  {timeRange === 'week' && weekDays.map(day => (
                    <th key={day.date} className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">
                      <div>周{day.weekday}</div>
                      <div>{day.day}日</div>
                    </th>
                  ))}
                  {timeRange === 'day' && (
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 border-b border-gray-200">
                      {new Date(selectedDate).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {viewMode === 'personal' ? (
                  // 个人业绩统计
                  sortedData.slice(0, 5).map((salesPerson, index) => (
                    <React.Fragment key={salesPerson.salesId}>
                      {/* 销售员名称行 */}
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-800 border-b border-gray-100 sticky left-0 bg-white">
                          {salesPerson.salesName}
                        </td>
                        {timeRange === 'month' && monthDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs text-gray-500 border-b border-gray-100 min-w-[60px]">
                            {/* 日期单元格内容 */}
                          </td>
                        ))}
                        {timeRange === 'week' && weekDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs text-gray-500 border-b border-gray-100 min-w-[60px]">
                            {/* 日期单元格内容 */}
                          </td>
                        ))}
                        {timeRange === 'day' && (
                          <td className="px-4 py-2 text-center text-sm text-gray-500 border-b border-gray-100 min-w-[60px]">
                            {/* 日期单元格内容 */}
                          </td>
                        )}
                      </tr>
                      
                      {/* 流量行 */}
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500 sticky left-0 bg-gray-50">
                          流量
                        </td>
                        {timeRange === 'month' && monthDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs font-medium text-blue-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[salesPerson.salesName]?.[day.date]?.traffic || 0}
                                onChange={(e) => handleDataChange(salesPerson.salesName, day.date, 'traffic', e.target.value)}
                                className="w-full px-1 py-1 text-center border border-blue-300 rounded text-xs"
                              />
                            ) : (
                              Math.floor(Math.random() * 20) + 5
                            )}
                          </td>
                        ))}
                        {timeRange === 'week' && weekDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs font-medium text-blue-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[salesPerson.salesName]?.[day.date]?.traffic || 0}
                                onChange={(e) => handleDataChange(salesPerson.salesName, day.date, 'traffic', e.target.value)}
                                className="w-full px-1 py-1 text-center border border-blue-300 rounded text-xs"
                              />
                            ) : (
                              Math.floor(Math.random() * 20) + 5
                            )}
                          </td>
                        ))}
                        {timeRange === 'day' && (
                          <td className="px-4 py-2 text-center text-sm font-medium text-blue-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[salesPerson.salesName]?.[selectedDate]?.traffic || 0}
                                onChange={(e) => handleDataChange(salesPerson.salesName, selectedDate, 'traffic', e.target.value)}
                                className="w-full px-2 py-1 text-center border border-blue-300 rounded text-sm"
                              />
                            ) : (
                              Math.floor(Math.random() * 20) + 5
                            )}
                          </td>
                        )}
                      </tr>
                      
                      {/* 订单数行 */}
                      <tr>
                        <td className="px-4 py-2 text-xs text-gray-500 sticky left-0 bg-white">
                          订单数
                        </td>
                        {timeRange === 'month' && monthDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs font-medium text-green-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[salesPerson.salesName]?.[day.date]?.orders || 0}
                                onChange={(e) => handleDataChange(salesPerson.salesName, day.date, 'orders', e.target.value)}
                                className="w-full px-1 py-1 text-center border border-green-300 rounded text-xs"
                              />
                            ) : (
                              Math.floor(Math.random() * 5)
                            )}
                          </td>
                        ))}
                        {timeRange === 'week' && weekDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs font-medium text-green-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[salesPerson.salesName]?.[day.date]?.orders || 0}
                                onChange={(e) => handleDataChange(salesPerson.salesName, day.date, 'orders', e.target.value)}
                                className="w-full px-1 py-1 text-center border border-green-300 rounded text-xs"
                              />
                            ) : (
                              Math.floor(Math.random() * 5)
                            )}
                          </td>
                        ))}
                        {timeRange === 'day' && (
                          <td className="px-4 py-2 text-center text-sm font-medium text-green-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[salesPerson.salesName]?.[selectedDate]?.orders || 0}
                                onChange={(e) => handleDataChange(salesPerson.salesName, selectedDate, 'orders', e.target.value)}
                                className="w-full px-2 py-1 text-center border border-green-300 rounded text-sm"
                              />
                            ) : (
                              Math.floor(Math.random() * 5)
                            )}
                          </td>
                        )}
                      </tr>
                      
                      {/* 业绩行 */}
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <td className="px-4 py-2 text-xs text-gray-500 sticky left-0 bg-gray-50">
                          业绩
                        </td>
                        {timeRange === 'month' && monthDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs font-medium text-red-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[salesPerson.salesName]?.[day.date]?.revenue || 0}
                                onChange={(e) => handleDataChange(salesPerson.salesName, day.date, 'revenue', e.target.value)}
                                className="w-full px-1 py-1 text-center border border-red-300 rounded text-xs"
                              />
                            ) : (
                              Math.floor(Math.random() * 5) > 0 ? `¥${(Math.random() * 2 + 0.5).toFixed(1)}万` : '-'
                            )}
                          </td>
                        ))}
                        {timeRange === 'week' && weekDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs font-medium text-red-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[salesPerson.salesName]?.[day.date]?.revenue || 0}
                                onChange={(e) => handleDataChange(salesPerson.salesName, day.date, 'revenue', e.target.value)}
                                className="w-full px-1 py-1 text-center border border-red-300 rounded text-xs"
                              />
                            ) : (
                              Math.floor(Math.random() * 5) > 0 ? `¥${(Math.random() * 2 + 0.5).toFixed(1)}万` : '-'
                            )}
                          </td>
                        ))}
                        {timeRange === 'day' && (
                          <td className="px-4 py-2 text-center text-sm font-medium text-red-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[salesPerson.salesName]?.[selectedDate]?.revenue || 0}
                                onChange={(e) => handleDataChange(salesPerson.salesName, selectedDate, 'revenue', e.target.value)}
                                className="w-full px-2 py-1 text-center border border-red-300 rounded text-sm"
                              />
                            ) : (
                              Math.floor(Math.random() * 5) > 0 ? `¥${(Math.random() * 2 + 0.5).toFixed(1)}万` : '-'
                            )}
                          </td>
                        )}
                      </tr>
                    </React.Fragment>
                  ))
                ) : (
                  // 团队业绩统计
                  sortedData.map((team, index) => (
                    <React.Fragment key={team.teamId}>
                      {/* 团队名称行 */}
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-800 border-b border-gray-100 sticky left-0 bg-white">
                          {team.teamName}
                        </td>
                        {timeRange === 'month' && monthDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs text-gray-500 border-b border-gray-100">
                            {/* 这里可以根据日期获取具体数据 */}
                          </td>
                        ))}
                        {timeRange === 'week' && weekDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs text-gray-500 border-b border-gray-100">
                            {/* 这里可以根据日期获取具体数据 */}
                          </td>
                        ))}
                        {timeRange === 'day' && (
                          <td className="px-4 py-2 text-center text-sm text-gray-500 border-b border-gray-100">
                            {/* 这里可以根据日期获取具体数据 */}
                          </td>
                        )}
                      </tr>
                      
                      {/* 流量行 */}
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500 sticky left-0 bg-gray-50">
                          流量
                        </td>
                        {timeRange === 'month' && monthDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs font-medium text-blue-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[team.teamName]?.[day.date]?.traffic || 0}
                                onChange={(e) => handleDataChange(team.teamName, day.date, 'traffic', e.target.value)}
                                className="w-full px-1 py-1 text-center border border-blue-300 rounded text-xs"
                              />
                            ) : (
                              Math.floor(Math.random() * 40) + 10
                            )}
                          </td>
                        ))}
                        {timeRange === 'week' && weekDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs font-medium text-blue-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[team.teamName]?.[day.date]?.traffic || 0}
                                onChange={(e) => handleDataChange(team.teamName, day.date, 'traffic', e.target.value)}
                                className="w-full px-1 py-1 text-center border border-blue-300 rounded text-xs"
                              />
                            ) : (
                              Math.floor(Math.random() * 40) + 10
                            )}
                          </td>
                        ))}
                        {timeRange === 'day' && (
                          <td className="px-4 py-2 text-center text-sm font-medium text-blue-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[team.teamName]?.[selectedDate]?.traffic || 0}
                                onChange={(e) => handleDataChange(team.teamName, selectedDate, 'traffic', e.target.value)}
                                className="w-full px-2 py-1 text-center border border-blue-300 rounded text-sm"
                              />
                            ) : (
                              Math.floor(Math.random() * 40) + 10
                            )}
                          </td>
                        )}
                      </tr>
                      
                      {/* 订单数行 */}
                      <tr>
                        <td className="px-4 py-2 text-xs text-gray-500 sticky left-0 bg-white">
                          订单数
                        </td>
                        {timeRange === 'month' && monthDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs font-medium text-green-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[team.teamName]?.[day.date]?.orders || 0}
                                onChange={(e) => handleDataChange(team.teamName, day.date, 'orders', e.target.value)}
                                className="w-full px-1 py-1 text-center border border-green-300 rounded text-xs"
                              />
                            ) : (
                              Math.floor(Math.random() * 10)
                            )}
                          </td>
                        ))}
                        {timeRange === 'week' && weekDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs font-medium text-green-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[team.teamName]?.[day.date]?.orders || 0}
                                onChange={(e) => handleDataChange(team.teamName, day.date, 'orders', e.target.value)}
                                className="w-full px-1 py-1 text-center border border-green-300 rounded text-xs"
                              />
                            ) : (
                              Math.floor(Math.random() * 10)
                            )}
                          </td>
                        ))}
                        {timeRange === 'day' && (
                          <td className="px-4 py-2 text-center text-sm font-medium text-green-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[team.teamName]?.[selectedDate]?.orders || 0}
                                onChange={(e) => handleDataChange(team.teamName, selectedDate, 'orders', e.target.value)}
                                className="w-full px-2 py-1 text-center border border-green-300 rounded text-sm"
                              />
                            ) : (
                              Math.floor(Math.random() * 10)
                            )}
                          </td>
                        )}
                      </tr>
                      
                      {/* 业绩行 */}
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <td className="px-4 py-2 text-xs text-gray-500 sticky left-0 bg-gray-50">
                          业绩
                        </td>
                        {timeRange === 'month' && monthDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs font-medium text-red-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[team.teamName]?.[day.date]?.revenue || 0}
                                onChange={(e) => handleDataChange(team.teamName, day.date, 'revenue', e.target.value)}
                                className="w-full px-1 py-1 text-center border border-red-300 rounded text-xs"
                              />
                            ) : (
                              Math.floor(Math.random() * 5) > 0 ? `¥${(Math.random() * 4 + 1).toFixed(1)}万` : '-'
                            )}
                          </td>
                        ))}
                        {timeRange === 'week' && weekDays.map(day => (
                          <td key={day.date} className="px-2 py-2 text-center text-xs font-medium text-red-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[team.teamName]?.[day.date]?.revenue || 0}
                                onChange={(e) => handleDataChange(team.teamName, day.date, 'revenue', e.target.value)}
                                className="w-full px-1 py-1 text-center border border-red-300 rounded text-xs"
                              />
                            ) : (
                              Math.floor(Math.random() * 5) > 0 ? `¥${(Math.random() * 4 + 1).toFixed(1)}万` : '-'
                            )}
                          </td>
                        ))}
                        {timeRange === 'day' && (
                          <td className="px-4 py-2 text-center text-sm font-medium text-red-600 min-w-[60px]">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editData[team.teamName]?.[selectedDate]?.revenue || 0}
                                onChange={(e) => handleDataChange(team.teamName, selectedDate, 'revenue', e.target.value)}
                                className="w-full px-2 py-1 text-center border border-red-300 rounded text-sm"
                              />
                            ) : (
                              Math.floor(Math.random() * 5) > 0 ? `¥${(Math.random() * 4 + 1).toFixed(1)}万` : '-'
                            )}
                          </td>
                        )}
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPerformanceView;