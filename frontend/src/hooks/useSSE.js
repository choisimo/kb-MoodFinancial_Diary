import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useSSE = (onNotification, options = {}) => {
  const { isAuthenticated, user } = useAuth();
  const [connectionState, setConnectionState] = useState('disconnected');
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const { 
    autoReconnect = true, 
    reconnectInterval = 5000,
    maxReconnectAttempts = 10 
  } = options;
  const reconnectAttempts = useRef(0);

  const connect = () => {
    if (!isAuthenticated || !user) {
      console.log('SSE: Not authenticated, skipping connection');
      return;
    }

    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      console.log('SSE: Already connected');
      return;
    }

    try {
      setConnectionState('connecting');
      console.log('SSE: Attempting to connect...');

      const token = localStorage.getItem('token');
      const url = `${process.env.REACT_APP_API_URL}/api/notifications/stream`;
      
      // EventSource는 헤더를 직접 설정할 수 없으므로 토큰을 쿼리 파라미터로 전달
      const eventSource = new EventSource(`${url}?token=${token}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE: Connection opened');
        setConnectionState('connected');
        reconnectAttempts.current = 0;
      };

      eventSource.addEventListener('connect', (event) => {
        console.log('SSE: Connect event received:', event.data);
      });

      eventSource.addEventListener('notification', (event) => {
        try {
          const notification = JSON.parse(event.data);
          console.log('SSE: Notification received:', notification);
          onNotification?.(notification);
        } catch (error) {
          console.error('SSE: Error parsing notification:', error);
        }
      });

      eventSource.onerror = (error) => {
        console.error('SSE: Connection error:', error);
        setConnectionState('error');
        
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('SSE: Connection closed by server');
          handleReconnect();
        }
      };

    } catch (error) {
      console.error('SSE: Failed to create connection:', error);
      setConnectionState('error');
      handleReconnect();
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setConnectionState('disconnected');
    console.log('SSE: Disconnected');
  };

  const handleReconnect = () => {
    if (!autoReconnect || reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('SSE: Max reconnect attempts reached or auto-reconnect disabled');
      setConnectionState('failed');
      return;
    }

    const delay = reconnectInterval * Math.pow(1.5, reconnectAttempts.current);
    console.log(`SSE: Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current++;
      connect();
    }, delay);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  // 브라우저 가시성 API를 사용하여 탭이 활성화될 때 연결 확인
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && user) {
        if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
          console.log('SSE: Tab became visible, reconnecting...');
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, user]);

  return {
    connectionState,
    connect,
    disconnect,
    isConnected: connectionState === 'connected'
  };
};