import React, { useState, useRef } from 'react';
import { Upload, X, Image, FileText, MessageSquare, Video, Camera } from 'lucide-react';
import { CustomerFile } from '../../types';

interface CustomerFileUploadProps {
  onFileUpload: (file: Omit<CustomerFile, 'id' | 'uploadedAt'>) => void;
  fileType: 'image' | 'video' | 'document' | 'communication';
  title: string;
}

const CustomerFileUpload: React.FC<CustomerFileUploadProps> = ({ onFileUpload, fileType, title }) => {
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      
      // Create a local URL for preview
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setPreviewUrl(url);
      
      // Reset the input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileName || !fileUrl) {
      alert('请选择文件');
      return;
    }
    
    onFileUpload({
      name: fileName,
      type: fileType === 'communication' ? 'image' : fileType, // 沟通截图作为图片类型存储
      url: fileUrl,
      description: description
    });
    
    // Reset form
    setFileName('');
    setFileUrl('');
    setDescription('');
    setPreviewUrl(null);
  };

  const getFileIcon = () => {
    switch (fileType) {
      case 'image':
      case 'communication':
        return <Image className="w-5 h-5 text-blue-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-green-600" />;
      case 'document':
        return <FileText className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAcceptTypes = () => {
    switch (fileType) {
      case 'image':
      case 'communication':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt';
      default:
        return '*/*';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-4">
        {getFileIcon()}
        <h3 className="text-lg font-medium text-gray-800 ml-2">{title}</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={getAcceptTypes()}
            className="hidden"
            id={`file-input-${fileType}`}
          />
          <label 
            htmlFor={`file-input-${fileType}`}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 border-dashed rounded-lg text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-5 h-5 mr-2 text-gray-500" />
            <span>{fileName || `选择${fileType === 'image' ? '图片' : fileType === 'video' ? '视频' : fileType === 'document' ? '文档' : '沟通截图'}`}</span>
          </label>
        </div>
        
        {previewUrl && (fileType === 'image' || fileType === 'communication') && (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="预览" 
              className="w-full h-40 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                setFileName('');
                setFileUrl('');
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {previewUrl && fileType === 'video' && (
          <div className="relative">
            <video 
              src={previewUrl} 
              controls
              className="w-full h-40 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                setFileName('');
                setFileUrl('');
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文件描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={`请输入${fileType === 'image' ? '图片' : fileType === 'video' ? '视频' : fileType === 'document' ? '文档' : '沟通截图'}描述`}
          />
        </div>
        
        <button
          type="submit"
          disabled={!fileName}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上传文件
        </button>
      </form>
    </div>
  );
};

export default CustomerFileUpload;