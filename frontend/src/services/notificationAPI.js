import api from './api';

export const notificationAPI = {
  getNotifications: (page = 0, size = 20) => 
    api.get(`/notifications?page=${page}&size=${size}`),
  
  getUnreadNotifications: () => 
    api.get('/notifications/unread'),
  
  getUnreadCount: () => 
    api.get('/notifications/unread/count'),
  
  markAsRead: (id) => 
    api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () => 
    api.put('/notifications/read-all'),
  
  getSettings: () => 
    api.get('/notifications/settings'),
  
  updateSettings: (settings) => 
    api.put('/notifications/settings', settings),
  
  sendTestNotification: () => 
    api.post('/notifications/test'),

  // FCM 관련 API
  registerFCMToken: (token, deviceType = 'web', browserInfo = '') =>
    api.post('/notifications/fcm/register', {
      token,
      deviceType,
      browserInfo
    }),

  unregisterFCMToken: (token) =>
    api.post('/notifications/fcm/unregister', {
      token
    }),

  sendTestFCMNotification: (token) =>
    api.post('/notifications/fcm/test', {
      token
    })
};