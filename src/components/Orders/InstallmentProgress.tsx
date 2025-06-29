import React from 'react';
import { Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { InstallmentPlan } from '../../types';

interface InstallmentProgressProps {
  installmentPlan: InstallmentPlan;
}

const InstallmentProgress: React.FC<InstallmentProgressProps> = ({ installmentPlan }) => {
  const progressPercentage = (installmentPlan.paidInstallments / installmentPlan.totalInstallments) * 100;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">分期付款进度</h3>
        <span className="text-sm text-gray-600">
          {installmentPlan.paidInstallments} / {installmentPlan.totalInstallments} 期
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>已付款</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600">每期金额</p>
          <p className="text-lg font-bold text-gray-800">¥{installmentPlan.installmentAmount.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">已付金额</p>
          <p className="text-lg font-bold text-green-600">
            ¥{(installmentPlan.paidInstallments * installmentPlan.installmentAmount).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">剩余金额</p>
          <p className="text-lg font-bold text-orange-600">
            ¥{((installmentPlan.totalInstallments - installmentPlan.paidInstallments) * installmentPlan.installmentAmount).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Next Payment */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-blue-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-blue-800">下次付款日期</p>
            <p className="text-lg font-bold text-blue-600">
              {new Date(installmentPlan.nextPaymentDate).toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Timeline */}
      <div>
        <h4 className="font-medium text-gray-800 mb-4">付款时间线</h4>
        <div className="space-y-3">
          {installmentPlan.payments.map((payment, index) => (
            <div
              key={payment.id}
              className={`flex items-center p-3 rounded-lg ${
                payment.status === 'paid' 
                  ? 'bg-green-50 border border-green-200' 
                  : payment.status === 'overdue'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="mr-3">
                {payment.status === 'paid' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {payment.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                {payment.status === 'overdue' && <AlertTriangle className="w-5 h-5 text-red-600" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">
                    第 {payment.installmentNumber} 期
                  </span>
                  <span className="font-bold text-gray-900">
                    ¥{payment.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>到期: {new Date(payment.dueDate).toLocaleDateString('zh-CN')}</span>
                  {payment.paidDate && (
                    <span className="text-green-600">
                      已付: {new Date(payment.paidDate).toLocaleDateString('zh-CN')}
                    </span>
                  )}
                </div>
              </div>

              <div className="ml-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  payment.status === 'paid'
                    ? 'bg-green-100 text-green-600'
                    : payment.status === 'overdue'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {payment.status === 'paid' ? '已付' : 
                   payment.status === 'overdue' ? '逾期' : '待付'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstallmentProgress;