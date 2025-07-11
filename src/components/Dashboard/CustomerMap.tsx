import React, { useMemo } from 'react';
import { MapPin, Users, TrendingUp, Award, Globe, BarChart3 } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerMapProps {
  customers: Customer[];
}

// 中国主要省份/直辖市及其主要城市
const provinceData = {
  '北京': { color: '#3B82F6', cities: ['北京'] },
  '上海': { color: '#10B981', cities: ['上海'] },
  '天津': { color: '#F59E0B', cities: ['天津'] },
  '重庆': { color: '#EF4444', cities: ['重庆'] },
  '广东': { color: '#8B5CF6', cities: ['广州', '深圳', '东莞', '佛山', '珠海'] },
  '江苏': { color: '#06B6D4', cities: ['南京', '苏州', '无锡', '常州', '徐州'] },
  '浙江': { color: '#84CC16', cities: ['杭州', '宁波', '温州', '嘉兴', '台州'] },
  '山东': { color: '#F97316', cities: ['济南', '青岛', '烟台', '潍坊', '临沂'] },
  '河南': { color: '#EC4899', cities: ['郑州', '洛阳', '开封', '安阳', '新乡'] },
  '四川': { color: '#6366F1', cities: ['成都', '绵阳', '德阳', '南充', '宜宾'] },
  '湖北': { color: '#14B8A6', cities: ['武汉', '宜昌', '襄阳', '荆州', '黄石'] },
  '湖南': { color: '#F43F5E', cities: ['长沙', '株洲', '湘潭', '衡阳', '邵阳'] },
  '河北': { color: '#A855F7', cities: ['石家庄', '唐山', '邯郸', '保定', '沧州'] },
  '福建': { color: '#22C55E', cities: ['福州', '厦门', '泉州', '漳州', '莆田'] },
  '安徽': { color: '#EAB308', cities: ['合肥', '芜湖', '蚌埠', '阜阳', '淮南'] },
  '辽宁': { color: '#DC2626', cities: ['沈阳', '大连', '鞍山', '抚顺', '本溪'] },
  '陕西': { color: '#7C3AED', cities: ['西安', '宝鸡', '咸阳', '渭南', '汉中'] },
  '江西': { color: '#059669', cities: ['南昌', '九江', '景德镇', '萍乡', '新余'] },
  '山西': { color: '#D97706', cities: ['太原', '大同', '阳泉', '长治', '晋城'] },
  '黑龙江': { color: '#7C2D12', cities: ['哈尔滨', '齐齐哈尔', '牡丹江', '佳木斯', '大庆'] },
  '吉林': { color: '#BE185D', cities: ['长春', '吉林', '四平', '辽源', '通化'] },
  '云南': { color: '#0891B2', cities: ['昆明', '曲靖', '玉溪', '保山', '昭通'] },
  '贵州': { color: '#65A30D', cities: ['贵阳', '六盘水', '遵义', '安顺', '毕节'] },
  '广西': { color: '#C2410C', cities: ['南宁', '柳州', '桂林', '梧州', '北海'] },
  '新疆': { color: '#9333EA', cities: ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉'] },
  '内蒙古': { color: '#0D9488', cities: ['呼和浩特', '包头', '乌海', '赤峰', '通辽'] },
  '西藏': { color: '#B91C1C', cities: ['拉萨', '日喀则', '昌都', '林芝', '山南'] },
  '宁夏': { color: '#7E22CE', cities: ['银川', '石嘴山', '吴忠', '固原', '中卫'] },
  '青海': { color: '#0369A1', cities: ['西宁', '海东', '海北', '黄南', '海南'] },
  '甘肃': { color: '#CA8A04', cities: ['兰州', '嘉峪关', '金昌', '白银', '天水'] },
  '海南': { color: '#DB2777', cities: ['海口', '三亚', '三沙', '儋州'] }
};

const CustomerRegionStats: React.FC<CustomerMapProps> = ({ customers }) => {
  // 分析客户地址分布
  const customerDistribution = useMemo(() => {
    const distribution: Record<string, { 
      count: number; 
      customers: Customer[]; 
      color: string;
      cities: Record<string, number>;
    }> = {};
    
    customers.forEach(customer => {
      if (customer.address) {
        let province = '';
        let city = '';
        
        // 匹配省份和城市
        for (const [prov, data] of Object.entries(provinceData)) {
          if (customer.address.includes(prov)) {
            province = prov;
            // 查找具体城市
            for (const cityName of data.cities) {
              if (customer.address.includes(cityName)) {
                city = cityName;
                break;
              }
            }
            break;
          }
          
          // 如果没有匹配到省份，尝试通过城市匹配
          if (!province) {
            for (const cityName of data.cities) {
              if (customer.address.includes(cityName)) {
                province = prov;
                city = cityName;
                break;
              }
            }
            if (province) break;
          }
        }
        
        if (!province) province = '其他';
        if (!city) city = '其他';
        
        if (!distribution[province]) {
          distribution[province] = { 
            count: 0, 
            customers: [], 
            color: provinceData[province]?.color || '#6B7280',
            cities: {}
          };
        }
        
        distribution[province].count++;
        distribution[province].customers.push(customer);
        distribution[province].cities[city] = (distribution[province].cities[city] || 0) + 1;
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
  const averageCustomersPerRegion = totalCustomers / regionsWithCustomers;

  // 获取排名徽章
  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: '🥇', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', text: 'text-yellow-900' };
    if (index === 1) return { icon: '🥈', color: 'bg-gradient-to-r from-gray-300 to-gray-500', text: 'text-gray-800' };
    if (index === 2) return { icon: '🥉', color: 'bg-gradient-to-r from-orange-300 to-orange-500', text: 'text-orange-900' };
    return { icon: index + 1, color: 'bg-gradient-to-r from-gray-100 to-gray-200', text: 'text-gray-600' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <Globe className="w-6 h-6 mr-3" />
              客户地理位置分布
            </h3>
            <p className="text-blue-100 mt-1">全国客户分布统计与分析</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{totalCustomers}</div>
            <div className="text-blue-100 text-sm">总客户数</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 核心指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">覆盖地区</p>
                <p className="text-2xl font-bold text-blue-700">{regionsWithCustomers}</p>
                <p className="text-xs text-blue-500 mt-1">个省市自治区</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">最大市场</p>
                <p className="text-xl font-bold text-emerald-700">{topRegion ? topRegion[0] : '-'}</p>
                <p className="text-xs text-emerald-500 mt-1">{topRegion ? `${topRegion[1].count} 位客户` : '暂无数据'}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">市场集中度</p>
                <p className="text-2xl font-bold text-purple-700">
                  {topRegion ? ((topRegion[1].count / totalCustomers) * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-xs text-purple-500 mt-1">最大市场份额</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">平均密度</p>
                <p className="text-2xl font-bold text-orange-700">
                  {averageCustomersPerRegion.toFixed(1)}
                </p>
                <p className="text-xs text-orange-500 mt-1">客户/地区</p>
              </div>
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 地区排行榜 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-gray-800 flex items-center">
              <Award className="w-5 h-5 mr-2 text-gray-600" />
              地区客户排行榜
            </h4>
            <div className="text-sm text-gray-500">
              按客户数量排序
            </div>
          </div>
          
          {sortedRegions.length > 0 ? (
            <div className="space-y-4">
              {sortedRegions.map(([province, data], index) => {
                const percentage = ((data.count / totalCustomers) * 100).toFixed(1);
                const isTop3 = index < 3;
                const badge = getRankBadge(index);
                const maxCount = sortedRegions[0][1].count;
                const barWidth = (data.count / maxCount) * 100;
                
                return (
                  <div 
                    key={province} 
                    className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                      isTop3 
                        ? 'bg-gradient-to-r from-white via-blue-50 to-indigo-50 border-blue-200 shadow-md' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* 背景进度条 */}
                    <div 
                      className="absolute inset-0 opacity-10 transition-all duration-500"
                      style={{ 
                        background: `linear-gradient(90deg, ${data.color}20 0%, ${data.color}10 ${barWidth}%, transparent ${barWidth}%)` 
                      }}
                    />
                    
                    <div className="relative p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* 排名徽章 */}
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg shadow-md ${badge.color} ${badge.text}`}>
                            {badge.icon}
                          </div>
                          
                          {/* 地区信息 */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h5 className={`text-lg font-bold ${isTop3 ? 'text-blue-800' : 'text-gray-800'}`}>
                                {province}
                              </h5>
                              {isTop3 && (
                                <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium shadow-sm">
                                  TOP {index + 1}
                                </span>
                              )}
                              <div 
                                className="w-4 h-4 rounded-full shadow-sm border-2 border-white"
                                style={{ backgroundColor: data.color }}
                              />
                            </div>
                            
                            {/* 城市分布 */}
                            <div className="mt-2">
                              <div className="text-sm text-gray-600 mb-1">主要城市分布：</div>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(data.cities)
                                  .sort(([,a], [,b]) => b - a)
                                  .slice(0, 5)
                                  .map(([city, count]) => (
                                    <span 
                                      key={city}
                                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                    >
                                      {city} ({count})
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 统计数据 */}
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${isTop3 ? 'text-blue-700' : 'text-gray-700'}`}>
                            {data.count}
                          </div>
                          <div className="text-sm text-gray-500">位客户</div>
                          <div className={`text-lg font-semibold mt-1 ${isTop3 ? 'text-blue-600' : 'text-gray-600'}`}>
                            {percentage}%
                          </div>
                        </div>
                      </div>
                      
                      {/* 进度条 */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>市场份额</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-1000 ease-out rounded-full"
                            style={{ 
                              width: `${barWidth}%`,
                              background: `linear-gradient(90deg, ${data.color}, ${data.color}80)`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无客户地址数据</h3>
              <p className="text-gray-500">请在客户信息中添加详细地址以查看分布统计</p>
            </div>
          )}
        </div>

        {/* 底部汇总统计 */}
        {sortedRegions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
              <h5 className="text-md font-semibold text-gray-800 mb-4 text-center">数据汇总</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{sortedRegions.length}</div>
                  <div className="text-sm text-gray-600 mt-1">覆盖地区数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {sortedRegions.slice(0, 3).reduce((sum, [, data]) => sum + data.count, 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">前三地区客户</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {((sortedRegions.slice(0, 3).reduce((sum, [, data]) => sum + data.count, 0) / totalCustomers) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">前三地区占比</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {averageCustomersPerRegion.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">平均客户密度</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerRegionStats;