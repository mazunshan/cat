import React, { useState } from 'react';
import { X, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { AttendanceRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { isCurrentTimeLate, isCurrentTimeEarlyLeave } from '../../utils/attendanceUtils';

interface CheckInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  todayRecord?: AttendanceRecord;
}

const CheckInOutModal: React.FC<CheckInOutModalProps> = ({
  isOpen,
  onClose,
  onCheckIn,
  onCheckOut,
  todayRecord
}) => {
  const { businessHours } = useAuth();
  const [notes, setNotes] = useState('');
  const currentTime = new Date();
  
  // 使用营业时间设置判断迟到和早退
  const isLate = isCurrentTimeLate(businessHours);
  const isEarlyLeave = isCurrentTimeEarlyLeave(businessHours);

  const handleCheckIn = () => {
    onCheckIn();
    setNotes('');
    onClose();
  };

  const handleCheckOut = () => {
    onCheckOut();
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {!todayRecord ? '签到' : '签退'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* 当前时间显示 */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {currentTime.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="text-gray-600">
              {currentTime.toLocaleDateString('zh-CN', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </div>

          {/* 营业时间提示 */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-sm text-gray-600 text-center">
              营业时间：{businessHours.workStartTime} - {businessHours.workEndTime}
            </div>
          </div>

          {/* 状态提示 */}
          {!todayRecord ? (
            <div className={`p-4 rounded-lg mb-6 ${
              isLate ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center">
                {isLate ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                )}
                <div>
                  <p className={`font-medium ${isLate ? 'text-yellow-800' : 'text-green-800'}`}>
                    {isLate ? '迟到签到' : '正常签到'}
                  </p>
                  <p className={`text-sm ${isLate ? 'text-yellow-700' : 'text-green-700'}`}>
                    {isLate 
                      ? `标准上班时间为 ${businessHours.workStartTime}，迟到容忍时间 ${businessHours.lateThreshold} 分钟`
                      : '您准时到达'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-lg mb-6 ${
              isEarlyLeave ? 'bg-orange-50 border border-orange-200' : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center">
                {isEarlyLeave ? (
                  <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                )}
                <div>
                  <p className={`font-medium ${isEarlyLeave ? 'text-orange-800' : 'text-blue-800'}`}>
                    {isEarlyLeave ? '早退签退' : '正常签退'}
                  </p>
                  <p className={`text-sm ${isEarlyLeave ? 'text-orange-700' : 'text-blue-700'}`}>
                    {isEarlyLeave 
                      ? `标准下班时间为 ${businessHours.workEndTime}，早退容忍时间 ${businessHours.earlyLeaveThreshold} 分钟`
                      : '您已完成今日工作'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 今日考勤信息 */}
          {todayRecord && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-800 mb-2">今日考勤信息</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">签到时间:</span>
                  <span className="font-medium">
                    {todayRecord.checkInTime 
                      ? new Date(todayRecord.checkInTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                      : '--:--'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">当前状态:</span>
                  <span className={`font-medium ${
                    todayRecord.status === 'present' ? 'text-green-600' :
                    todayRecord.status === 'late' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {todayRecord.status === 'present' ? '正常' :
                     todayRecord.status === 'late' ? '迟到' :
                     todayRecord.status === 'early_leave' ? '早退' : '缺勤'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 备注输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注 (可选)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="请输入备注信息..."
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={!todayRecord ? handleCheckIn : handleCheckOut}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                !todayRecord 
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Clock className="w-4 h-4 mr-2" />
              {!todayRecord ? '确认签到' : '确认签退'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInOutModal;