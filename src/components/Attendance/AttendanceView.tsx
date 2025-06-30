import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, TrendingUp, CheckCircle, XCircle, AlertTriangle, Filter, Download, Search, Edit, Info } from 'lucide-react';
import { useAttendance } from '../../hooks/useDatabase';
import { useAuth } from '../../context/AuthContext';
import AttendanceCalendar from './AttendanceCalendar';
import AttendanceStats from './AttendanceStats';
import CheckInOutModal from './CheckInOutModal';
import { AttendanceRecord } from '../../types';
import { isWorkDay } from '../../utils/attendanceUtils';

const AttendanceView: React.FC = () => {
  const { user, businessHours } = useAuth();
  const { attendanceRecords = [], loading, error, addAttendance, updateAttendance } = useAttendance();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  
  // 安全的数组操作
  const safeAttendanceRecords = attendanceRecords || [];

  // 获取今日考勤记录
  const todayRecords = safeAttendanceRecords.filter(record => 
    record.date === new Date().toISOString().split('T')[0]
  );

  // 获取当前用户今日考勤
  const myTodayRecord = todayRecords.find(record => record.userId === user?.id);

  // 筛选考勤记录
  const filteredRecords = safeAttendanceRecords.filter(record => {
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      record.userId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 计算统计数据
  const totalUsers = new Set(safeAttendanceRecords.map(r => r.userId)).size;
  const todayPresent = todayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  const todayAbsent = todayRecords.filter(r => r.status === 'absent').length;
  const attendanceRate = totalUsers > 0 ? Math.round((todayPresent / totalUsers) * 100) : 0;

  // 模拟用户数据
  const mockUsers = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Administrator' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Alice Chen' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Bob Wang' },
    { id: '00000000-0000-0000-0000-000000000004', name: 'Carol Li' },
    { id: '00000000-0000-0000-0000-000000000005', name: 'David Zhang' }
  ];

  // 获取用户名
  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? user.name : userId.slice(0, 8);
  };

  // 检查今天是否是工作日
  const isTodayWorkDay = isWorkDay(new Date().toISOString().split('T')[0], businessHours);

  const handleCheckIn = async () => {
    if (!user) return;
    
    try {
      const now = new Date();
      const checkInTime = now.toISOString();
      
      await addAttendance({
        userId: user.id,
        date: new Date().toISOString().split('T')[0],
        checkInTime,
        status: 'present', // 状态会在 addAttendance 中根据营业时间设置自动计算
        notes: ''
      });
    } catch (error) {
      console.error('签到失败:', error);
      alert('签到失败，请重试');
    }
  };

  const handleCheckOut = async () => {
    if (!user || !myTodayRecord) return;
    
    try {
      const now = new Date();
      const checkOutTime = now.toISOString();
      
      await updateAttendance(myTodayRecord.id, {
        ...myTodayRecord,
        checkOutTime,
        notes: myTodayRecord.notes
      });
    } catch (error) {
      console.error('签退失败:', error);
      alert('签退失败，请重试');
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedRecord) return;
    
    try {
      await updateAttendance(selectedRecord.id, {
        ...selectedRecord,
        notes: editNotes
      });
      
      setEditMode(false);
      setShowDetailModal(false);
    } catch (error) {
      console.error('更新备注失败:', error);
      alert('更新备注失败，请重试');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-600';
      case 'absent':
        return 'bg-red-100 text-red-600';
      case 'late':
        return 'bg-yellow-100 text-yellow-600';
      case 'early_leave':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return '正常';
      case 'absent':
        return '缺勤';
      case 'late':
        return '迟到';
      case 'early_leave':
        return '早退';
      default:
        return '未知';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4" />;
      case 'absent':
        return <XCircle className="w-4 h-4" />;
      case 'late':
      case 'early_leave':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const exportAttendanceData = () => {
    if (safeAttendanceRecords.length === 0) {
      alert('暂无考勤数据可导出');
      return;
    }

    const csvContent = [
      ['用户ID', '用户名', '日期', '签到时间', '签退时间', '状态', '备注'].join(','),
      ...safeAttendanceRecords.map(record => [
        record.userId,
        getUserName(record.userId),
        record.date,
        record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('zh-CN') : '',
        record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('zh-CN') : '',
        getStatusText(record.status),
        record.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `考勤数据_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 根据用户角色显示不同内容
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载考勤数据...</p>
        </div>
      </div>
    );
  }

  // 员工视图 - 只能看到自己的考勤记录和签到签退功能
  if (user?.role !== 'admin') {
    const myRecords = safeAttendanceRecords.filter(record => record.userId === user?.id);
    
    return (
      <div className="space-y-6">
        {/* 错误提示 */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-yellow-800 font-medium">数据加载警告</p>
                <p className="text-yellow-700 text-sm">
                  考勤数据加载失败: {error}。显示的是模拟数据。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 头部操作栏 */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">考勤打卡</h2>
          
          {/* 签到签退按钮 */}
          <div className="flex items-center space-x-2">
            {!isTodayWorkDay ? (
              <div className="text-gray-600 font-medium flex items-center">
                <Info className="w-4 h-4 mr-2" />
                今日非工作日
              </div>
            ) : !myTodayRecord ? (
              <button
                onClick={() => setShowCheckInModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Clock className="w-4 h-4 mr-2" />
                签到
              </button>
            ) : !myTodayRecord.checkOutTime ? (
              <button
                onClick={() => setShowCheckInModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Clock className="w-4 h-4 mr-2" />
                签退
              </button>
            ) : (
              <div className="text-green-600 font-medium flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                今日已完成
              </div>
            )}
          </div>
        </div>

        {/* 营业时间信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-md font-semibold text-blue-800 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            营业时间信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-600">工作时间</p>
              <p className="font-medium text-blue-800">{businessHours.workStartTime} - {businessHours.workEndTime}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">工作日</p>
              <p className="font-medium text-blue-800">
                {businessHours.workDays.map(day => {
                  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                  return dayNames[day];
                }).join('、')}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">考勤规则</p>
              <p className="font-medium text-blue-800">
                迟到: 超过{businessHours.lateThreshold}分钟 | 早退: 提前{businessHours.earlyLeaveThreshold}分钟
              </p>
            </div>
          </div>
        </div>

        {/* 今日考勤状态 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">今日考勤状态</h3>
          
          {myTodayRecord ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${getStatusColor(myTodayRecord.status)}`}>
                    {getStatusIcon(myTodayRecord.status)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {getStatusText(myTodayRecord.status)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date().toLocaleDateString('zh-CN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(myTodayRecord.status)}`}>
                  {getStatusText(myTodayRecord.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600">签到时间</p>
                  <p className="font-medium">
                    {myTodayRecord.checkInTime 
                      ? new Date(myTodayRecord.checkInTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                      : '--:--'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">签退时间</p>
                  <p className="font-medium">
                    {myTodayRecord.checkOutTime 
                      ? new Date(myTodayRecord.checkOutTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                      : '--:--'
                    }
                  </p>
                </div>
              </div>
              
              {myTodayRecord.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium">备注</p>
                  <p className="text-blue-700">{myTodayRecord.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              {isTodayWorkDay ? (
                <>
                  <p className="text-gray-600 mb-4">您今天还未签到</p>
                  <button
                    onClick={() => setShowCheckInModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    立即签到
                  </button>
                </>
              ) : (
                <p className="text-gray-600">今日为非工作日，无需签到</p>
              )}
            </div>
          )}
        </div>

        {/* 最近考勤记录 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">我的考勤记录</h3>
          
          {myRecords.length > 0 ? (
            <div className="space-y-3">
              {myRecords.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(record.date).toLocaleDateString('zh-CN', { 
                          month: 'long', 
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">签到</p>
                      <p className="text-sm font-medium">
                        {record.checkInTime 
                          ? new Date(record.checkInTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                          : '--:--'
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">签退</p>
                      <p className="text-sm font-medium">
                        {record.checkOutTime 
                          ? new Date(record.checkOutTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                          : '--:--'
                        }
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusText(record.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">暂无考勤记录</p>
            </div>
          )}
        </div>

        {/* 签到签退弹窗 */}
        <CheckInOutModal
          isOpen={showCheckInModal}
          onClose={() => setShowCheckInModal(false)}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          todayRecord={myTodayRecord}
        />
      </div>
    );
  }

  // 管理员视图 - 可以看到所有员工的考勤记录和统计数据
  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">数据加载警告</p>
              <p className="text-yellow-700 text-sm">
                考勤数据加载失败: {error}。显示的是模拟数据。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">考勤管理</h2>
        
        <div className="flex items-center space-x-4">
          {/* 导出按钮 */}
          <button 
            onClick={exportAttendanceData}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </button>

          {/* 签到签退按钮 */}
          <div className="flex items-center space-x-2">
            {!isTodayWorkDay ? (
              <div className="text-gray-600 font-medium flex items-center">
                <Info className="w-4 h-4 mr-2" />
                今日非工作日
              </div>
            ) : !myTodayRecord ? (
              <button
                onClick={() => setShowCheckInModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Clock className="w-4 h-4 mr-2" />
                签到
              </button>
            ) : !myTodayRecord.checkOutTime ? (
              <button
                onClick={() => setShowCheckInModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Clock className="w-4 h-4 mr-2" />
                签退
              </button>
            ) : (
              <div className="text-green-600 font-medium flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                今日已完成
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 营业时间信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-md font-semibold text-blue-800 mb-2 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          当前营业时间设置
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-blue-600">工作时间</p>
            <p className="font-medium text-blue-800">{businessHours.workStartTime} - {businessHours.workEndTime}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">工作日</p>
            <p className="font-medium text-blue-800">
              {businessHours.workDays.map(day => {
                const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                return dayNames[day];
              }).join('、')}
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-600">考勤规则</p>
            <p className="font-medium text-blue-800">
              迟到: 超过{businessHours.lateThreshold}分钟 | 早退: 提前{businessHours.earlyLeaveThreshold}分钟
            </p>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总员工数</p>
              <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">今日出勤</p>
              <p className="text-2xl font-bold text-green-600">{todayPresent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">今日缺勤</p>
              <p className="text-2xl font-bold text-red-600">{todayAbsent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">出勤率</p>
              <p className="text-2xl font-bold text-purple-600">{attendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 员工考勤表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">员工考勤月历</h3>
        
        {/* 筛选栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索员工..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="present">正常</option>
              <option value="late">迟到</option>
              <option value="early_leave">早退</option>
              <option value="absent">缺勤</option>
            </select>
          </div>
        </div>
        
        {/* 员工考勤表格 */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky left-0 z-10">
                  员工
                </th>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                  const date = new Date();
                  date.setDate(day);
                  const isToday = day === new Date().getDate();
                  const dateString = date.toISOString().split('T')[0];
                  const isWorkingDay = isWorkDay(dateString, businessHours);
                  
                  return (
                    <th 
                      key={day} 
                      className={`py-3 px-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 ${
                        isToday ? 'bg-blue-50' : isWorkingDay ? 'bg-gray-50' : 'bg-gray-100'
                      }`}
                    >
                      {day}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockUsers.map(user => {
                // 获取当月该用户的所有考勤记录
                const userRecords = safeAttendanceRecords.filter(record => 
                  record.userId === user.id && 
                  new Date(record.date).getMonth() === new Date().getMonth()
                );
                
                return (
                  <tr key={user.id}>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 border-r border-gray-200 sticky left-0 bg-white">
                      {user.name}
                    </td>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                      const date = new Date();
                      date.setDate(day);
                      const dateString = date.toISOString().split('T')[0];
                      const record = userRecords.find(r => r.date === dateString);
                      const isWorkingDay = isWorkDay(dateString, businessHours);
                      
                      let statusClass = 'bg-gray-100';
                      if (record) {
                        switch (record.status) {
                          case 'present':
                            statusClass = 'bg-green-100 hover:bg-green-200';
                            break;
                          case 'late':
                            statusClass = 'bg-yellow-100 hover:bg-yellow-200';
                            break;
                          case 'early_leave':
                            statusClass = 'bg-orange-100 hover:bg-orange-200';
                            break;
                          case 'absent':
                            statusClass = 'bg-red-100 hover:bg-red-200';
                            break;
                        }
                      }
                      
                      return (
                        <td 
                          key={day} 
                          className="py-4 px-2 text-center text-sm text-gray-500 border-r border-gray-100"
                          onClick={() => {
                            if (record) {
                              setSelectedRecord(record);
                              setEditNotes(record.notes || '');
                              setShowDetailModal(true);
                            }
                          }}
                        >
                          {record ? (
                            <div 
                              className={`w-8 h-8 mx-auto rounded-md flex items-center justify-center cursor-pointer ${statusClass}`}
                              title={getStatusText(record.status)}
                            >
                              {getStatusIcon(record.status)}
                            </div>
                          ) : day <= new Date().getDate() && isWorkingDay ? (
                            <div className="w-8 h-8 mx-auto rounded-md bg-gray-100 flex items-center justify-center">
                              -
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* 图例 */}
        <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
            <span className="text-gray-600">正常</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 rounded mr-2"></div>
            <span className="text-gray-600">迟到</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-100 rounded mr-2"></div>
            <span className="text-gray-600">早退</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
            <span className="text-gray-600">缺勤</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
            <span className="text-gray-600">非工作日</span>
          </div>
        </div>
      </div>

      {/* 考勤统计图表 */}
      <AttendanceStats attendanceRecords={safeAttendanceRecords} />

      {/* 签到签退弹窗 */}
      <CheckInOutModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        todayRecord={myTodayRecord}
      />

      {/* 考勤详情弹窗 */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">考勤详情</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setEditMode(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${getStatusColor(selectedRecord.status)}`}>
                      {getStatusIcon(selectedRecord.status)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {getUserName(selectedRecord.userId)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedRecord.date).toLocaleDateString('zh-CN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          weekday: 'long'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRecord.status)}`}>
                    {getStatusText(selectedRecord.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">签到时间</p>
                    <p className="font-medium">
                      {selectedRecord.checkInTime 
                        ? new Date(selectedRecord.checkInTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                        : '--:--'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">签退时间</p>
                    <p className="font-medium">
                      {selectedRecord.checkOutTime 
                        ? new Date(selectedRecord.checkOutTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                        : '--:--'
                      }
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">备注</p>
                    {!editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {editMode ? (
                    <div>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="请输入备注..."
                      />
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setEditNotes(selectedRecord.notes || '');
                          }}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleUpdateNotes}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {selectedRecord.notes || '无备注'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceView;