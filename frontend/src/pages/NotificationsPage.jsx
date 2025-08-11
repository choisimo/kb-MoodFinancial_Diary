import React, { useState } from 'react';
import { Bell, Settings } from 'lucide-react';
import NotificationList from '../components/Notification/NotificationList';
import NotificationSettings from '../components/Notification/NotificationSettings';

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('notifications');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* 탭 네비게이션 */}
        <div className="bg-white border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>알림</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>설정</span>
              </div>
            </button>
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="py-6">
          {activeTab === 'notifications' && <NotificationList />}
          {activeTab === 'settings' && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;