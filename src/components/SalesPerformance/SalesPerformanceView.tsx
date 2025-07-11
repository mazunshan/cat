import React, { useState } from 'react';
import { Trophy, TrendingUp, Users, DollarSign, Calendar, Award, Target, Star, Filter, Download, ChevronLeft, ChevronRight, UsersRound, User, BarChart2, Edit, Save, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useOrders, useCustomers, useSalesPerformance } from '../../hooks/useDatabase';
import { useAuth } from '../../context/AuthContext';

const SalesPerformanceView: React.FC = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  const { customers } = useCustomers();
  const { salesPerformance, addSalesPerformance, updateSalesPerformance, deleteSalesPerformance } = useSalesPerformance();
  
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [goalValues, setGoalValues] = useState<{ [key: string]: number }>({});

  // Mock data for charts
  const monthlyData = [
    { month: 'Jan', sales: 45000, target: 50000, deals: 12 },
    { month: 'Feb', sales: 52000, target: 50000, deals: 15 },
    { month: 'Mar', sales: 48000, target: 50000, deals: 11 },
    { month: 'Apr', sales: 61000, target: 55000, deals: 18 },
    { month: 'May', sales: 55000, target: 55000, deals: 16 },
    { month: 'Jun', sales: 67000, target: 60000, deals: 20 }
  ];

  const teamPerformance = [
    { name: 'Sales Team A', value: 35, color: '#3B82F6' },
    { name: 'Sales Team B', value: 28, color: '#10B981' },
    { name: 'Sales Team C', value: 22, color: '#F59E0B' },
    { name: 'Sales Team D', value: 15, color: '#EF4444' }
  ];

  const topPerformers = [
    { name: 'Sarah Johnson', sales: 125000, deals: 45, growth: 15.2 },
    { name: 'Mike Chen', sales: 118000, deals: 42, growth: 12.8 },
    { name: 'Emily Davis', sales: 112000, deals: 38, growth: 18.5 },
    { name: 'James Wilson', sales: 108000, deals: 35, growth: 9.3 },
    { name: 'Lisa Brown', sales: 95000, deals: 32, growth: 22.1 }
  ];

  const kpiData = [
    { 
      title: 'Total Revenue', 
      value: '$328,000', 
      change: '+12.5%', 
      trend: 'up',
      icon: DollarSign,
      target: '$350,000',
      progress: 93.7
    },
    { 
      title: 'Deals Closed', 
      value: '92', 
      change: '+8.2%', 
      trend: 'up',
      icon: Target,
      target: '100',
      progress: 92
    },
    { 
      title: 'Conversion Rate', 
      value: '24.8%', 
      change: '+3.1%', 
      trend: 'up',
      icon: TrendingUp,
      target: '25%',
      progress: 99.2
    },
    { 
      title: 'Avg Deal Size', 
      value: '$3,565', 
      change: '+5.7%', 
      trend: 'up',
      icon: Award,
      target: '$4,000',
      progress: 89.1
    }
  ];

  const handleGoalEdit = (kpiTitle: string, currentValue: string) => {
    setEditingGoal(kpiTitle);
    const numericValue = parseFloat(currentValue.replace(/[$,%]/g, ''));
    setGoalValues({ ...goalValues, [kpiTitle]: numericValue });
  };

  const handleGoalSave = (kpiTitle: string) => {
    // Here you would typically save to database
    setEditingGoal(null);
  };

  const handleGoalCancel = () => {
    setEditingGoal(null);
    setGoalValues({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" />
            Sales Performance
          </h1>
          <p className="text-gray-600 mt-1">Track team performance and achieve sales goals</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Teams</option>
                <option value="team-a">Sales Team A</option>
                <option value="team-b">Sales Team B</option>
                <option value="team-c">Sales Team C</option>
                <option value="team-d">Sales Team D</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          const isEditing = editingGoal === kpi.title;
          
          return (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">{kpi.title}</h3>
                </div>
                <button
                  onClick={() => isEditing ? handleGoalSave(kpi.title) : handleGoalEdit(kpi.title, kpi.target)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
                  <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Target:</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={goalValues[kpi.title] || ''}
                        onChange={(e) => setGoalValues({ ...goalValues, [kpi.title]: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleGoalCancel}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-medium text-gray-900">{kpi.target}</span>
                  )}
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 text-right">
                  {kpi.progress.toFixed(1)}% of target
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Performance</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <span className="text-gray-600">Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full" />
                <span className="text-gray-600">Target</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
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
                />
                <Bar dataKey="target" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Performance Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teamPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {teamPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {teamPerformance.map((team, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                <span className="text-sm text-gray-600">{team.name}</span>
                <span className="text-sm font-medium text-gray-900 ml-auto">{team.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Top Performers
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">1-5 of 25</span>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deals Closed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPerformers.map((performer, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {performer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{performer.name}</div>
                        <div className="text-sm text-gray-500">Sales Representative</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${performer.sales.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{performer.deals}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        +{performer.growth}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                      <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Goals & Targets */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Sales Goals & Targets
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Quarterly Goals</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Q1 Revenue Target</span>
                <span className="font-medium text-blue-600">$850K</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Q1 Deals Target</span>
                <span className="font-medium text-green-600">275</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-700">New Customers</span>
                <span className="font-medium text-purple-600">45</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Team Targets</h4>
            <div className="space-y-3">
              {['Sales Team A', 'Sales Team B', 'Sales Team C'].map((team, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{team}</span>
                  <span className="font-medium text-gray-900">${(200 + index * 50)}K</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Achievement Status</h4>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Revenue Goal</span>
                  <span className="text-sm font-medium text-green-600">94%</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Deals Goal</span>
                  <span className="text-sm font-medium text-yellow-600">87%</span>
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Customer Goal</span>
                  <span className="text-sm font-medium text-blue-600">76%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '76%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPerformanceView;