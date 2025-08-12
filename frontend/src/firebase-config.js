// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase only if configuration is complete
let app = null;
if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase configuration incomplete. Skipping initialization.');
}

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging = null;

// Check if messaging is supported and app is initialized
if (app) {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    } else {
      console.warn('Firebase messaging is not supported in this browser');
    }
  }).catch((error) => {
    console.warn('Firebase messaging check failed:', error);
  });
} else {
  console.warn('Firebase app not initialized. Messaging unavailable.');
}

// Your VAPID key (get this from Firebase Console)
const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;

export { messaging, vapidKey };

// Request notification permission and get token
export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.warn('Firebase messaging is not available');
    return null;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get registration token
      const token = await getToken(messaging, { vapidKey });
      console.log('FCM Registration Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  if (!messaging) {
    return Promise.reject('Firebase messaging is not available');
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      resolve(payload);
    });
  });
};

// Get current token
export const getCurrentToken = async () => {
  if (!messaging) {
    console.warn('Firebase messaging is not available');
    return null;
  }

  try {
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (error) {
    console.error('Error getting current token:', error);
    return null;
  }
};

export default app;