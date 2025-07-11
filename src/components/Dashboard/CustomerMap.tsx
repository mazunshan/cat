import React, { useMemo } from 'react';
import { MapPin, Users } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerMapProps {
  customers: Customer[];
}

// 中国主要省份/直辖市的精确坐标数据 (基于标准地图投影)
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
  '内蒙古': { x: 111.8, y: 40.8, name: '内蒙古自治区' },
  '西藏': { x: 91.1, y: 29.7, name: '西藏自治区' },
  '宁夏': { x: 106.3, y: 38.5, name: '宁夏回族自治区' },
  '青海': { x: 101.8, y: 36.6, name: '青海省' },
  '甘肃': { x: 103.8, y: 36.1, name: '甘肃省' },
  '海南': { x: 110.3, y: 20.0, name: '海南省' }
};

// 坐标转换函数：将经纬度转换为SVG坐标
const convertToSVGCoords = (lng: number, lat: number) => {
  // 中国地图的经纬度范围
  const minLng = 73.5;
  const maxLng = 135.0;
  const minLat = 18.0;
  const maxLat = 53.5;
  
  // SVG画布尺寸
  const svgWidth = 800;
  const svgHeight = 600;
  
  // 转换为SVG坐标
  const x = ((lng - minLng) / (maxLng - minLng)) * svgWidth;
  const y = svgHeight - ((lat - minLat) / (maxLat - minLat)) * svgHeight;
  
  return { x, y };
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
    const minSize = 6;
    const maxSize = 20;
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
        <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg relative overflow-hidden border border-gray-200">
          {/* SVG 中国地图 */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 800 600" 
            className="absolute inset-0"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
          >
            {/* 中国地图轮廓 - 使用更精确的路径 */}
            <g fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5">
              {/* 主要大陆轮廓 */}
              <path d="M 158 180 L 180 160 L 220 140 L 280 125 L 340 115 L 400 110 L 460 115 L 520 125 L 580 140 L 620 160 L 650 185 L 670 215 L 680 250 L 685 285 L 690 320 L 685 355 L 675 390 L 660 420 L 640 445 L 615 465 L 585 480 L 550 490 L 515 495 L 480 500 L 445 495 L 410 490 L 375 485 L 340 475 L 305 465 L 270 450 L 240 430 L 215 405 L 195 375 L 180 340 L 170 305 L 165 270 L 160 235 L 158 200 Z" />
              
              {/* 新疆 */}
              <path d="M 80 200 L 120 180 L 160 185 L 180 205 L 175 235 L 165 265 L 150 285 L 125 295 L 100 290 L 80 270 L 75 240 L 78 220 Z" />
              
              {/* 西藏 */}
              <path d="M 120 320 L 180 310 L 240 315 L 280 330 L 275 365 L 260 395 L 235 415 L 205 420 L 175 415 L 145 405 L 125 385 L 118 355 L 120 340 Z" />
              
              {/* 内蒙古 */}
              <path d="M 220 120 L 320 115 L 420 120 L 520 125 L 560 140 L 555 165 L 540 185 L 515 200 L 480 210 L 440 215 L 400 220 L 360 215 L 320 210 L 280 205 L 240 195 L 210 175 L 200 150 L 210 135 Z" />
              
              {/* 东北三省 */}
              <path d="M 580 100 L 620 95 L 660 100 L 685 120 L 690 145 L 685 170 L 675 190 L 660 205 L 640 215 L 615 220 L 590 215 L 570 205 L 555 190 L 550 170 L 555 150 L 565 130 L 575 115 Z" />
              
              {/* 海南岛 */}
              <ellipse cx="440" cy="520" rx="20" ry="12" />
              
              {/* 台湾岛 */}
              <ellipse cx="620" cy="420" rx="8" ry="25" />
            </g>
            
            {/* 省份分界线 */}
            <g stroke="#94A3B8" strokeWidth="0.8" fill="none" opacity="0.6">
              {/* 华北分界 */}
              <line x1="400" y1="180" x2="500" y2="220" />
              <line x1="450" y1="160" x2="550" y2="200" />
              
              {/* 华东分界 */}
              <line x1="500" y1="220" x2="600" y2="280" />
              <line x1="520" y1="240" x2="620" y2="300" />
              
              {/* 华中分界 */}
              <line x1="400" y1="280" x2="550" y2="340" />
              <line x1="420" y1="300" x2="570" y2="360" />
              
              {/* 华南分界 */}
              <line x1="350" y1="400" x2="570" y2="460" />
              <line x1="380" y1="420" x2="550" y2="480" />
              
              {/* 西南分界 */}
              <line x1="280" y1="350" x2="450" y2="430" />
              <line x1="320" y1="370" x2="480" y2="450" />
              
              {/* 西北分界 */}
              <line x1="200" y1="250" x2="400" y2="300" />
              <line x1="250" y1="230" x2="450" y2="280" />
            </g>
            
            {/* 主要省份标签 */}
            <g fontSize="11" fill="#475569" fontWeight="500" textAnchor="middle">
              <text x="100" y="240">新疆</text>
              <text x="400" y="170">内蒙古</text>
              <text x="630" y="130">黑龙江</text>
              <text x="590" y="160">吉林</text>
              <text x="620" y="190">辽宁</text>
              <text x="470" y="200">北京</text>
              <text x="500" y="210">天津</text>
              <text x="460" y="230">河北</text>
              <text x="450" y="260">山西</text>
              <text x="520" y="250">山东</text>
              <text x="570" y="280">江苏</text>
              <text x="590" y="320">上海</text>
              <text x="580" y="350">浙江</text>
              <text x="470" y="290">河南</text>
              <text x="520" y="320">安徽</text>
              <text x="480" y="340">湖北</text>
              <text x="520" y="380">江西</text>
              <text x="460" y="380">湖南</text>
              <text x="560" y="420">福建</text>
              <text x="480" y="460">广东</text>
              <text x="420" y="440">广西</text>
              <text x="440" y="520">海南</text>
              <text x="380" y="420">贵州</text>
              <text x="320" y="380">四川</text>
              <text x="280" y="440">云南</text>
              <text x="200" y="360">西藏</text>
              <text x="320" y="280">青海</text>
              <text x="360" y="300">甘肃</text>
              <text x="380" y="260">宁夏</text>
              <text x="400" y="240">陕西</text>
            </g>
          </svg>

          {/* 客户分布点 */}
          {Object.entries(customerDistribution).map(([province, data]) => {
            const coords = provinceCoordinates[province];
            if (!coords) return null;

            const svgCoords = convertToSVGCoords(coords.x, coords.y);
            const size = getCircleSize(data.count);
            const color = getCircleColor(data.count);

            return (
              <div
                key={province}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                style={{
                  left: `${(svgCoords.x / 800) * 100}%`,
                  top: `${(svgCoords.y / 600) * 100}%`
                }}
              >
                {/* 客户分布圆点 */}
                <div
                  className="rounded-full border-2 border-white shadow-lg transition-all duration-300 group-hover:scale-150 group-hover:shadow-xl group-hover:z-20"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    boxShadow: `0 0 0 2px white, 0 4px 12px rgba(0,0,0,0.2)`
                  }}
                />
                
                {/* 悬浮提示 */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-gray-700">
                    <div className="font-semibold text-blue-200">{coords.name}</div>
                    <div className="text-gray-300">{data.count} 位客户</div>
                    <div className="text-xs text-gray-400 mt-1">
                      占比 {((data.count / customers.length) * 100).toFixed(1)}%
                    </div>
                    {/* 小箭头 */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 地图标题 */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200">
            <div className="text-sm font-semibold text-gray-800">中国客户分布图</div>
            <div className="text-xs text-gray-600 mt-1">圆点大小表示客户数量</div>
          </div>

          {/* 指南针 */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
            <div className="w-10 h-10 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-400 rounded-full relative bg-white">
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-500"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-gray-700">N</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 图例 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-700">客户密度:</div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-2 border-2 border-white shadow-sm"></div>
                <span className="text-xs text-gray-600">高</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 mr-2 border-2 border-white shadow-sm"></div>
                <span className="text-xs text-gray-600">中</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2 border-2 border-white shadow-sm"></div>
                <span className="text-xs text-gray-600">低</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-gray-500 mr-2 border-2 border-white shadow-sm"></div>
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
        <h4 className="text-sm font-semibold text-gray-800 mb-3">地区客户统计排行</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-40 overflow-y-auto">
          {Object.entries(customerDistribution)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 16) // 显示前16个地区
            .map(([province, data], index) => (
              <div key={province} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-blue-100 transition-all duration-200 border border-gray-200">
                <div className="flex items-center">
                  <span className="text-xs font-bold text-gray-500 mr-2">#{index + 1}</span>
                  <span className="text-sm text-gray-700 truncate">{province}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-blue-600 mr-1">{data.count}</span>
                  <span className="text-xs text-gray-500">人</span>
                </div>
              </div>
            ))}
        </div>
        
        {Object.keys(customerDistribution).length > 16 && (
          <div className="text-xs text-gray-500 mt-3 text-center bg-gray-50 rounded-lg py-2">
            还有 {Object.keys(customerDistribution).length - 16} 个地区未显示
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMap;