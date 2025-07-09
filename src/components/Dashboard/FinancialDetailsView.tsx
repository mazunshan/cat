import React, { useState, useEffect } from 'react';
import { Calendar, Download, Edit, Save, X, ChevronLeft, ChevronRight, Plus, Trash2, Check, DollarSign, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface IncomeItem {
  id: string;
  date: string;
  amount: number;
  note: string;
  otherIncome: number;
}

interface ExpenseItem {
  id: string;
  date: string;
  project: string;
  content: string;
  amount: number;
  reimbursePerson: string;
  isReimbursed: boolean;
  note: string;
}

interface MonthlyFinancialData {
  income: IncomeItem[];
  expenses: ExpenseItem[];
}

const FinancialDetailsView: React.FC = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [isEditing, setIsEditing] = useState(false);
  const [financialData, setFinancialData] = useState<MonthlyFinancialData>({
    income: [],
    expenses: []
  });
  const [loading, setLoading] = useState(false);

  // 获取当月的天数
  const getDaysInMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  // 初始化当月数据
  useEffect(() => {
    setLoading(true);
    
    // 模拟从API获取数据
    setTimeout(() => {
      const daysInMonth = getDaysInMonth(selectedMonth);
      const [year, month] = selectedMonth.split('-').map(Number);
      
      // 生成模拟数据
      const mockIncome: IncomeItem[] = [];
      const mockExpenses: ExpenseItem[] = [];
      
      // 生成收入数据
      for (let i = 1; i <= daysInMonth; i++) {
        // 只为部分日期生成数据，使其看起来更真实
        if (Math.random() > 0.7) {
          const date = `${selectedMonth}-${String(i).padStart(2, '0')}`;
          mockIncome.push({
            id: `income-${date}`,
            date,
            amount: Math.floor(Math.random() * 10000) + 5000,
            note: `销售收入 - ${date}`,
            otherIncome: Math.random() > 0.8 ? Math.floor(Math.random() * 2000) : 0
          });
        }
      }
      
      // 生成支出数据
      const expenseProjects = ['店铺租金', '员工工资', '猫粮采购', '医疗用品', '广告费用', '水电费', '其他'];
      for (let i = 1; i <= daysInMonth; i++) {
        // 只为部分日期生成数据
        if (Math.random() > 0.8) {
          const date = `${selectedMonth}-${String(i).padStart(2, '0')}`;
          const project = expenseProjects[Math.floor(Math.random() * expenseProjects.length)];
          mockExpenses.push({
            id: `expense-${date}-${Math.random().toString(36).substring(2, 9)}`,
            date,
            project,
            content: `${project}支出 - ${date}`,
            amount: Math.floor(Math.random() * 5000) + 1000,
            reimbursePerson: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)],
            isReimbursed: Math.random() > 0.5,
            note: Math.random() > 0.7 ? '已完成报销' : ''
          });
        }
      }
      
      // 按日期排序
      mockIncome.sort((a, b) => a.date.localeCompare(b.date));
      mockExpenses.sort((a, b) => a.date.localeCompare(b.date));
      
      setFinancialData({
        income: mockIncome,
        expenses: mockExpenses
      });
      
      setLoading(false);
    }, 800);
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

  // 添加新的收入项
  const addIncomeItem = () => {
    const newItem: IncomeItem = {
      id: `income-new-${Date.now()}`,
      date: `${selectedMonth}-01`,
      amount: 0,
      note: '',
      otherIncome: 0
    };
    
    setFinancialData(prev => ({
      ...prev,
      income: [...prev.income, newItem]
    }));
  };

  // 添加新的支出项
  const addExpenseItem = () => {
    const newItem: ExpenseItem = {
      id: `expense-new-${Date.now()}`,
      date: `${selectedMonth}-01`,
      project: '',
      content: '',
      amount: 0,
      reimbursePerson: '',
      isReimbursed: false,
      note: ''
    };
    
    setFinancialData(prev => ({
      ...prev,
      expenses: [...prev.expenses, newItem]
    }));
  };

  // 更新收入项
  const updateIncomeItem = (id: string, field: keyof IncomeItem, value: any) => {
    setFinancialData(prev => ({
      ...prev,
      income: prev.income.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // 更新支出项
  const updateExpenseItem = (id: string, field: keyof ExpenseItem, value: any) => {
    setFinancialData(prev => ({
      ...prev,
      expenses: prev.expenses.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // 删除收入项
  const deleteIncomeItem = (id: string) => {
    setFinancialData(prev => ({
      ...prev,
      income: prev.income.filter(item => item.id !== id)
    }));
  };

  // 删除支出项
  const deleteExpenseItem = (id: string) => {
    setFinancialData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(item => item.id !== id)
    }));
  };

  // 保存数据
  const saveData = () => {
    setLoading(true);
    
    // 模拟API保存
    setTimeout(() => {
      setIsEditing(false);
      setLoading(false);
      alert('数据保存成功！');
    }, 800);
  };

  // 导出数据为CSV
  const exportData = () => {
    // 收入数据
    const incomeCSV = [
      ['日期', '销售金额', '其他收入', '备注'].join(','),
      ...financialData.income.map(item => [
        item.date,
        item.amount,
        item.otherIncome,
        item.note
      ].join(','))
    ].join('\n');
    
    // 支出数据
    const expensesCSV = [
      ['日期', '项目', '内容', '金额', '报销人', '是否报销', '备注'].join(','),
      ...financialData.expenses.map(item => [
        item.date,
        item.project,
        item.content,
        item.amount,
        item.reimbursePerson,
        item.isReimbursed ? '是' : '否',
        item.note
      ].join(','))
    ].join('\n');
    
    // 合并数据
    const combinedCSV = `收入明细\n${incomeCSV}\n\n支出明细\n${expensesCSV}`;
    
    // 创建下载链接
    const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `财务明细_${selectedMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 计算总收入和总支出
  const totalIncome = financialData.income.reduce((sum, item) => sum + item.amount + item.otherIncome, 0);
  const totalExpenses = financialData.expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // 如果不是管理员，显示权限不足提示
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">访问受限</h3>
          <p className="text-gray-600">只有管理员可以查看财务明细</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">收支明细</h2>
          <p className="text-gray-600 mt-1">查看和管理月度财务数据</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 月份选择器 */}
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
            <button 
              onClick={goToPreviousMonth}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="px-4 py-2 font-medium">
              {new Date(selectedMonth + '-01').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
            </div>
            
            <button 
              onClick={goToNextMonth}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* 编辑/保存按钮 */}
          {isEditing ? (
            <div className="flex space-x-2">
              <button 
                onClick={saveData}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
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
          
          {/* 导出按钮 */}
          <button 
            onClick={exportData}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </button>
        </div>
      </div>

      {/* 财务摘要卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总收入</p>
              <p className="text-2xl font-bold text-blue-600">¥{totalIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总支出</p>
              <p className="text-2xl font-bold text-red-600">¥{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">净利润</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ¥{netProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 收入明细 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">销售收入</h3>
          {isEditing && (
            <button 
              onClick={addIncomeItem}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加收入
            </button>
          )}
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
                  其他收入
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  备注
                </th>
                {isEditing && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={isEditing ? 5 : 4} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                      加载中...
                    </div>
                  </td>
                </tr>
              ) : financialData.income.length === 0 ? (
                <tr>
                  <td colSpan={isEditing ? 5 : 4} className="px-6 py-4 text-center text-gray-500">
                    暂无收入数据
                  </td>
                </tr>
              ) : (
                financialData.income.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="date"
                          value={item.date}
                          onChange={(e) => updateIncomeItem(item.id, 'date', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        new Date(item.date).toLocaleDateString('zh-CN')
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateIncomeItem(item.id, 'amount', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        `¥${item.amount.toLocaleString()}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.otherIncome}
                          onChange={(e) => updateIncomeItem(item.id, 'otherIncome', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        `¥${item.otherIncome.toLocaleString()}`
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => updateIncomeItem(item.id, 'note', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        item.note
                      )}
                    </td>
                    {isEditing && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => deleteIncomeItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
              {/* 总计行 */}
              <tr className="bg-gray-50 font-medium">
                <td className="px-6 py-4 whitespace-nowrap">总计</td>
                <td className="px-6 py-4 whitespace-nowrap text-blue-600">
                  ¥{financialData.income.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-blue-600">
                  ¥{financialData.income.reduce((sum, item) => sum + item.otherIncome, 0).toLocaleString()}
                </td>
                <td colSpan={isEditing ? 2 : 1} className="px-6 py-4 whitespace-nowrap"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 支出明细 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">开销支出</h3>
          {isEditing && (
            <button 
              onClick={addExpenseItem}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加支出
            </button>
          )}
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
                {isEditing && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={isEditing ? 8 : 7} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                      加载中...
                    </div>
                  </td>
                </tr>
              ) : financialData.expenses.length === 0 ? (
                <tr>
                  <td colSpan={isEditing ? 8 : 7} className="px-6 py-4 text-center text-gray-500">
                    暂无支出数据
                  </td>
                </tr>
              ) : (
                financialData.expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="date"
                          value={item.date}
                          onChange={(e) => updateExpenseItem(item.id, 'date', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        new Date(item.date).toLocaleDateString('zh-CN')
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.project}
                          onChange={(e) => updateExpenseItem(item.id, 'project', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        item.project
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.content}
                          onChange={(e) => updateExpenseItem(item.id, 'content', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        item.content
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateExpenseItem(item.id, 'amount', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        `¥${item.amount.toLocaleString()}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.reimbursePerson}
                          onChange={(e) => updateExpenseItem(item.id, 'reimbursePerson', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        item.reimbursePerson
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={item.isReimbursed}
                            onChange={(e) => updateExpenseItem(item.id, 'isReimbursed', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </label>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.isReimbursed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
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
                          onChange={(e) => updateExpenseItem(item.id, 'note', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        item.note
                      )}
                    </td>
                    {isEditing && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => deleteExpenseItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
              {/* 总计行 */}
              <tr className="bg-gray-50 font-medium">
                <td className="px-6 py-4 whitespace-nowrap">总计</td>
                <td colSpan={2} className="px-6 py-4 whitespace-nowrap"></td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600">
                  ¥{financialData.expenses.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                </td>
                <td colSpan={isEditing ? 4 : 3} className="px-6 py-4 whitespace-nowrap"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialDetailsView;