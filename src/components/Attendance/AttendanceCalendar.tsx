import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { AttendanceRecord } from '../../types';

interface AttendanceCalendarProps {
  attendanceRecords: AttendanceRecord[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  attendanceRecords,
  selectedDate,
  onDateSelect
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  // 获取当月的所有日期
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 添加上个月的日期（填充）
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: prevDate.toISOString().split('T')[0]
      });
    }

    // 添加当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        dateString: currentDate.toISOString().split('T')[0]
      });
    }

    // 添加下个月的日期（填充到42个格子）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: nextDate.toISOString().split('T')[0]
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  // 获取指定日期的考勤统计
  const getDateAttendanceStats = (dateString: string) => {
    const dayRecords = attendanceRecords.filter(record => record.date === dateString);
    const present = dayRecords.filter(r => r.status === 'present').length;
    const late = dayRecords.filter(r => r.status === 'late').length;
    const absent = dayRecords.filter(r => r.status === 'absent').length;
    const earlyLeave = dayRecords.filter(r => r.status === 'early_leave').length;
    
    return { present, late, absent, earlyLeave, total: dayRecords.length };
  };

  // 获取日期的主要状态（用于显示颜色）
  const getDateStatus = (dateString: string) => {
    const stats = getDateAttendanceStats(dateString);
    if (stats.total === 0) return 'none';
    if (stats.absent > stats.present + stats.late) return 'absent';
    if (stats.late > 0 || stats.earlyLeave > 0) return 'warning';
    return 'present';
  };

  const getStatusColor = (status: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'text-gray-300';
    
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'absent':
        return 'bg-red-100 text-red-600 border-red-200';
      default:
        return 'text-gray-600 hover:bg-gray-50';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (dateString: string) => {
    return dateString === new Date().toISOString().split('T')[0];
  };

  const isSelected = (dateString: string) => {
    return dateString === selectedDate;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* 日历头部 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            今天
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, isCurrentMonth, dateString }) => {
          const stats = getDateAttendanceStats(dateString);
          const status = getDateStatus(dateString);
          
          return (
            <div
              key={dateString}
              onClick={() => isCurrentMonth && onDateSelect(dateString)}
              className={`
                relative p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all
                ${isCurrentMonth ? 'hover:shadow-md' : 'cursor-default'}
                ${isSelected(dateString) ? 'ring-2 ring-blue-500' : ''}
                ${isToday(dateString) ? 'ring-1 ring-blue-300' : ''}
                ${getStatusColor(status, isCurrentMonth)}
              `}
            >
              {/* 日期数字 */}
              <div className={`text-sm font-medium ${
                isCurrentMonth ? 'text-gray-800' : 'text-gray-300'
              } ${isToday(dateString) ? 'font-bold' : ''}`}>
                {date.getDate()}
              </div>

              {/* 考勤统计 */}
              {isCurrentMonth && stats.total > 0 && (
                <div className="mt-1 space-y-1">
                  {stats.present > 0 && (
                    <div className="flex items-center text-xs text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      <span>{stats.present}</span>
                    </div>
                  )}
                  {stats.late > 0 && (
                    <div className="flex items-center text-xs text-yellow-600">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      <span>{stats.late}</span>
                    </div>
                  )}
                  {stats.absent > 0 && (
                    <div className="flex items-center text-xs text-red-600">
                      <XCircle className="w-3 h-3 mr-1" />
                      <span>{stats.absent}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 今天标识 */}
              {isToday(dateString) && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* 图例 */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
          <span className="text-gray-600">正常出勤</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
          <span className="text-gray-600">迟到/早退</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
          <span className="text-gray-600">缺勤较多</span>
        </div>
      </div>

      {/* 选中日期的详细信息 */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">
            {new Date(selectedDate).toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })} 考勤详情
          </h4>
          
          {(() => {
            const dayRecords = attendanceRecords.filter(record => record.date === selectedDate);
            if (dayRecords.length === 0) {
              return <p className="text-gray-500">暂无考勤记录</p>;
            }

            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dayRecords.filter(r => r.status === 'present').length}
                  </div>
                  <div className="text-sm text-gray-600">正常</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {dayRecords.filter(r => r.status === 'late').length}
                  </div>
                  <div className="text-sm text-gray-600">迟到</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {dayRecords.filter(r => r.status === 'early_leave').length}
                  </div>
                  <div className="text-sm text-gray-600">早退</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {dayRecords.filter(r => r.status === 'absent').length}
                  </div>
                  <div className="text-sm text-gray-600">缺勤</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;