import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Settings, Trash2 } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const NotificationList = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    loadNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadMoreNotifications();
  }, []);

  const loadMoreNotifications = async () => {
    try {
      const response = await loadNotifications(currentPage, 20);
      setHasMore(response.hasNext);
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'DIARY_REMINDER':
        return '📝';
      case 'MOOD_ANALYSIS':
        return '😊';
      case 'FINANCIAL_INSIGHT':
        return '💰';
      case 'ACHIEVEMENT':
        return '🏆';
      case 'SYSTEM':
      default:
        return '🔔';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'DIARY_REMINDER':
        return '일기 알림';
      case 'MOOD_ANALYSIS':
        return '감정 분석';
      case 'FINANCIAL_INSIGHT':
        return '금융 인사이트';
      case 'ACHIEVEMENT':
        return '성취';
      case 'SYSTEM':
        return '시스템';
      default:
        return '알림';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">알림</h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount}개의 새로운 알림
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              모두 읽음
            </button>
          )}
          <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Settings className="w-4 h-4 mr-2" />
            설정
          </button>
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {notifications.length === 0 && !isLoading ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">알림이 없습니다</h3>
            <p className="text-gray-500">새로운 알림이 도착하면 여기에 표시됩니다.</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {getTypeLabel(notification.type)}
                          </span>
                          {!notification.isRead && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {notification.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{formatTime(notification.createdAt)}</span>
                          {notification.isRead && notification.readAt && (
                            <>
                              <span className="mx-2">•</span>
                              <Check className="w-4 h-4 mr-1" />
                              <span>읽음</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            title="읽음으로 표시"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 더 보기 버튼 */}
            {hasMore && (
              <div className="p-6 text-center bg-gray-50">
                <button
                  onClick={loadMoreNotifications}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? '로딩 중...' : '더 보기'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationList;