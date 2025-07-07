import React from 'react';
import { X, Phone, MessageCircle, MapPin, Briefcase, Tag, FileText, Camera, Video, Calendar, Upload, Plus, User, DollarSign, Truck, CreditCard, Percent, Clock, FileCheck, Building } from 'lucide-react';
import { Customer, CustomerFile } from '../../types';

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
  onAddFile: (customerId: string, fileData: Omit<CustomerFile, 'id' | 'uploadedAt'>) => Promise<void>;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onClose, onAddFile }) => {
  const [showFileUpload, setShowFileUpload] = React.useState(false);
  const [fileUploadType, setFileUploadType] = React.useState<'image' | 'video' | 'document'>('image');
  const [fileDescription, setFileDescription] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // 计算利润率
  const calculateProfitRate = (profit?: number, sellingPrice?: number) => {
    if (!profit || !sellingPrice || sellingPrice === 0) return 0;
    return ((profit / sellingPrice) * 100).toFixed(2);
  };

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      
      try {
        await onAddFile(customer.id, {
          name: file.name,
          type: fileUploadType,
          url: fileUrl,
          description: fileDescription
        });
        
        // 重置表单
        setFileDescription('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setShowFileUpload(false);
      } catch (error) {
        console.error('Failed to add file:', error);
        alert('添加文件失败，请重试');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-2xl">
                {customer.name.charAt(0)}
              </span>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-800">{customer.name}</h2>
              <p className="text-gray-600">客户详情</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">电话</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">微信</p>
                    <p className="font-medium">{customer.wechat}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">地址</p>
                    <p className="font-medium">{customer.address}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">职业</p>
                    <p className="font-medium">{customer.occupation}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 客户类型信息 */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {customer.customerType === 'installment' ? '分期客户信息' : '零售客户信息'}
              </h3>
              
              {customer.customerType === 'retail' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 零售客户特有字段 */}
                  <div>
                    <p className="text-sm text-gray-600">订单日期</p>
                    <p className="font-medium">{customer.orderDate || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">销售员</p>
                    <p className="font-medium">{customer.salesPerson || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">猫咪姓名</p>
                    <p className="font-medium">{customer.catName || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">猫咪生日</p>
                    <p className="font-medium">{customer.catBirthday || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">商城会员</p>
                    <p className="font-medium">{customer.isMallMember ? '是' : '否'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">猫咪品种</p>
                    <p className="font-medium">{customer.catBreed || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">猫咪性别</p>
                    <p className="font-medium">{customer.catGender === 'female' ? '妹妹' : customer.catGender === 'male' ? '弟弟' : '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">供应链</p>
                    <p className="font-medium">{customer.supplyChain || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">供应链定金</p>
                    <p className="font-medium">¥{customer.supplyChainDeposit?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">全款额度</p>
                    <p className="font-medium">¥{customer.totalAmount?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">付款方式</p>
                    <p className="font-medium">
                      {customer.paymentMethod === 'full' ? '全款' : 
                       customer.paymentMethod === 'shipping_balance' ? '发货补尾款' : 
                       customer.paymentMethod === 'cash_on_delivery' ? '货到付款' : '未设置'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">客户定金</p>
                    <p className="font-medium">¥{customer.customerDeposit?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">定金去向</p>
                    <p className="font-medium">{customer.depositDestination || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">发货时间</p>
                    <p className="font-medium">{customer.shippingDate || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">尾款</p>
                    <p className="font-medium">¥{customer.balance?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">尾款是否补齐</p>
                    <p className="font-medium">{customer.balancePaid ? '是' : '否'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">尾款确认方式</p>
                    <p className="font-medium">{customer.balanceConfirmMethod || '未设置'}</p>
                  </div>
                  
                  {/* 财务信息 */}
                  <div className="md:col-span-3 mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-3">财务信息</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">卖价</p>
                        <p className="font-medium text-blue-600">¥{customer.sellingPrice?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">成本</p>
                        <p className="font-medium text-red-600">¥{customer.cost?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">运费</p>
                        <p className="font-medium">¥{customer.shippingFee?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">利润</p>
                        <p className="font-medium text-green-600">¥{customer.profit?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">利润率</p>
                        <p className="font-medium text-green-600">
                          {customer.profitRate ? `${customer.profitRate}%` : 
                           calculateProfitRate(customer.profit, customer.sellingPrice) + '%'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : customer.customerType === 'installment' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 分期客户特有字段 */}
                  <div>
                    <p className="text-sm text-gray-600">订单日期</p>
                    <p className="font-medium">{customer.orderDate || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">销售员</p>
                    <p className="font-medium">{customer.salesPerson || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">猫咪姓名</p>
                    <p className="font-medium">{customer.catName || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">签约姓名</p>
                    <p className="font-medium">{customer.contractName || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">关系</p>
                    <p className="font-medium">{customer.relationship || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">猫咪品种</p>
                    <p className="font-medium">{customer.catBreed || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">猫咪性别</p>
                    <p className="font-medium">{customer.catGender === 'female' ? '妹妹' : customer.catGender === 'male' ? '弟弟' : '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">是否拉群</p>
                    <p className="font-medium">{customer.isInGroup ? '是' : '否'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">猫咪生日</p>
                    <p className="font-medium">{customer.catBirthday || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">供应链</p>
                    <p className="font-medium">{customer.supplyChain || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">还款时间</p>
                    <p className="font-medium">{customer.repaymentDate || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">分期时间范围</p>
                    <p className="font-medium">{customer.installmentPeriod || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">猫咪成本</p>
                    <p className="font-medium">¥{customer.catCost?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">收款额度</p>
                    <p className="font-medium">¥{customer.collectionAmount?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">款项去向</p>
                    <p className="font-medium">{customer.fundsDestination || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">分期金额</p>
                    <p className="font-medium">¥{customer.installmentAmount?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">分期数</p>
                    <p className="font-medium">{customer.installmentCount || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">运费</p>
                    <p className="font-medium">¥{customer.shippingFee?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">签约方式</p>
                    <p className="font-medium">{customer.signingMethod || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">第一期是否手动转</p>
                    <p className="font-medium">{customer.isFirstPaymentManual ? '是' : '否'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">e签宝合同</p>
                    <p className="font-medium">{customer.hasESignContract ? '已签' : '未签'}</p>
                  </div>
                  
                  {/* 财务信息 */}
                  <div className="md:col-span-3 mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-3">财务信息</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">合约总价</p>
                        <p className="font-medium text-blue-600">¥{customer.contractTotalPrice?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">商城毛利</p>
                        <p className="font-medium">¥{customer.mallGrossProfit?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">成本</p>
                        <p className="font-medium text-red-600">¥{customer.cost?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">毛利润</p>
                        <p className="font-medium text-green-600">¥{customer.grossProfit?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">利润率</p>
                        <p className="font-medium text-green-600">
                          {customer.profitRate ? `${customer.profitRate}%` : 
                           calculateProfitRate(customer.grossProfit, customer.contractTotalPrice) + '%'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">月毛利</p>
                        <p className="font-medium text-green-600">¥{customer.monthlyProfit?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">回本期</p>
                        <p className="font-medium">{customer.breakEvenPeriod || '0'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">未设置客户类型</p>
              )}
            </div>

            {/* Tags */}
            {customer.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {customer.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  备注
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700">{customer.notes}</p>
                </div>
              </div>
            )}

            {/* Files */}
            <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">客户文件</h3>
                  <button
                    onClick={() => setShowFileUpload(!showFileUpload)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    添加文件
                  </button>
                </div>
                
                {/* 文件上传表单 */}
                {showFileUpload && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <select
                          value={fileUploadType}
                          onChange={(e) => setFileUploadType(e.target.value as 'image' | 'video' | 'document')}
                          className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="image">图片</option>
                          <option value="video">检疫视频</option>
                          <option value="document">聊天记录</option>
                        </select>
                        <input
                          type="text"
                          value={fileDescription}
                          onChange={(e) => setFileDescription(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="文件描述（可选）"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileSelect}
                          className="hidden"
                          accept={fileUploadType === 'image' ? 'image/*' : fileUploadType === 'video' ? 'video/*' : '*/*'}
                          id="customer-detail-file-input"
                        />
                        <label 
                          htmlFor="customer-detail-file-input"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center justify-center"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          选择{fileUploadType === 'image' ? '图片' : fileUploadType === 'video' ? '视频' : '文件'}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 文件列表 */}
                {customer.files.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.files.map((file) => (
                      <div
                        key={file.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center mb-3">
                          {file.type === 'image' && <Camera className="w-5 h-5 mr-2 text-blue-500" />}
                          {file.type === 'video' && <Video className="w-5 h-5 mr-2 text-green-500" />}
                          {file.type === 'document' && <FileText className="w-5 h-5 mr-2 text-gray-500" />}
                          <h4 className="font-medium text-gray-800">{file.name}</h4>
                        </div>
                        
                        {file.type === 'image' && (
                          <img 
                            src={file.url} 
                            alt={file.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg';
                            }}
                          />
                        )}
                        
                        {file.description && (
                          <p className="text-sm text-gray-600 mb-2">{file.description}</p>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(file.uploadedAt).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">暂无客户文件</p>
                    <p className="text-sm text-gray-400 mt-1">点击"添加文件"上传客户相关文件</p>
                  </div>
                )}
            </div>

            {/* Orders */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">订单历史</h3>
              {customer.orders.length > 0 ? (
                <div className="space-y-4">
                  {customer.orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{order.orderNumber}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-600' :
                          order.status === 'paid' ? 'bg-blue-100 text-blue-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {order.status === 'completed' ? '已完成' :
                           order.status === 'paid' ? '已付款' : '待处理'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">金额: ¥{order.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">暂无订单记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;