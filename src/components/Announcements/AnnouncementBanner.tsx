import React, { useState, useEffect } from 'react';
import { Megaphone, X, ChevronLeft, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import { useAnnouncements } from '../../hooks/useDatabase';
import { Announcement } from '../../types';

const AnnouncementBanner: React.FC = () => {
  const { announcements, loading } = useAnnouncements();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(true);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  // 过滤掉已关闭的公告
  const filteredAnnouncements = announcements.filter(
    announcement => !dismissedAnnouncements.includes(announcement.id)
  );

  // 当公告列表变化时，重置当前索引
  useEffect(() => {
    setCurrentIndex(0);
  }, [announcements]);

  // 如果没有公告或全部被关闭，不显示横幅
  if (loading || filteredAnnouncements.length === 0 || !showBanner) {
    return null;
  }

  const currentAnnouncement = filteredAnnouncements[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? filteredAnnouncements.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === filteredAnnouncements.length - 1 ? 0 : prev + 1));
  };

  const handleDismiss = (id: string) => {
    setDismissedAnnouncements((prev) => [...prev, id]);
    
    // 如果关闭了最后一个公告，隐藏整个横幅
    if (filteredAnnouncements.length === 1) {
      setShowBanner(false);
    } else {
      // 如果关闭的是当前显示的公告，显示下一个
      if (currentIndex === filteredAnnouncements.length - 1) {
        setCurrentIndex(0);
      }
    }
  };

  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'important':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getPriorityIcon = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'important':
        return <Info className="w-5 h-5 text-amber-600" />;
      default:
        return <Megaphone className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className={`${getPriorityColor(currentAnnouncement.priority)} border rounded-lg p-3 mb-6`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          {getPriorityIcon(currentAnnouncement.priority)}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {currentAnnouncement.title}
          </p>
          <p className="text-sm truncate">
            {currentAnnouncement.content.split('\n')[0]}
          </p>
        </div>
        
        <div className="flex items-center ml-4 space-x-2">
          {filteredAnnouncements.length > 1 && (
            <>
              <button 
                onClick={handlePrevious}
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors"
                title="上一条"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-xs">
                {currentIndex + 1}/{filteredAnnouncements.length}
              </span>
              
              <button 
                onClick={handleNext}
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors"
                title="下一条"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          
          <button 
            onClick={() => handleDismiss(currentAnnouncement.id)}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;