import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Download, ChevronLeft, ChevronRight, Edit, Save, X, Plus, Calendar, Receipt, User, FileText, CheckCircle, XCircle } from 'lucide-react';

interface SalesIncomeRecord {
  date: string;
  amount: number;
  notes: string;
  otherIncome: number;
}

interface ExpenseRecord {
  date: string;
  project: string;
  content: string;
  amount: number;
  reimbursementPerson: string;
  isReimbursed: boolean;
  notes: string;
}

interface MonthlyFinancialData {
  salesIncome: SalesIncomeRecord[];
  expenses: ExpenseRecord[];
}

const FinancialDetailsView: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<MonthlyFinancialData>({
    salesIncome: [],
    expenses: []
  });

  // 获取当月天数
  const getDaysInMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  // 获取月份的所有日期
  const getMonthDays = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const daysInMonth = getDaysInMonth(monthStr);
    const days = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i);
      days.push({
        date: date.toISOString().substring(0, 10),
        day: i,
        weekday: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
      });
    }
    
    return days;
  };

  const monthDays = getMonthDays(selectedMonth);

  // 初始化编辑数据
  const initializeEditData = () => {
    const salesIncome: SalesIncomeRecord[] = monthDays.map(day => ({
      date: day.date,
      amount: Math.random() > 0.7 ? Math.floor(Math.random() * 50000) + 5000 : 0,
      notes: Math.random() > 0.8 ? '正常销售收入' : '',
      otherIncome: Math.random() > 0.9 ? Math.floor(Math.random() * 5000) + 500 : 0
    }));

    const expenses: ExpenseRecord[] = monthDays.map(day => ({
      date: day.date,
      project: Math.random() > 0.8 ? ['办公用品', '营销推广', '员工福利', '设备维护', '租金水电'][Math.floor(Math.random() * 5)] : '',
      content: Math.random() > 0.8 ? ['购买办公用品', '广告投放费用', '员工午餐', '设备保养', '月租费'][Math.floor(Math.random() * 5)] : '',
      amount: Math.random() > 0.8 ? Math.floor(Math.random() * 3000) + 100 : 0,
      reimbursementPerson: Math.random() > 0.8 ? ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)] : '',
      isReimbursed: Math.random() > 0.5,
      notes: Math.random() > 0.9 ? '已审核通过' : ''
    }));

    setEditData({ salesIncome, expenses });
  };

  // 切换到上一个月
  const goToPreviousMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  // 切换到下一个月
  const goToNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  // 开始编辑
  const handleEditStart = () => {
    initializeEditData();
    setIsEditing(true);
  };

  // 取消编辑
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditData({ salesIncome: [], expenses: [] });
  };

  // 保存编辑
  const handleEditSave = () => {
    // 这里应该调用API保存数据到数据库
    console.log('保存财务数据:', editData);
    alert('数据保存成功！');
    setIsEditing(false);
  };

  // 更新销售收入数据
  const updateSalesIncomeData = (date: string, field: keyof SalesIncomeRecord, value: string | number | boolean) => {
    setEditData(prev => ({
      ...prev,
      salesIncome: prev.salesIncome.map(record =>
        record.date === date ? { ...record, [field]: value } : record
      )
    }));
  };

  // 更新支出数据
  const updateExpenseData = (date: string, field: keyof ExpenseRecord, value: string | number | boolean) => {
    setEditData(prev => ({
      ...prev,
      expenses: prev.expenses.map(record =>
        record.date === date ? { ...record, [field]: value } : record
      )
    }));
  };

  // 导出数据
  const handleExportData = () => {
    if (!isEditing) {
      alert('请先进入编辑模式查看数据');
      return;
    }

    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
    
    // 销售收入数据
    const salesIncomeCSV = [
      ['日期', '金额', '备注', '其他收入'].join(','),
      ...editData.salesIncome
        .filter(record => record.amount > 0 || record.otherIncome > 0 || record.notes)
        .map(record => [
          record.date,
          record.amount,
          record.notes,
          record.otherIncome
        ].join(','))
    ].join('\n');

    // 支出数据
    const expensesCSV = [
      ['日期', '项目', '内容', '金额', '报销人', '是否报销', '备注'].join(','),
      ...editData.expenses
        .filter(record => record.amount > 0 || record.project || record.content)
        .map(record => [
          record.date,
          record.project,
          record.content,
          record.amount,
          record.reimbursementPerson,
          record.isReimbursed ? '是' : '否',
          record.notes
        ].join(','))
    ].join('\n');

    // 合并数据
    const fullCSV = `${monthName} 收支明细\n\n销售收入:\n${salesIncomeCSV}\n\n开销支出:\n${expensesCSV}`;

    const blob = new Blob([fullCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `收支明细_${monthName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 计算总计
  const calculateTotals = () => {
    if (!isEditing) return { totalIncome: 0, totalOtherIncome: 0, totalExpenses: 0 };

    const totalIncome = editData.salesIncome.reduce((sum, record) => sum + (record.amount || 0), 0);
    const totalOtherIncome = editData.salesIncome.reduce((sum, record) => sum + (record.otherIncome || 0), 0);
    const totalExpenses = editData.expenses.reduce((sum, record) => sum + (record.amount || 0), 0);

    return { totalIncome, totalOtherIncome, totalExpenses };
  };

  const totals = calculateTotals();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      {/* 头部 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            收支明细
          </h3>
          
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button 
                  onClick={handleEditSave}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  保存
                </button>
                <button 
                  onClick={handleEditCancel}
                  className="bg-gray-600 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors flex items-center text-sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  取消
                </button>
              </>
            ) : (
              <button 
                onClick={handleEditStart}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
              >
                <Edit className="w-4 h-4 mr-1" />
                编辑
              </button>
            )}
          </div>
        </div>

        {/* 月份选择器 */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <button 
            onClick={goToPreviousMonth}
            className="p-1 text-gray-600 hover:bg-gray-200 rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h4 className="font-medium text-gray-800">
            {new Date(selectedMonth + '-01').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
          </h4>
          
          <button 
            onClick={goToNextMonth}
            className="p-1 text-gray-600 hover:bg-gray-200 rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 统计信息 */}
        {isEditing && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                <div>
                  <p className="text-xs text-green-600">销售收入</p>
                  <p className="text-sm font-bold text-green-700">¥{totals.totalIncome.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <Plus className="w-4 h-4 text-blue-600 mr-2" />
                <div>
                  <p className="text-xs text-blue-600">其他收入</p>
                  <p className="text-sm font-bold text-blue-700">¥{totals.totalOtherIncome.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <TrendingDown className="w-4 h-4 text-red-600 mr-2" />
                <div>
                  <p className="text-xs text-red-600">总支出</p>
                  <p className="text-sm font-bold text-red-700">¥{totals.totalExpenses.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 导出按钮 */}
        {isEditing && (
          <div className="mt-4">
            <button 
              onClick={handleExportData}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              导出当月数据
            </button>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isEditing ? (
          <>
            {/* 销售收入部分 */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                销售收入
              </h4>
              <div className="space-y-2">
                {editData.salesIncome.map((record, index) => {
                  const day = monthDays[index];
                  if (!day) return null;
                  
                  return (
                    <div key={record.date} className="grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-2 text-gray-600">
                        {day.day}日 周{day.weekday}
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          value={record.amount || ''}
                          onChange={(e) => updateSalesIncomeData(record.date, 'amount', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent"
                          placeholder="销售金额"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={record.notes}
                          onChange={(e) => updateSalesIncomeData(record.date, 'notes', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent"
                          placeholder="备注"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          min="0"
                          value={record.otherIncome || ''}
                          onChange={(e) => updateSalesIncomeData(record.date, 'otherIncome', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          placeholder="其他收入"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 开销支出部分 */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                开销支出
              </h4>
              <div className="space-y-2">
                {editData.expenses.map((record, index) => {
                  const day = monthDays[index];
                  if (!day) return null;
                  
                  return (
                    <div key={record.date} className="grid grid-cols-12 gap-1 items-center text-xs">
                      <div className="col-span-1 text-gray-600">
                        {day.day}日
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={record.project}
                          onChange={(e) => updateExpenseData(record.date, 'project', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                          placeholder="项目"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={record.content}
                          onChange={(e) => updateExpenseData(record.date, 'content', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                          placeholder="内容"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          value={record.amount || ''}
                          onChange={(e) => updateExpenseData(record.date, 'amount', parseInt(e.target.value) || 0)}
                          className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                          placeholder="金额"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={record.reimbursementPerson}
                          onChange={(e) => updateExpenseData(record.date, 'reimbursementPerson', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                          placeholder="报销人"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => updateExpenseData(record.date, 'isReimbursed', !record.isReimbursed)}
                          className={`p-1 rounded ${
                            record.isReimbursed 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={record.isReimbursed ? '已报销' : '未报销'}
                        >
                          {record.isReimbursed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={record.notes}
                          onChange={(e) => updateExpenseData(record.date, 'notes', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                          placeholder="备注"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">收支明细</h3>
            <p className="text-gray-600 mb-4">
              点击"编辑"按钮查看和编辑当月收支数据
            </p>
            <button 
              onClick={handleEditStart}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              开始编辑
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialDetailsView;