import React from 'react';
import { X, Phone, MessageCircle, MapPin, Briefcase, Tag, FileText, Camera, Video, Calendar } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onClose }) => {
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
            <div className="bg-gray-50 rounded-xl p-6">
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
            {customer.files.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">客户文件</h3>
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
              </div>
            )}

            {/* Orders */}
            <div>
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
                <div className="text-center py-8 text-gray-500">
                  <p>暂无订单记录</p>
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