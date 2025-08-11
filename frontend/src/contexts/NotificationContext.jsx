import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationAPI } from '../services/notificationAPI';
import { useWebSocket } from '../hooks/useWebSocket';
import { useSSE } from '../hooks/useSSE';
import { useAuth } from './AuthContext';
import { 
  requestNotificationPermission, 
  onMessageListener, 
  getCurrentToken 
} from '../firebase-config';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStates, setConnectionStates] = useState({
    websocket: 'disconnected',
    sse: 'disconnected',
    fcm: 'disabled'
  });
  const [fcmToken, setFcmToken] = useState(null);
  const { isLoggedIn } = useAuth();

  // 실시간 알림 처리
  const handleNewNotification = (notification) => {
    console.log('New notification received:', notification);
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // 브라우저 알림 표시 (FCM이 포그라운드에서 메시지를 처리하지 않을 때)
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.svg',
        tag: notification.id?.toString(),
        data: {
          actionUrl: notification.actionUrl
        }
      });
    }
  };

  // WebSocket 연결
  const { connectionState: wsConnectionState } = useWebSocket(handleNewNotification);

  // SSE 연결 
  const { connectionState: sseConnectionState } = useSSE(handleNewNotification, {
    autoReconnect: true,
    reconnectInterval: 5000
  });

  // FCM 설정 및 초기화
  const initializeFCM = async () => {
    try {
      console.log('Initializing FCM...');
      setConnectionStates(prev => ({ ...prev, fcm: 'initializing' }));

      // FCM 토큰 요청
      const token = await requestNotificationPermission();
      if (token) {
        console.log('FCM token received:', token);
        setFcmToken(token);
        setConnectionStates(prev => ({ ...prev, fcm: 'connected' }));

        // 서버에 토큰 등록
        await registerFCMToken(token);

        // 포그라운드 메시지 리스너 설정
        onMessageListener()
          .then((payload) => {
            console.log('FCM foreground message received:', payload);
            // 포그라운드에서 받은 메시지를 알림으로 변환
            const notification = {
              id: payload.data?.id || Date.now(),
              title: payload.notification?.title || payload.data?.title,
              message: payload.notification?.body || payload.data?.message,
              type: payload.data?.type || 'SYSTEM',
              actionUrl: payload.data?.actionUrl,
              isRead: false,
              createdAt: new Date().toISOString()
            };
            handleNewNotification(notification);
          })
          .catch((err) => {
            console.error('Error in FCM foreground message listener:', err);
          });
      } else {
        console.log('FCM permission denied or not supported');
        setConnectionStates(prev => ({ ...prev, fcm: 'denied' }));
      }
    } catch (error) {
      console.error('Error initializing FCM:', error);
      setConnectionStates(prev => ({ ...prev, fcm: 'error' }));
    }
  };

  // FCM 토큰 서버 등록
  const registerFCMToken = async (token) => {
    try {
      const browserInfo = `${navigator.userAgent.slice(0, 100)}`;
      await notificationAPI.registerFCMToken(token, 'web', browserInfo);
      console.log('FCM token registered successfully');
    } catch (error) {
      console.error('Failed to register FCM token:', error);
    }
  };

  // FCM 토큰 해제
  const unregisterFCMToken = async (token) => {
    try {
      await notificationAPI.unregisterFCMToken(token);
      console.log('FCM token unregistered successfully');
    } catch (error) {
      console.error('Failed to unregister FCM token:', error);
    }
  };

  // Update connection states
  useEffect(() => {
    setConnectionStates(prev => ({
      ...prev,
      websocket: wsConnectionState,
      sse: sseConnectionState
    }));
  }, [wsConnectionState, sseConnectionState]);

  // 알림 목록 로드
  const loadNotifications = async (page = 0, size = 20) => {
    if (!isLoggedIn) return;
    
    try {
      setIsLoading(true);
      const response = await notificationAPI.getNotifications(page, size);
      if (page === 0) {
        setNotifications(response.data.content);
      } else {
        setNotifications(prev => [...prev, ...response.data.content]);
      }
      return response.data;
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 읽지 않은 알림 수 로드
  const loadUnreadCount = async () => {
    if (!isLoggedIn) return;
    
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  // 알림을 읽음으로 표시
  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // 모든 알림을 읽음으로 표시
  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // 테스트 알림 전송
  const sendTestNotification = async () => {
    try {
      await notificationAPI.sendTestNotification();
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  // 브라우저 알림 권한 요청 (기존 함수 업데이트)
  const requestBrowserNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Browser notification permission:', permission);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  // FCM 테스트 알림
  const sendTestFCMNotification = async () => {
    try {
      if (fcmToken) {
        await notificationAPI.sendTestFCMNotification(fcmToken);
        console.log('Test FCM notification sent');
      } else {
        console.warn('No FCM token available');
      }
    } catch (error) {
      console.error('Failed to send test FCM notification:', error);
    }
  };

  // FCM 토큰 새로고침
  const refreshFCMToken = async () => {
    try {
      const newToken = await getCurrentToken();
      if (newToken && newToken !== fcmToken) {
        console.log('FCM token refreshed:', newToken);
        if (fcmToken) {
          await unregisterFCMToken(fcmToken);
        }
        await registerFCMToken(newToken);
        setFcmToken(newToken);
      }
    } catch (error) {
      console.error('Failed to refresh FCM token:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadNotifications();
      loadUnreadCount();
      requestBrowserNotificationPermission();
      initializeFCM();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setConnectionStates({
        websocket: 'disconnected',
        sse: 'disconnected', 
        fcm: 'disabled'
      });
      
      // 로그아웃 시 FCM 토큰 해제
      if (fcmToken) {
        unregisterFCMToken(fcmToken);
        setFcmToken(null);
      }
    }
  }, [isLoggedIn]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (fcmToken) {
        unregisterFCMToken(fcmToken);
      }
    };
  }, [fcmToken]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    connectionStates,
    fcmToken,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    sendTestNotification,
    sendTestFCMNotification,
    requestBrowserNotificationPermission,
    refreshFCMToken,
    initializeFCM
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};