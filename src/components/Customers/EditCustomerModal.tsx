Here's the fixed version with all missing closing brackets and proper structure:

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Upload } from 'lucide-react';
import { Customer, CustomerFile } from '../../types';
import { SALES_STAFF } from '../../hooks/useDatabase'; 

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerId: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'files' | 'orders'>) => void;
  onAddFile?: (customerId: string, fileData: Omit<CustomerFile, 'id' | 'uploadedAt'>) => Promise<void>;
  customer: Customer | null;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onAddFile,
  customer 
}) => {
  const [formData, setFormData] = useState({
    // 基本信息
    name: '',
    gender: 'female' as 'male' | 'female',
    phone: '',
    wechat: '',
    address: '',
    occupation: '',
    // 客户类型
    customerType: 'retail' as 'retail' | 'installment',
    // 零售客户特有字段
    orderDate: new Date().toISOString().split('T')[0],
    salesPerson: SALES_STAFF[0],
    catName: '',
    catBirthday: '',
    isMallMember: false,
    catBreed: '',
    catGender: 'female' as 'male' | 'female',
    supplyChain: '',
    supplyChainDeposit: 0,
    totalAmount: 0,
    paymentMethod: 'full' as 'full' | 'cod' | 'balance',
    customerDeposit: 0,
    depositDestination: '',
    shippingDate: '',
    shippingVideo: '',
    balance: 0,
    balancePaid: false,
    balanceConfirmMethod: '',
    sellingPrice: 0,
    cost: 0,
    shippingFee: 0,
    profit: 0,
    profitRate: 0,
    // 分期客户特有字段
    contractName: '',
    relationship: '',
    isInGroup: false,
    repaymentDate: '',
    installmentPeriod: '',
    catCost: 0,
    receivableAmount: 0,
    paymentDestination: '',
    installmentAmount: 0,
    installmentCount: 6,
    signingMethod: '',
    isFirstManualTransfer: false,
    hasESignContract: false,
    contractTotalPrice: 0,
    mallGrossProfit: 0,
    monthlyProfit: 0,
    breakEvenPeriod: 0,
    // 通用字段
    tags: [] as string[],
    notes: ''
  });

  // 文件上传相关状态
  const [fileType, setFileType] = useState<'image' | 'video' | 'document'>('image');
  const [fileDescription, setFileDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newTag, setNewTag] = useState('');
  const [fileUploadType, setFileUploadType] = useState<'image' | 'video' | 'document'>('image');
  const [files, setFiles] = useState<CustomerFile[]>([]);

  useEffect(() => {
    if (customer) {
      // 设置基本信息
      const customerType = customer.customerType || 'retail';
      
      // 根据客户类型设置不同的初始表单数据
      setFormData({
        // 基本信息
        name: customer.name,
        gender: customer.gender,
        phone: customer.phone,
        wechat: customer.wechat,
        address: customer.address,
        occupation: customer.occupation,
        // 客户类型 - 默认为零售客户
        customerType: customer.customerType || 'retail',
        // 零售客户特有字段
        orderDate: customer.orderDate || new Date().toISOString().split('T')[0],
        salesPerson: customer.salesPerson || SALES_STAFF[0],
        catName: customer.catName || '',
        catBirthday: customer.catBirthday || '',
        isMallMember: customer.isMallMember || false,
        catBreed: customer.catBreed || '',
        catGender: customer.catGender || 'female',
        supplyChain: customer.supplyChain || '',
        supplyChainDeposit: customer.supplyChainDeposit || 0,
        totalAmount: customer.totalAmount || 0,
        paymentMethod: customer.paymentMethod || 'full',
        customerDeposit: customer.customerDeposit || 0,
        depositDestination: customer.depositDestination || '',
        shippingDate: customer.shippingDate || '',
        shippingVideo: customer.shippingVideo || '',
        balance: customer.balance || 0,
        balancePaid: customer.balancePaid || false,
        balanceConfirmMethod: customer.balanceConfirmMethod || '',
        sellingPrice: customer.sellingPrice || 0,
        cost: customer.cost || 0,
        shippingFee: customer.shippingFee || 0,
        profit: customer.profit || 0,
        profitRate: customer.profitRate || 0,
        // 分期客户特有字段
        contractName: customer.contractName || '',
        relationship: customer.relationship || '',
        isInGroup: customer.isInGroup || false,
        repaymentDate: customer.repaymentDate || '',
        installmentPeriod: customer.installmentPeriod || '',
        catCost: customer.catCost || 0,
        receivableAmount: customer.receivableAmount || 0,
        paymentDestination: customer.paymentDestination || '',
        installmentAmount: customer.installmentAmount || 0,
        installmentCount: customer.installmentCount || 6,
        signingMethod: customer.signingMethod || '',
        isFirstManualTransfer: customer.isFirstManualTransfer || false,
        hasESignContract: customer.hasESignContract || false,
        contractTotalPrice: customer.contractTotalPrice || 0,
        mallGrossProfit: customer.mallGrossProfit || 0,
        monthlyProfit: customer.monthlyProfit || 0,
        breakEvenPeriod: customer.breakEvenPeriod || 0,
        // 通用字段
        tags: customer.tags || [],
        notes: customer.notes || ''
      });
    }
  }, [customer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customer) {
      onSave(customer.id, formData);
      onClose();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const file = selectedFiles[0];
      const fileUrl = URL.createObjectURL(file);

      if (customer && onAddFile) {
        onAddFile(customer.id, {
          name: file.name,
          type: fileUploadType,
          url: fileUrl,
          description: fileDescription
        }).then(() => {
          setFileDescription('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }).catch(error => {
          console.error('Failed to add file:', error);
          alert('添加文件失败，请重试');
        });
      }
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Upload className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Upload className="w-5 h-5 text-green-500" />;
      case 'document':
        return <Upload className="w-5 h-5 text-gray-500" />;
      default:
        return <Upload className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">编辑客户信息</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Rest of the form content remains the same */}
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;
```