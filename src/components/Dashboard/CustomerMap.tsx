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
        {/* 中国地图背景 */}
        <div className="w-full h-80 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg relative overflow-hidden border border-gray-200">
          {/* SVG 中国地图轮廓 */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 800 600" 
            className="absolute inset-0"
            style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))' }}
          >
            {/* 中国大陆轮廓 (简化版) */}
            <path
              d="M 150 180 L 200 160 L 280 140 L 350 130 L 420 140 L 480 160 L 540 180 L 580 220 L 600 280 L 590 340 L 570 380 L 540 420 L 480 450 L 420 460 L 360 450 L 300 440 L 240 420 L 180 380 L 150 340 L 140 280 L 150 220 Z"
              fill="#E2E8F0"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
            
            {/* 海南岛 */}
            <ellipse cx="320" cy="480" rx="25" ry="15" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1"/>
            
            {/* 台湾岛 */}
            <ellipse cx="520" cy="380" rx="15" ry="35" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1"/>
            
            {/* 省份边界线 (简化) */}
            <g stroke="#CBD5E1" strokeWidth="1" fill="none" opacity="0.6">
              <line x1="200" y1="160" x2="300" y2="300" />
              <line x1="280" y1="140" x2="400" y2="280" />
              <line x1="350" y1="130" x2="450" y2="250" />
              <line x1="420" y1="140" x2="500" y2="280" />
              <line x1="300" y1="200" x2="500" y2="200" />
              <line x1="250" y1="250" x2="550" y2="250" />
              <line x1="200" y1="300" x2="580" y2="300" />
              <line x1="180" y1="350" x2="570" y2="350" />
            </g>
            
            {/* 地理标识 */}
            <text x="100" y="120" fontSize="12" fill="#64748B" fontWeight="500">新疆</text>
            <text x="200" y="100" fontSize="12" fill="#64748B" fontWeight="500">内蒙古</text>
            <text x="450" y="110" fontSize="12" fill="#64748B" fontWeight="500">黑龙江</text>
            <text x="350" y="200" fontSize="12" fill="#64748B" fontWeight="500">北京</text>
            <text x="500" y="250" fontSize="12" fill="#64748B" fontWeight="500">上海</text>
            <text x="300" y="350" fontSize="12" fill="#64748B" fontWeight="500">广东</text>
            <text x="150" y="400" fontSize="12" fill="#64748B" fontWeight="500">云南</text>
            <text x="120" y="300" fontSize="12" fill="#64748B" fontWeight="500">西藏</text>
            <text x="400" y="320" fontSize="12" fill="#64748B" fontWeight="500">湖南</text>
            <text x="250" y="280" fontSize="12" fill="#64748B" fontWeight="500">四川</text>
          </svg>

          {/* 客户分布点 */}
          {Object.entries(customerDistribution).map(([province, data]) => {
            const coords = provinceCoordinates[province];
            if (!coords) return null;

            // 将经纬度转换为SVG坐标系
            const x = ((coords.x - 73) / (135 - 73)) * 800; // 经度范围大约 73-135
            const y = ((53 - coords.y) / (53 - 18)) * 600; // 纬度范围大约 18-53，Y轴反转

            const size = getCircleSize(data.count);
            const color = getCircleColor(data.count);

            return (
              <div
                key={province}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                style={{
                  left: `${(x / 800) * 100}%`,
                  top: `${(y / 600) * 100}%`
                }}
              >
                {/* 客户分布圆点 */}
                <div
                  className="rounded-full border-2 border-white shadow-lg transition-all duration-200 group-hover:scale-125 group-hover:shadow-xl"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    boxShadow: `0 0 0 2px white, 0 4px 12px rgba(0,0,0,0.15)`
                  }}
                />
                
                {/* 悬浮提示 */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
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
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-800">中国客户分布图</div>
            <div className="text-xs text-gray-600">圆点大小表示客户数量</div>
          </div>

          {/* 指南针 */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-gray-200">
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-500"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-gray-600">N</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 图例 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">客户密度:</div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-2 border border-white shadow-sm"></div>
                <span className="text-xs text-gray-600">高</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 mr-2 border border-white shadow-sm"></div>
                <span className="text-xs text-gray-600">中</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2 border border-white shadow-sm"></div>
                <span className="text-xs text-gray-600">低</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-gray-500 mr-2 border border-white shadow-sm"></div>
                <span className="text-xs text-gray-600">极低</span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            点击圆点查看详细信息
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
              <div key={province} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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