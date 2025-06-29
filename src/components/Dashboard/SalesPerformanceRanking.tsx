import React from 'react';
import { Trophy, TrendingUp, Users, DollarSign, Award, Star } from 'lucide-react';
import { Order, Customer } from '../../types';

interface SalesPerformanceRankingProps {
  orders: Order[];
  customers: Customer[];
}

interface SalesPerformance {
  name: string;
  totalSales: number;
  orderCount: number;
  customerCount: number;
  averageOrderValue: number;
  conversionRate: number;
  rank: number;
  growth: number;
}

const SalesPerformanceRanking: React.FC<SalesPerformanceRankingProps> = ({ orders, customers }) => {
  // 销售人员列表 - 与其他模板保持一致
  const salesPeople = ['Alice Chen', 'Bob Wang', 'Carol Li', 'David Zhang'];

  // 计算销售业绩
  const calculateSalesPerformance = (): SalesPerformance[] => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    return salesPeople.map((salesperson, index) => {
      // 当月订单
      const currentMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return order.salesPerson === salesperson &&
               orderDate.getMonth() === currentMonth &&
               orderDate.getFullYear() === currentYear;
      });

      // 上月订单
      const lastMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return order.salesPerson === salesperson &&
               orderDate.getMonth() === lastMonth &&
               orderDate.getFullYear() === lastMonthYear;
      });

      // 该销售员的所有订单
      const allOrders = orders.filter(order => order.salesPerson === salesperson);
      
      // 该销售员的客户
      const salesCustomers = customers.filter(customer => customer.assignedSales === salesperson);

      const totalSales = currentMonthOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
      const lastMonthSales = lastMonthOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
      const orderCount = currentMonthOrders.length;
      const customerCount = salesCustomers.length;
      const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
      
      // 转化率 = 有订单的客户数 / 总客户数
      const customersWithOrders = salesCustomers.filter(customer => 
        allOrders.some(order => order.customerId === customer.id)
      ).length;
      const conversionRate = customerCount > 0 ? (customersWithOrders / customerCount) * 100 : 0;

      // 增长率
      const growth = lastMonthSales > 0 ? ((totalSales - lastMonthSales) / lastMonthSales) * 100 : 0;

      return {
        name: salesperson,
        totalSales,
        orderCount,
        customerCount,
        averageOrderValue,
        conversionRate,
        rank: index + 1, // 临时排名，稍后会重新排序
        growth
      };
    }).sort((a, b) => b.totalSales - a.totalSales) // 按销售额排序
      .map((performance, index) => ({ ...performance, rank: index + 1 })); // 重新分配排名
  };

  const performanceData = calculateSalesPerformance();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Award className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Star className="w-5 h-5 text-orange-500" />;
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-gray-500 font-bold text-sm">{rank}</div>;
    }
  };

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">销售业绩排名</h3>
        </div>
        <span className="text-sm text-gray-500">本月数据</span>
      </div>

      <div className="space-y-4">
        {performanceData.map((performance) => (
          <div
            key={performance.name}
            className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              performance.rank === 1 
                ? 'border-yellow-200 bg-yellow-50' 
                : performance.rank === 2
                ? 'border-gray-200 bg-gray-50'
                : performance.rank === 3
                ? 'border-orange-200 bg-orange-50'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            {/* 排名徽章 */}
            <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeStyle(performance.rank)}`}>
              {performance.rank}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {getRankIcon(performance.rank)}
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-800">{performance.name}</h4>
                  <p className="text-sm text-gray-600">第 {performance.rank} 名</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  ¥{(performance.totalSales / 10000).toFixed(1)}万
                </div>
                <div className={`text-sm flex items-center ${
                  performance.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {performance.growth >= 0 ? '+' : ''}{performance.growth.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* 详细数据 */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <DollarSign className="w-4 h-4 text-blue-500 mr-1" />
                </div>
                <div className="text-sm font-medium text-gray-900">{performance.orderCount}</div>
                <div className="text-xs text-gray-500">订单数</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-green-500 mr-1" />
                </div>
                <div className="text-sm font-medium text-gray-900">{performance.customerCount}</div>
                <div className="text-xs text-gray-500">客户数</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                </div>
                <div className="text-sm font-medium text-gray-900">{performance.conversionRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">转化率</div>
              </div>
            </div>

            {/* 平均订单价值 */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">平均订单价值</span>
                <span className="text-sm font-medium text-gray-900">
                  ¥{performance.averageOrderValue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 第一名特殊效果 */}
            {performance.rank === 1 && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 pointer-events-none">
                <div className="absolute top-2 left-2">
                  <div className="flex items-center text-yellow-600">
                    <Trophy className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">销冠</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 总结信息 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">团队总销售额</span>
            <div className="font-bold text-gray-900">
              ¥{(performanceData.reduce((sum, p) => sum + p.totalSales, 0) / 10000).toFixed(1)}万
            </div>
          </div>
          <div>
            <span className="text-gray-600">团队总订单</span>
            <div className="font-bold text-gray-900">
              {performanceData.reduce((sum, p) => sum + p.orderCount, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPerformanceRanking;