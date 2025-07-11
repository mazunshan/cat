import React, { useMemo } from 'react';
import { MapPin, Users } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerMapProps {
  customers: Customer[];
}

// 中国主要省份/直辖市的坐标数据 (基于SVG坐标系统)
const provinceCoordinates: Record<string, { x: number; y: number; name: string }> = {
  '北京': { x: 420, y: 180, name: '北京市' },
  '上海': { x: 520, y: 280, name: '上海市' },
  '天津': { x: 430, y: 170, name: '天津市' },
  '重庆': { x: 350, y: 320, name: '重庆市' },
  '广东': { x: 450, y: 420, name: '广东省' },
  '江苏': { x: 500, y: 260, name: '江苏省' },
  '浙江': { x: 520, y: 300, name: '浙江省' },
  '山东': { x: 460, y: 220, name: '山东省' },
  '河南': { x: 420, y: 260, name: '河南省' },
  '四川': { x: 300, y: 320, name: '四川省' },
  '湖北': { x: 420, y: 300, name: '湖北省' },
  '湖南': { x: 400, y: 340, name: '湖南省' },
  '河北': { x: 430, y: 200, name: '河北省' },
  '福建': { x: 500, y: 360, name: '福建省' },
  '安徽': { x: 480, y: 280, name: '安徽省' },
  '辽宁': { x: 500, y: 140, name: '辽宁省' },
  '陕西': { x: 360, y: 260, name: '陕西省' },
  '江西': { x: 470, y: 320, name: '江西省' },
  '山西': { x: 400, y: 220, name: '山西省' },
  '黑龙江': { x: 520, y: 100, name: '黑龙江省' },
  '吉林': { x: 510, y: 120, name: '吉林省' },
  '云南': { x: 280, y: 380, name: '云南省' },
  '贵州': { x: 320, y: 360, name: '贵州省' },
  '广西': { x: 380, y: 400, name: '广西壮族自治区' },
  '新疆': { x: 150, y: 200, name: '新疆维吾尔自治区' },
  '内蒙古': { x: 380, y: 140, name: '内蒙古自治区' },
  '西藏': { x: 200, y: 320, name: '西藏自治区' },
  '宁夏': { x: 360, y: 220, name: '宁夏回族自治区' },
  '青海': { x: 280, y: 240, name: '青海省' },
  '甘肃': { x: 320, y: 220, name: '甘肃省' },
  '海南': { x: 420, y: 480, name: '海南省' }
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
        <div className="w-full h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg relative overflow-hidden border border-gray-200">
          {/* SVG 中国地图轮廓 */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 640 480" 
            className="absolute inset-0"
            style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))' }}
          >
            {/* 中国大陆轮廓 (更准确的形状) */}
            <path
              d="M 120 200 
                 L 140 180 L 160 160 L 200 140 L 240 130 L 280 125 L 320 120 L 360 115 L 400 110 L 440 115 L 480 120 L 520 130 L 540 140 L 560 160 L 570 180 L 575 200 L 580 220 L 585 240 L 590 260 L 595 280 L 600 300 L 595 320 L 590 340 L 580 360 L 570 380 L 555 400 L 540 415 L 520 430 L 500 440 L 480 445 L 460 450 L 440 455 L 420 460 L 400 465 L 380 460 L 360 455 L 340 450 L 320 445 L 300 440 L 280 435 L 260 425 L 240 415 L 220 400 L 200 385 L 185 370 L 170 350 L 160 330 L 155 310 L 150 290 L 145 270 L 140 250 L 135 230 L 130 210 Z"
              fill="#F1F5F9"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
            
            {/* 新疆地区 */}
            <path
              d="M 80 160 L 120 140 L 160 150 L 180 170 L 170 200 L 150 220 L 120 230 L 90 220 L 70 200 L 75 180 Z"
              fill="#F1F5F9"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
            
            {/* 西藏地区 */}
            <path
              d="M 150 280 L 200 270 L 250 275 L 280 290 L 270 320 L 250 340 L 220 350 L 190 345 L 160 335 L 140 315 L 145 295 Z"
              fill="#F1F5F9"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
            
            {/* 内蒙古地区 */}
            <path
              d="M 200 100 L 300 95 L 400 100 L 500 105 L 520 120 L 510 140 L 480 150 L 450 155 L 400 160 L 350 165 L 300 160 L 250 155 L 200 150 L 180 130 L 190 110 Z"
              fill="#F1F5F9"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
            
            {/* 东北地区轮廓 */}
            <path
              d="M 480 80 L 520 75 L 560 80 L 580 100 L 575 120 L 570 140 L 550 155 L 530 160 L 510 155 L 490 150 L 475 130 L 470 110 L 475 90 Z"
              fill="#F1F5F9"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
            
            {/* 海南岛 */}
            <ellipse cx="420" cy="480" rx="25" ry="15" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2"/>
            
            {/* 台湾岛 */}
            <ellipse cx="550" cy="380" rx="12" ry="30" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2"/>
            
            {/* 省份边界线 (简化) */}
            <g stroke="#CBD5E1" strokeWidth="1" fill="none" opacity="0.5">
              {/* 华北地区分界 */}
              <line x1="350" y1="160" x2="450" y2="200" />
              <line x1="400" y1="160" x2="500" y2="180" />
              
              {/* 华东地区分界 */}
              <line x1="450" y1="200" x2="550" y2="250" />
              <line x1="480" y1="220" x2="580" y2="280" />
              
              {/* 华中地区分界 */}
              <line x1="350" y1="250" x2="500" y2="300" />
              <line x1="380" y1="280" x2="520" y2="320" />
              
              {/* 华南地区分界 */}
              <line x1="320" y1="350" x2="520" y2="400" />
              <line x1="350" y1="380" x2="500" y2="420" />
              
              {/* 西南地区分界 */}
              <line x1="250" y1="300" x2="400" y2="380" />
              <line x1="280" y1="320" x2="380" y2="400" />
              
              {/* 西北地区分界 */}
              <line x1="200" y1="200" x2="350" y2="250" />
              <line x1="250" y1="180" x2="400" y2="220" />
            </g>
            
            {/* 主要城市标识 */}
            <g fontSize="10" fill="#64748B" fontWeight="500">
              <text x="100" y="180">新疆</text>
              <text x="350" y="130">内蒙古</text>
              <text x="500" y="90">黑龙江</text>
              <text x="420" y="170">北京</text>
              <text x="520" y="270">上海</text>
              <text x="450" y="410">广东</text>
              <text x="280" y="370">云南</text>
              <text x="180" y="310">西藏</text>
              <text x="400" y="330">湖南</text>
              <text x="300" y="310">四川</text>
              <text x="460" y="210">山东</text>
              <text x="420" y="250">河南</text>
            </g>
          </svg>

          {/* 客户分布点 */}
          {Object.entries(customerDistribution).map(([province, data]) => {
            const coords = provinceCoordinates[province];
            if (!coords) return null;

            const size = getCircleSize(data.count);
            const color = getCircleColor(data.count);

            return (
              <div
                key={province}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                style={{
                  left: `${(coords.x / 640) * 100}%`,
                  top: `${(coords.y / 480) * 100}%`
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
            悬停查看详细信息
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