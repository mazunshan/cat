import { BusinessHours } from '../types';

// 考勤状态计算工具函数
export const calculateAttendanceStatus = (
  checkInTime: string | undefined,
  checkOutTime: string | undefined,
  date: string,
  businessHours: BusinessHours
): 'present' | 'absent' | 'late' | 'early_leave' => {
  // 检查是否为工作日
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  
  if (!businessHours.workDays.includes(dayOfWeek)) {
    // 非工作日，不需要考勤
    return 'present';
  }

  // 如果没有签到记录，视为缺勤
  if (!checkInTime) {
    return 'absent';
  }

  const checkInDate = new Date(checkInTime);
  const workStartTime = parseTimeString(businessHours.workStartTime);
  const workEndTime = parseTimeString(businessHours.workEndTime);

  // 计算签到时间（只考虑时分）
  const checkInMinutes = checkInDate.getHours() * 60 + checkInDate.getMinutes();
  const workStartMinutes = workStartTime.hours * 60 + workStartTime.minutes;
  const workEndMinutes = workEndTime.hours * 60 + workEndTime.minutes;

  // 判断是否迟到
  const isLate = checkInMinutes > (workStartMinutes + businessHours.lateThreshold);

  // 如果有签退时间，判断是否早退
  if (checkOutTime) {
    const checkOutDate = new Date(checkOutTime);
    const checkOutMinutes = checkOutDate.getHours() * 60 + checkOutDate.getMinutes();
    const isEarlyLeave = checkOutMinutes < (workEndMinutes - businessHours.earlyLeaveThreshold);

    if (isEarlyLeave) {
      return 'early_leave';
    }
  }

  return isLate ? 'late' : 'present';
};

// 解析时间字符串 "HH:MM" 为小时和分钟
const parseTimeString = (timeString: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
};

// 检查当前时间是否为迟到
export const isCurrentTimeLate = (businessHours: BusinessHours): boolean => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const workStartTime = parseTimeString(businessHours.workStartTime);
  const workStartMinutes = workStartTime.hours * 60 + workStartTime.minutes;
  
  return currentMinutes > (workStartMinutes + businessHours.lateThreshold);
};

// 检查当前时间是否为早退
export const isCurrentTimeEarlyLeave = (businessHours: BusinessHours): boolean => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const workEndTime = parseTimeString(businessHours.workEndTime);
  const workEndMinutes = workEndTime.hours * 60 + workEndTime.minutes;
  
  return currentMinutes < (workEndMinutes - businessHours.earlyLeaveThreshold);
};

// 获取工作日名称
export const getWorkDayNames = (workDays: number[]): string[] => {
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return workDays.map(day => dayNames[day]);
};

// 检查指定日期是否为工作日
export const isWorkDay = (date: string, businessHours: BusinessHours): boolean => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  return businessHours.workDays.includes(dayOfWeek);
};

// 格式化时间显示
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`;
};

// 计算工作时长（小时）
export const calculateWorkHours = (
  checkInTime: string | undefined,
  checkOutTime: string | undefined
): number => {
  if (!checkInTime || !checkOutTime) {
    return 0;
  }

  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  const diffMs = checkOut.getTime() - checkIn.getTime();
  
  return Math.max(0, diffMs / (1000 * 60 * 60)); // 转换为小时
};