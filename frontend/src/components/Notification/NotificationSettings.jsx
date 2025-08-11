import React, { useState, useEffect } from 'react';
import { Settings, Bell, Clock, TrendingUp, Trophy, Globe, Mail, Wifi, WifiOff, TestTube } from 'lucide-react';
import { notificationAPI } from '../../services/notificationAPI';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationSettings = () => {
  const { 
    connectionStates, 
    fcmToken, 
    sendTestFCMNotification,
    sendTestNotification,
    refreshFCMToken,
    initializeFCM
  } = useNotifications();
  const [settings, setSettings] = useState({
    diaryReminderEnabled: true,
    diaryReminderTime: '20:00',
    moodAnalysisEnabled: true,
    financialInsightsEnabled: true,
    achievementNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    emailNotificationsEnabled: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await notificationAPI.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await notificationAPI.updateSettings(settings);
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getConnectionIcon = (state) => {
    switch (state) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'connecting':
      case 'initializing':
        return <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />;
      case 'error':
      case 'failed':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'denied':
        return <WifiOff className="w-4 h-4 text-orange-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConnectionText = (state) => {
    switch (state) {
      case 'connected':
        return '연결됨';
      case 'connecting':
      case 'initializing':
        return '연결 중...';
      case 'error':
      case 'failed':
        return '연결 실패';
      case 'denied':
        return '권한 거부';
      default:
        return '연결 안됨';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">알림 설정</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* 연결 상태 표시 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">실시간 알림 연결 상태</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getConnectionIcon(connectionStates.websocket)}
                <span className="text-sm font-medium">WebSocket</span>
              </div>
              <span className="text-xs text-gray-600">{getConnectionText(connectionStates.websocket)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getConnectionIcon(connectionStates.sse)}
                <span className="text-sm font-medium">SSE</span>
              </div>
              <span className="text-xs text-gray-600">{getConnectionText(connectionStates.sse)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getConnectionIcon(connectionStates.fcm)}
                <span className="text-sm font-medium">FCM</span>
              </div>
              <span className="text-xs text-gray-600">{getConnectionText(connectionStates.fcm)}</span>
            </div>
          </div>
          
          {/* FCM 토큰 정보 */}
          {fcmToken && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>FCM 토큰:</strong> {fcmToken.slice(0, 20)}...
              </div>
            </div>
          )}
          
          {/* 테스트 버튼들 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={sendTestNotification}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
            >
              <TestTube className="w-4 h-4" />
              <span>일반 알림 테스트</span>
            </button>
            
            {fcmToken && (
              <button
                onClick={sendTestFCMNotification}
                className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors"
              >
                <TestTube className="w-4 h-4" />
                <span>FCM 알림 테스트</span>
              </button>
            )}
            
            <button
              onClick={refreshFCMToken}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 transition-colors"
            >
              <span>FCM 토큰 새로고침</span>
            </button>
            
            <button
              onClick={initializeFCM}
              className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 text-sm rounded-lg hover:bg-orange-200 transition-colors"
            >
              <span>FCM 다시 초기화</span>
            </button>
          </div>
        </div>

        <hr className="border-gray-200" />
        {/* 일기 알림 설정 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-900">일기 알림</h3>
          </div>
          
          <div className="space-y-3 pl-8">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.diaryReminderEnabled}
                onChange={(e) => handleChange('diaryReminderEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">매일 일기 작성 알림 받기</span>
            </label>
            
            {settings.diaryReminderEnabled && (
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">알림 시간:</span>
                <input
                  type="time"
                  value={settings.diaryReminderTime}
                  onChange={(e) => handleChange('diaryReminderTime', e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* 감정 분석 알림 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-lg">😊</span>
            <h3 className="text-lg font-medium text-gray-900">감정 분석</h3>
          </div>
          
          <div className="pl-8">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.moodAnalysisEnabled}
                onChange={(e) => handleChange('moodAnalysisEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">감정 분석 결과 알림 받기</span>
            </label>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* 금융 인사이트 알림 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-medium text-gray-900">금융 인사이트</h3>
          </div>
          
          <div className="pl-8">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.financialInsightsEnabled}
                onChange={(e) => handleChange('financialInsightsEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">금융 인사이트 및 분석 결과 알림 받기</span>
            </label>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* 성취 알림 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-medium text-gray-900">성취 알림</h3>
          </div>
          
          <div className="pl-8">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.achievementNotificationsEnabled}
                onChange={(e) => handleChange('achievementNotificationsEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">목표 달성 및 성취 알림 받기</span>
            </label>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* 알림 방식 설정 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">알림 방식</h3>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.pushNotificationsEnabled}
                onChange={(e) => handleChange('pushNotificationsEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Globe className="w-4 h-4 ml-3 mr-2 text-gray-400" />
              <span className="text-sm text-gray-700">브라우저 푸시 알림</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.emailNotificationsEnabled}
                onChange={(e) => handleChange('emailNotificationsEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Mail className="w-4 h-4 ml-3 mr-2 text-gray-400" />
              <span className="text-sm text-gray-700">이메일 알림</span>
            </label>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="pt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;