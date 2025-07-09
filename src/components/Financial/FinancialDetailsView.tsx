import React, { useState } from 'react';
import { DollarSign, Download, ChevronLeft, ChevronRight, Plus, Edit, Save, X, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SalesIncome {
  date: string;
  amount: number;
  note: string;
  otherIncome: number;
}

interface Expense {
  date: string;
  project: string;
  content: string;
  amount: number;
  reimbursementPerson: string;
  isReimbursed: boolean;
  note: string;
}

const FinancialDetailsView: React.FC = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [isEditing, setIsEditing] = useState(false);
  
  // 销售收入数据
  const [salesIncome, setSalesIncome] = useState<SalesIncome[]>([]);
  
  // 开销支出数据
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // 获取当前月份的天数
  const getDaysInMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  // 获取月份的所有日期
  const getMonthDays = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const days = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i);
      days.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        day: i,
        weekday: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
      });
    }
    
    return days;
  };

  const monthDays = getMonthDays(selectedMonth);

  // 初始化数据
  React.useEffect(() => {
    const initSalesIncome: SalesIncome[] = monthDays.map(day => ({
      date: day.date,
      amount: 0,
      note: '',
      otherIncome: 0
    }));

    const initExpenses: Expense[] = monthDays.map(day => ({
      date: day.date,
      project: '',
      content: '',
      amount: 0,
      reimbursementPerson: '',
      isReimbursed: false,
      note: ''
    }));

    setSalesIncome(initSalesIncome);
    setExpenses(initExpenses);
  }, [selectedMonth]);

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

  // 更新销售收入数据
  const updateSalesIncome = (date: string, field: keyof SalesIncome, value: any) => {
    setSalesIncome(prev => prev.map(item => 
      item.date === date ? { ...item, [field]: value } : item
    ));
  };

  // 更新支出数据
  const updateExpense = (date: string, field: keyof Expense, value: any) => {
    setExpenses(prev => prev.map(item => 
      item.date === date ? { ...item, [field]: value } : item
    ));
  };

  // 保存数据
  const handleSave = () => {
    // 这里应该调用API保存数据到数据库
    console.log('保存销售收入数据:', salesIncome);
    console.log('保存支出数据:', expenses);
    
    alert('数据保存成功！');
    setIsEditing(false);
  };

  // 导出数据
  const handleExport = () => {
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
    
    // 计算汇总数据
    const totalSalesAmount = salesIncome.reduce((sum, item) => sum + item.amount, 0);
    const totalOtherIncome = salesIncome.reduce((sum, item) => sum + item.otherIncome, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const netIncome = totalSalesAmount + totalOtherIncome - totalExpenses;

    // 生成CSV内容
    const csvContent = [
      // 汇总信息
      [`${monthName} 收支明细汇总`],
      ['销售收入总额', `¥${totalSalesAmount.toLocaleString()}`],
      ['其他收入总额', `¥${totalOtherIncome.toLocaleString()}`],
      ['支出总额', `¥${totalExpenses.toLocaleString()}`],
      ['净收入', `¥${netIncome.toLocaleString()}`],
      [''],
      
      // 销售收入明细
      ['销售收入明细'],
      ['日期', '销售金额', '其他收入', '备注'],
      ...salesIncome
        .filter(item => item.amount > 0 || item.otherIncome > 0 || item.note)
        .map(item => [
          new Date(item.date).toLocaleDateString('zh-CN'),
          item.amount,
          item.otherIncome,
          item.note
        ]),
      [''],
      
      // 支出明细
      ['支出明细'],
      ['日期', '项目', '内容', '金额', '报销人', '是否报销', '备注'],
      ...expenses
        .filter(item => item.amount > 0 || item.project || item.content)
        .map(item => [
          new Date(item.date).toLocaleDateString('zh-CN'),
          item.project,
          item.content,
          item.amount,
          item.reimbursementPerson,
          item.isReimbursed ? '是' : '否',
          item.note
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `收支明细_${monthName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 计算汇总数据
  const totalSalesAmount = salesIncome.reduce((sum, item) => sum + item.amount, 0);
  const totalOtherIncome = salesIncome.reduce((sum, item) => sum + item.otherIncome, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalSalesAmount + totalOtherIncome - totalExpenses;

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">访问受限</h3>
        <p className="text-gray-600">只有管理员才能访问收支明细</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">收支明细</h2>
          <p className="text-gray-600 mt-1">财务收支详细记录与管理</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                保存
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                取消
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              编辑数据
            </button>
          )}
          
          <button 
            onClick={handleExport}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </button>
        </div>
      </div>

      {/* 月份选择器 */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <button 
          onClick={goToPreviousMonth}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">
            {new Date(selectedMonth + '-01').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
          </h3>
        </div>
        
        <button 
          onClick={goToNextMonth}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 汇总统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">销售收入</p>
              <p className="text-2xl font-bold text-green-600">
                ¥{totalSalesAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">其他收入</p>
              <p className="text-2xl font-bold text-blue-600">
                ¥{totalOtherIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">支出总额</p>
              <p className="text-2xl font-bold text-red-600">
                ¥{totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
              netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <DollarSign className={`w-6 h-6 ${
                netIncome >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">净收入</p>
              <p className={`text-2xl font-bold ${
                netIncome >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ¥{netIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 销售收入表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">销售收入</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  备注
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  其他收入
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthDays.map((dayInfo) => {
                const item = salesIncome.find(income => income.date === dayInfo.date) || {
                  date: dayInfo.date,
                  amount: 0,
                  note: '',
                  otherIncome: 0
                };
                return (
                  <tr key={item.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {dayInfo.day}日 (周{dayInfo.weekday})
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) => updateSalesIncome(item.date, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {item.amount > 0 ? `¥${item.amount.toLocaleString()}` : '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => updateSalesIncome(item.date, 'note', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="备注信息"
                        />
                      ) : (
                        <span className="text-sm text-gray-600">
                          {item.note || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.otherIncome}
                          onChange={(e) => updateSalesIncome(item.date, 'otherIncome', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {item.otherIncome > 0 ? `¥${item.otherIncome.toLocaleString()}` : '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 开销支出表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">开销支出</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  项目
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  内容
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  报销人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  是否报销
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  备注
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthDays.map((dayInfo) => {
                const item = expenses.find(expense => expense.date === dayInfo.date) || {
                  date: dayInfo.date,
                  project: '',
                  content: '',
                  amount: 0,
                  reimbursementPerson: '',
                  isReimbursed: false,
                  note: ''
                };
                return (
                  <tr key={item.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {dayInfo.day}日 (周{dayInfo.weekday})
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.project}
                          onChange={(e) => updateExpense(item.date, 'project', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="项目名称"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">
                          {item.project || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.content}
                          onChange={(e) => updateExpense(item.date, 'content', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="支出内容"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">
                          {item.content || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) => updateExpense(item.date, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <span className="text-sm font-medium text-red-600">
                          {item.amount > 0 ? `¥${item.amount.toLocaleString()}` : '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.reimbursementPerson}
                          onChange={(e) => updateExpense(item.date, 'reimbursementPerson', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="报销人姓名"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">
                          {item.reimbursementPerson || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.isReimbursed}
                            onChange={(e) => updateExpense(item.date, 'isReimbursed', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">已报销</span>
                        </label>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.isReimbursed 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.isReimbursed ? '已报销' : '未报销'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => updateExpense(item.date, 'note', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="备注信息"
                        />
                      ) : (
                        <span className="text-sm text-gray-600">
                          {item.note || '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialDetailsView;