import React, { useMemo } from 'react';
import { MapPin, Users, TrendingUp } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerMapProps {
  customers: Customer[];
}

// 中国主要省份/直辖市列表
const provinces = [
  '北京', '上海', '天津', '重庆', '广东', '江苏', '浙江', '山东', 
  '河南', '四川', '湖北', '湖南', '河北', '福建', '安徽', '辽宁', 
  '陕西', '江西', '山西', '黑龙江', '吉林', '云南', '贵州', '广西', 
  '新疆', '内蒙古', '西藏', '宁夏', '青海', '甘肃', '海南'
];

const CustomerRegionStats: React.FC<CustomerMapProps> = ({ customers }) => {
  // 分析客户地址分布
  const customerDistribution = useMemo(() => {
    const distribution: Record<string, { count: number; customers: Customer[] }> = {};
    
    customers.forEach(customer => {
      if (customer.address) {
        // 简单的地址解析，提取省份信息
        let province = '';
        for (const prov of provinces) {
          if (customer.address.includes(prov)) {
            province = prov;
            break;
          }
        }
        
        // 如果没有匹配到具体省份，尝试匹配城市
        if (!province) {
          if (customer.address.includes('北京')) province = '北京';
          else if (customer.address.includes('上海')) province = '上海';
          else if (customer.address.includes('天津')) province = '天津';
          else if (customer.address.includes('重庆')) province = '重庆';
          else if (customer.address.includes('深圳') || customer.address.includes('广州') || customer.address.includes('东莞')) province = '广东';
          else if (customer.address.includes('杭州') || customer.address.includes('宁波') || customer.address.includes('温州')) province = '浙江';
          else if (customer.address.includes('南京') || customer.address.includes('苏州') || customer.address.includes('无锡')) province = '江苏';
          else if (customer.address.includes('成都')) province = '四川';
          else if (customer.address.includes('武汉')) province = '湖北';
          else if (customer.address.includes('长沙')) province = '湖南';
          else if (customer.address.includes('西安')) province = '陕西';
          else if (customer.address.includes('郑州')) province = '河南';
          else if (customer.address.includes('济南') || customer.address.includes('青岛')) province = '山东';
          else province = '其他';
        }
        
        if (!distribution[province]) {
          distribution[province] = { count: 0, customers: [] };
        }
        distribution[province].count++;
        distribution[province].customers.push(customer);
      }
    });
    
    return distribution;
  }, [customers]);

  // 排序后的地区数据
  const sortedRegions = Object.entries(customerDistribution)
    .sort(([,a], [,b]) => b.count - a.count);

  // 计算统计数据
  const totalCustomers = customers.length;
  const topRegion = sortedRegions[0];
  const regionsWithCustomers = sortedRegions.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          客户地域分布统计
        </h3>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-1" />
          <span>总计 {totalCustomers} 位客户</span>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">覆盖地区</p>
              <p className="text-2xl font-bold text-blue-700">{regionsWithCustomers}</p>
              <p className="text-xs text-blue-500 mt-1">个省市</p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">最大市场</p>
              <p className="text-2xl font-bold text-green-700">{topRegion ? topRegion[0] : '-'}</p>
              <p className="text-xs text-green-500 mt-1">{topRegion ? `${topRegion[1].count} 位客户` : '暂无数据'}</p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">市场占有率</p>
              <p className="text-2xl font-bold text-purple-700">
                {topRegion ? ((topRegion[1].count / totalCustomers) * 100).toFixed(1) : '0'}%
              </p>
              <p className="text-xs text-purple-500 mt-1">最大市场份额</p>
            </div>
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 地区排行榜 */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-gray-600" />
          地区客户排行榜
        </h4>
        
        {sortedRegions.length > 0 ? (
          <div className="space-y-3">
            {sortedRegions.map(([province, data], index) => {
              const percentage = ((data.count / totalCustomers) * 100).toFixed(1);
              const isTop3 = index < 3;
              
              return (
                <div 
                  key={province} 
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    isTop3 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    {/* 排名徽章 */}
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 font-bold text-sm ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-300 text-orange-800' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    
                    {/* 地区信息 */}
                    <div>
                      <div className="flex items-center">
                        <span className={`font-semibold ${isTop3 ? 'text-blue-800' : 'text-gray-800'}`}>
                          {province}
                        </span>
                        {isTop3 && (
                          <span className="ml-2 px-2 py-1 bg-blue-200 text-blue-700 text-xs rounded-full font-medium">
                            TOP {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        占总客户数的 {percentage}%
                      </div>
                    </div>
                  </div>
                  
                  {/* 客户数量和进度条 */}
                  <div className="flex items-center">
                    <div className="text-right mr-4">
                      <div className={`text-lg font-bold ${isTop3 ? 'text-blue-700' : 'text-gray-700'}`}>
                        {data.count}
                      </div>
                      <div className="text-xs text-gray-500">位客户</div>
                    </div>
                    
                    {/* 进度条 */}
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          isTop3 ? 'bg-blue-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(100, (data.count / (topRegion?.[1].count || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">暂无客户地址数据</p>
            <p className="text-sm text-gray-400 mt-1">请在客户信息中添加详细地址</p>
          </div>
        )}
      </div>

      {/* 底部统计信息 */}
      {sortedRegions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-800">{sortedRegions.length}</div>
              <div className="text-xs text-gray-500">覆盖地区</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {sortedRegions.slice(0, 3).reduce((sum, [, data]) => sum + data.count, 0)}
              </div>
              <div className="text-xs text-gray-500">前三地区客户</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {((sortedRegions.slice(0, 3).reduce((sum, [, data]) => sum + data.count, 0) / totalCustomers) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">前三地区占比</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {(totalCustomers / sortedRegions.length).toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">平均每地区客户</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRegionStats;