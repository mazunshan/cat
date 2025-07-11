import React, { useMemo } from 'react';
import { MapPin, Users } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerMapProps {
  customers: Customer[];
}

// 中国主要省份/直辖市的坐标数据
const provinceCoordinates: Record<string, { x: number; y: number; name: string }> = {
  '北京': { x: 116.4, y: 39.9, name: '北京市' },
  '上海': { x: 121.5, y: 31.2, name: '上海市' },
  '天津': { x: 117.2, y: 39.1, name: '天津市' },
  '重庆': { x: 106.5, y: 29.6, name: '重庆市' },
  '广东': { x: 113.3, y: 23.1, name: '广东省' },
  '江苏': { x: 118.8, y: 32.1, name: '江苏省' },
  '浙江': { x: 120.2, y: 30.3, name: '浙江省' },
  '山东': { x: 117.0, y: 36.7, name: '山东省' },
  '河南': { x: 113.6, y: 34.8, name: '河南省' },
  '四川': { x: 104.1, y: 30.7, name: '四川省' },
  '湖北': { x: 114.3, y: 30.6, name: '湖北省' },
  '湖南': { x: 112.9, y: 28.2, name: '湖南省' },
  '河北': { x: 114.5, y: 38.0, name: '河北省' },
  '福建': { x: 119.3, y: 26.1, name: '福建省' },
  '安徽': { x: 117.3, y: 31.9, name: '安徽省' },
  '辽宁': { x: 123.4, y: 41.8, name: '辽宁省' },
  '陕西': { x: 108.9, y: 34.3, name: '陕西省' },
  '江西': { x: 115.9, y: 28.7, name: '江西省' },
  '山西': { x: 112.5, y: 37.9, name: '山西省' },
  '黑龙江': { x: 126.6, y: 45.8, name: '黑龙江省' },
  '吉林': { x: 125.3, y: 43.9, name: '吉林省' },
  '云南': { x: 102.7, y: 25.0, name: '云南省' },
  '贵州': { x: 106.7, y: 26.6, name: '贵州省' },
  '广西': { x: 108.3, y: 22.8, name: '广西壮族自治区' },
  '新疆': { x: 87.6, y: 43.8, name: '新疆维吾尔自治区' },
  '内蒙古': { x: 111.7, y: 40.8, name: '内蒙古自治区' },
  '西藏': { x: 91.1, y: 29.7, name: '西藏自治区' },
  '宁夏': { x: 106.3, y: 38.5, name: '宁夏回族自治区' },
  '青海': { x: 101.8, y: 36.6, name: '青海省' },
  '甘肃': { x: 103.8, y: 36.1, name: '甘肃省' },
  '海南': { x: 110.3, y: 20.0, name: '海南省' }
};

const CustomerMap: React.FC<CustomerMapProps> = ({ customers }) => {
  // 分析客户地址分布
  const customerDistribution = useMemo(() => {
    const distribution: Record<string, { count: number; customers: Customer[] }> = {};
    
    customers.forEach(customer => {
      if (customer.address) {
        // 简单的地址解析，提取省份信息
        let province = '';
        for (const [key] of Object.entries(provinceCoordinates)) {
          if (customer.address.includes(key)) {
            province = key;
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

  // 获取最大客户数量用于计算圆点大小
  const maxCount = Math.max(...Object.values(customerDistribution).map(d => d.count), 1);

  // 计算圆点大小
  const getCircleSize = (count: number) => {
    const minSize = 8;
    const maxSize = 24;
    return minSize + (count / maxCount) * (maxSize - minSize);
  };

  // 获取颜色强度
  const getCircleColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.7) return '#DC2626'; // 红色 - 高密度
    if (intensity > 0.4) return '#F59E0B'; // 橙色 - 中密度
    if (intensity > 0.2) return '#10B981'; // 绿色 - 低密度
    return '#6B7280'; // 灰色 - 极低密度
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          客户地域分布
        </h3>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-1" />
          <span>总计 {customers.length} 位客户</span>
        </div>
      </div>

      {/* 地图容器 */}
      <div className="relative">
        {/* 简化的中国地图背景 */}
        <div className="w-full h-80 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg relative overflow-hidden">
          {/* 地图网格背景 */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" className="text-blue-200">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* 客户分布点 */}
          {Object.entries(customerDistribution).map(([province, data]) => {
            const coords = provinceCoordinates[province];
            if (!coords) return null;

            // 将经纬度转换为相对位置 (简化计算)
            const x = ((coords.x - 73) / (135 - 73)) * 100; // 经度范围大约 73-135
            const y = ((53 - coords.y) / (53 - 18)) * 100; // 纬度范围大约 18-53，Y轴反转

            const size = getCircleSize(data.count);
            const color = getCircleColor(data.count);

            return (
              <div
                key={province}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{
                  left: `${Math.max(5, Math.min(95, x))}%`,
                  top: `${Math.max(5, Math.min(95, y))}%`
                }}
              >
                {/* 客户分布圆点 */}
                <div
                  className="rounded-full border-2 border-white shadow-lg transition-all duration-200 group-hover:scale-125"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color
                  }}
                />
                
                {/* 悬浮提示 */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                    <div className="font-medium">{coords.name}</div>
                    <div>{data.count} 位客户</div>
                    {/* 小箭头 */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 地图标题 */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <div className="text-sm font-medium text-gray-800">中国客户分布图</div>
            <div className="text-xs text-gray-600">圆点大小表示客户数量</div>
          </div>
        </div>

        {/* 图例 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">客户密度:</div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span className="text-xs text-gray-600">高</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                <span className="text-xs text-gray-600">中</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-xs text-gray-600">低</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-500 mr-1"></div>
                <span className="text-xs text-gray-600">极低</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 详细统计列表 */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-800 mb-3">地区客户统计</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-32 overflow-y-auto">
          {Object.entries(customerDistribution)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 12) // 只显示前12个地区
            .map(([province, data]) => (
              <div key={province} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 truncate">{province}</span>
                <span className="text-sm font-medium text-blue-600 ml-2">{data.count}</span>
              </div>
            ))}
        </div>
        
        {Object.keys(customerDistribution).length > 12 && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            还有 {Object.keys(customerDistribution).length - 12} 个地区...
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMap;