import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AttendanceRecord } from '../../types';

interface AttendanceStatsProps {
  attendanceRecords: AttendanceRecord[];
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ attendanceRecords }) => {
  // 计算最近7天的考勤统计
  const getLast7DaysStats = () => {
    const stats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayRecords = attendanceRecords.filter(record => record.date === dateString);
      const present = dayRecords.filter(r => r.status === 'present').length;
      const late = dayRecords.filter(r => r.status === 'late').length;
      const absent = dayRecords.filter(r => r.status === 'absent').length;
      const earlyLeave = dayRecords.filter(r => r.status === 'early_leave').length;
      
      stats.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        正常: present,
        迟到: late,
        早退: earlyLeave,
        缺勤: absent
      });
    }
    return stats;
  };

  // 计算状态分布
  const getStatusDistribution = () => {
    const statusCount = {
      present: 0,
      late: 0,
      early_leave: 0,
      absent: 0
    };

    attendanceRecords.forEach(record => {
      statusCount[record.status]++;
    });

    return [
      { name: '正常', value: statusCount.present, color: '#10B981' },
      { name: '迟到', value: statusCount.late, color: '#F59E0B' },
      { name: '早退', value: statusCount.early_leave, color: '#F97316' },
      { name: '缺勤', value: statusCount.absent, color: '#EF4444' }
    ].filter(item => item.value > 0);
  };

  const last7DaysStats = getLast7DaysStats();
  const statusDistribution = getStatusDistribution();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 最近7天考勤趋势 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">最近7天考勤趋势</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={last7DaysStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="正常" stackId="a" fill="#10B981" />
            <Bar dataKey="迟到" stackId="a" fill="#F59E0B" />
            <Bar dataKey="早退" stackId="a" fill="#F97316" />
            <Bar dataKey="缺勤" stackId="a" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 考勤状态分布 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">考勤状态分布</h3>
        {statusDistribution.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {statusDistribution.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>暂无考勤数据</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceStats;