import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Edit, Save, X, DollarSign, TrendingDown } from 'lucide-react';

interface SalesIncomeRecord {
  date: string;
  amount: number;
  note: string;
  otherIncome: number;
}

interface ExpenseRecord {
  date: string;
  project: string;
  content: string;
  amount: number;
  reimbursePerson: string;
  isReimbursed: boolean;
  note: string;
}

const FinancialDetails: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [isEditing, setIsEditing] = useState(false);
  
  // 获取当月天数
  const getDaysInMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  // 获取当月所有日期
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

  // 初始化销售收入数据
  const [salesIncome, setSalesIncome] = useState<SalesIncomeRecord[]>(
    monthDays.map(day => ({
      date: day.date,
      amount: Math.random() > 0.7 ? Math.floor(Math.random() * 50000) + 10000 : 0,
      note: Math.random() > 0.8 ? '线上销售' : '',
      otherIncome: Math.random() > 0.9 ? Math.floor(Math.random() * 5000) + 1000 : 0
    }))
  );

  // 初始化开销支出数据
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(
    monthDays.map(day => ({
      date: day.date,
      project: Math.random() > 0.8 ? ['营销推广', '办公用品', '差旅费', '培训费'][Math.floor(Math.random() * 4)] : '',
      content: Math.random() > 0.8 ? ['广告投放', '文具采购', '出差报销', '员工培训'][Math.floor(Math.random() * 4)] : '',
      amount: Math.random() > 0.8 ? Math.floor(Math.random() * 10000) + 500 : 0,
      reimbursePerson: Math.random() > 0.8 ? ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)] : '',
      isReimbursed: Math.random() > 0.5,
      note: Math.random() > 0.9 ? '已审核' : ''
    }))
  );

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

  // 获取月份标题
  const getMonthTitle = () => {
    return new Date(selectedMonth + '-01').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
  };

  // 处理销售收入数据变更
  const handleSalesIncomeChange = (index: number, field: keyof SalesIncomeRecord, value: string | number | boolean) => {
    setSalesIncome(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // 处理开销支出数据变更
  const handleExpenseChange = (index: number, field: keyof ExpenseRecord, value: string | number | boolean) => {
    setExpenses(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // 保存编辑
  const handleSave = () => {
    // 这里应该调用API保存数据
    console.log('保存数据:', { salesIncome, expenses });
    setIsEditing(false);
    alert('数据保存成功！');
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    // 这里可以重新加载数据或恢复原始数据
  };

  // 导出数据
  const handleExport = () => {
    const totalSalesIncome = salesIncome.reduce((sum, item) => sum + item.amount + item.otherIncome, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    
    // 创建CSV内容
    const csvContent = [
      // 销售收入部分
      ['销售收入'],
      ['日期', '金额', '备注', '其他收入'],
      ...salesIncome.filter(item => item.amount > 0 || item.otherIncome > 0).map(item => [
        item.date,
        item.amount,
        item.note,
        item.otherIncome
      ]),
      ['销售收入小计', totalSalesIncome],
      [''],
      // 开销支出部分
      ['开销支出'],
      ['日期', '项目', '内容', '金额', '报销人', '是否报销', '备注'],
      ...expenses.filter(item => item.amount > 0).map(item => [
        item.date,
        item.project,
        item.content,
        item.amount,
        item.reimbursePerson,
        item.isReimbursed ? '是' : '否',
        item.note
      ]),
      ['开销支出小计', totalExpenses],
      [''],
      ['净收入', totalSalesIncome - totalExpenses]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `收支明细_${getMonthTitle()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 计算统计数据
  const totalSalesIncome = salesIncome.reduce((sum, item) => sum + item.amount + item.otherIncome, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalSalesIncome - totalExpenses;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">收支明细</h3>
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleSave}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
              >
                <Save className="w-4 h-4 mr-1" />
                保存
              </button>
              <button 
                onClick={handleCancel}
                className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center text-sm"
              >
                <X className="w-4 h-4 mr-1" />
                取消
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
            >
              <Edit className="w-4 h-4 mr-1" />
              编辑
            </button>
          )}
          <button 
            onClick={handleExport}
            className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm"
          >
            <Download className="w-4 h-4 mr-1" />
            导出
          </button>
        </div>
      </div>

      {/* 月份选择器 */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-6">
        <button 
          onClick={goToPreviousMonth}
          className="p-2 text-gray-600 hover:bg-white rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h4 className="text-lg font-semibold text-gray-800">
          {getMonthTitle()}
        </h4>
        
        <button 
          onClick={goToNextMonth}
          className="p-2 text-gray-600 hover:bg-white rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-green-600">销售收入</p>
              <p className="text-xl font-bold text-green-700">¥{totalSalesIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingDown className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-red-600">开销支出</p>
              <p className="text-xl font-bold text-red-700">¥{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className={`${netIncome >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4`}>
          <div className="flex items-center">
            <DollarSign className={`w-8 h-8 ${netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'} mr-3`} />
            <div>
              <p className={`text-sm ${netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>净收入</p>
              <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                ¥{netIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* 销售收入表格 */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            销售收入
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">日期</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">金额</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">备注</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">其他收入</th>
                </tr>
              </thead>
              <tbody>
                {salesIncome.map((item, index) => (
                  <tr key={item.date} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 border-b">
                      {new Date(item.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm border-b">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={item.amount}
                          onChange={(e) => handleSalesIncomeChange(index, 'amount', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-green-600 font-medium">
                          {item.amount > 0 ? `¥${item.amount.toLocaleString()}` : '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-b">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => handleSalesIncomeChange(index, 'note', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="备注"
                        />
                      ) : (
                        <span className="text-gray-600">{item.note || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-b">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={item.otherIncome}
                          onChange={(e) => handleSalesIncomeChange(index, 'otherIncome', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-blue-600 font-medium">
                          {item.otherIncome > 0 ? `¥${item.otherIncome.toLocaleString()}` : '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 开销支出表格 */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
            开销支出
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">日期</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">项目</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">内容</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">金额</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">报销人</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">是否报销</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">备注</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((item, index) => (
                  <tr key={item.date} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 border-b">
                      {new Date(item.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm border-b">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.project}
                          onChange={(e) => handleExpenseChange(index, 'project', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="项目"
                        />
                      ) : (
                        <span className="text-gray-900">{item.project || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-b">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.content}
                          onChange={(e) => handleExpenseChange(index, 'content', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="内容"
                        />
                      ) : (
                        <span className="text-gray-900">{item.content || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-b">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={item.amount}
                          onChange={(e) => handleExpenseChange(index, 'amount', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-red-600 font-medium">
                          {item.amount > 0 ? `¥${item.amount.toLocaleString()}` : '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-b">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.reimbursePerson}
                          onChange={(e) => handleExpenseChange(index, 'reimbursePerson', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="报销人"
                        />
                      ) : (
                        <span className="text-gray-900">{item.reimbursePerson || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-b">
                      {isEditing ? (
                        <select
                          value={item.isReimbursed ? 'true' : 'false'}
                          onChange={(e) => handleExpenseChange(index, 'isReimbursed', e.target.value === 'true')}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="false">否</option>
                          <option value="true">是</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.isReimbursed 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {item.isReimbursed ? '已报销' : '未报销'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-b">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => handleExpenseChange(index, 'note', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="备注"
                        />
                      ) : (
                        <span className="text-gray-600">{item.note || '-'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDetails;