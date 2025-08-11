package com.nodove.MoodDiary.service;

import com.google.firebase.messaging.*;
import com.nodove.MoodDiary.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
@RequiredArgsConstructor
@Slf4j
public class FCMService {

    private final FirebaseMessaging firebaseMessaging;

    public void sendNotificationToToken(String token, NotificationDTO notification) {
        if (firebaseMessaging == null) {
            log.warn("Firebase messaging is not initialized, skipping FCM notification");
            return;
        }

        try {
            // 알림 메시지 데이터 구성
            Map<String, String> data = new HashMap<>();
            data.put("id", notification.getId().toString());
            data.put("type", notification.getType().toString());
            data.put("title", notification.getTitle());
            data.put("message", notification.getMessage());
            data.put("createdAt", notification.getCreatedAt().toString());
            if (notification.getActionUrl() != null) {
                data.put("actionUrl", notification.getActionUrl());
            }

            // FCM 메시지 구성
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(notification.getTitle())
                            .setBody(notification.getMessage())
                            .build())
                    .putAllData(data)
                    .setWebpushConfig(WebpushConfig.builder()
                            .setNotification(WebpushNotification.builder()
                                    .setTitle(notification.getTitle())
                                    .setBody(notification.getMessage())
                                    .setIcon("/favicon.svg")
                                    .setBadge("/favicon.svg")
                                    .build())
                            .putData("click_action", notification.getActionUrl() != null ? notification.getActionUrl() : "/")
                            .build())
                    .build();

            // 메시지 전송
            String response = firebaseMessaging.send(message);
            log.info("FCM message sent successfully to token {}: {}", token, response);

        } catch (FirebaseMessagingException e) {
            log.error("Failed to send FCM message to token {}: {}", token, e.getMessage(), e);
            
            // 토큰이 유효하지 않은 경우 처리
            if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED ||
                e.getMessagingErrorCode() == MessagingErrorCode.INVALID_ARGUMENT) {
                log.warn("Invalid FCM token detected: {}", token);
                // TODO: 데이터베이스에서 무효한 토큰 제거
            }
        } catch (Exception e) {
            log.error("Unexpected error sending FCM message to token {}: {}", token, e.getMessage(), e);
        }
    }

    public void sendNotificationToTokens(List<String> tokens, NotificationDTO notification) {
        if (firebaseMessaging == null || tokens == null || tokens.isEmpty()) {
            log.warn("Firebase messaging is not initialized or no tokens provided, skipping FCM notification");
            return;
        }

        try {
            // 알림 메시지 데이터 구성
            Map<String, String> data = new HashMap<>();
            data.put("id", notification.getId().toString());
            data.put("type", notification.getType().toString());
            data.put("title", notification.getTitle());
            data.put("message", notification.getMessage());
            data.put("createdAt", notification.getCreatedAt().toString());
            if (notification.getActionUrl() != null) {
                data.put("actionUrl", notification.getActionUrl());
            }

            // 멀티캐스트 메시지 구성
            MulticastMessage message = MulticastMessage.builder()
                    .addAllTokens(tokens)
                    .setNotification(Notification.builder()
                            .setTitle(notification.getTitle())
                            .setBody(notification.getMessage())
                            .build())
                    .putAllData(data)
                    .setWebpushConfig(WebpushConfig.builder()
                            .setNotification(WebpushNotification.builder()
                                    .setTitle(notification.getTitle())
                                    .setBody(notification.getMessage())
                                    .setIcon("/favicon.svg")
                                    .setBadge("/favicon.svg")
                                    .build())
                            .putData("click_action", notification.getActionUrl() != null ? notification.getActionUrl() : "/")
                            .build())
                    .build();

            // 멀티캐스트 메시지 전송
            BatchResponse response = firebaseMessaging.sendMulticast(message);
            log.info("FCM multicast message sent: {} successful, {} failed", 
                    response.getSuccessCount(), response.getFailureCount());

            // 실패한 토큰들 처리
            if (response.getFailureCount() > 0) {
                for (int i = 0; i < response.getResponses().size(); i++) {
                    SendResponse sendResponse = response.getResponses().get(i);
                    if (!sendResponse.isSuccessful()) {
                        String token = tokens.get(i);
                        FirebaseMessagingException exception = sendResponse.getException();
                        log.warn("Failed to send FCM message to token {}: {}", token, exception.getMessage());
                        
                        // 무효한 토큰 처리
                        if (exception.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED ||
                            exception.getMessagingErrorCode() == MessagingErrorCode.INVALID_ARGUMENT) {
                            log.warn("Invalid FCM token detected: {}", token);
                            // TODO: 데이터베이스에서 무효한 토큰 제거
                        }
                    }
                }
            }

        } catch (FirebaseMessagingException e) {
            log.error("Failed to send FCM multicast message: {}", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error sending FCM multicast message: {}", e.getMessage(), e);
        }
    }

    public void sendTestNotification(String token) {
        if (firebaseMessaging == null) {
            log.warn("Firebase messaging is not initialized, skipping test notification");
            return;
        }

        try {
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle("테스트 알림")
                            .setBody("FCM 연동이 성공적으로 구성되었습니다!")
                            .build())
                    .setWebpushConfig(WebpushConfig.builder()
                            .setNotification(WebpushNotification.builder()
                                    .setTitle("테스트 알림")
                                    .setBody("FCM 연동이 성공적으로 구성되었습니다!")
                                    .setIcon("/favicon.svg")
                                    .build())
                            .build())
                    .build();

            String response = firebaseMessaging.send(message);
            log.info("FCM test message sent successfully: {}", response);

        } catch (FirebaseMessagingException e) {
            log.error("Failed to send FCM test message: {}", e.getMessage(), e);
        }
    }
}