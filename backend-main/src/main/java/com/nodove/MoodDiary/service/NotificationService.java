package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.dto.NotificationDTO;
import com.nodove.MoodDiary.dto.NotificationSettingsDTO;
import com.nodove.MoodDiary.entity.FCMToken;
import com.nodove.MoodDiary.entity.Notification;
import com.nodove.MoodDiary.entity.NotificationSettings;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.repository.FCMTokenRepository;
import com.nodove.MoodDiary.repository.NotificationRepository;
import com.nodove.MoodDiary.repository.NotificationSettingsRepository;
import com.nodove.MoodDiary.repository.UserRepository;
import com.nodove.MoodDiary.websocket.NotificationWebSocketHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationSettingsRepository notificationSettingsRepository;
    private final UserRepository userRepository;
    private final NotificationWebSocketHandler webSocketHandler;
    private final FCMTokenRepository fcmTokenRepository;
    private final Optional<FCMService> fcmService;
    
    public NotificationService(NotificationRepository notificationRepository,
                             NotificationSettingsRepository notificationSettingsRepository,
                             UserRepository userRepository,
                             NotificationWebSocketHandler webSocketHandler,
                             FCMTokenRepository fcmTokenRepository,
                             @Autowired(required = false) FCMService fcmService) {
        this.notificationRepository = notificationRepository;
        this.notificationSettingsRepository = notificationSettingsRepository;
        this.userRepository = userRepository;
        this.webSocketHandler = webSocketHandler;
        this.fcmTokenRepository = fcmTokenRepository;
        this.fcmService = Optional.ofNullable(fcmService);
    }
    
    // SSE 연결 관리
    private final Map<String, SseEmitter> sseEmitters = new ConcurrentHashMap<>();

    public void createNotification(String username, Notification.NotificationType type, 
                                 String title, String message, String actionUrl) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .actionUrl(actionUrl)
                .build();
        
        notification = notificationRepository.save(notification);
        
        // 실시간 알림 전송 (WebSocket & SSE & FCM)
        NotificationDTO dto = NotificationDTO.fromEntity(notification);
        webSocketHandler.sendNotificationToUser(username, dto);
        sendSseNotificationToUser(username, dto);
        sendFcmNotificationToUser(user, dto);
        
        log.info("Notification created and sent to user: {}", username);
    }

    public Page<NotificationDTO> getUserNotifications(String username, Pageable pageable) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Page<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return notifications.map(NotificationDTO::fromEntity);
    }

    public List<NotificationDTO> getUnreadNotifications(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Notification> notifications = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        return notifications.stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public void markAsRead(String username, Long notificationId) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        notificationRepository.markAsReadById(notificationId, user);
    }

    public void markAllAsRead(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        notificationRepository.markAllAsReadByUser(user);
    }

    public NotificationSettingsDTO getNotificationSettings(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        NotificationSettings settings = notificationSettingsRepository.findByUser(user)
                .orElse(createDefaultNotificationSettings(user));
        
        NotificationSettingsDTO dto = new NotificationSettingsDTO();
        dto.setDiaryReminderEnabled(settings.getDiaryReminderEnabled());
        dto.setDiaryReminderTime(settings.getDiaryReminderTime());
        dto.setMoodAnalysisEnabled(settings.getMoodAnalysisEnabled());
        dto.setFinancialInsightsEnabled(settings.getFinancialInsightsEnabled());
        dto.setAchievementNotificationsEnabled(settings.getAchievementNotificationsEnabled());
        dto.setPushNotificationsEnabled(settings.getPushNotificationsEnabled());
        dto.setEmailNotificationsEnabled(settings.getEmailNotificationsEnabled());
        
        return dto;
    }

    public void updateNotificationSettings(String username, NotificationSettingsDTO dto) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        NotificationSettings settings = notificationSettingsRepository.findByUser(user)
                .orElse(createDefaultNotificationSettings(user));
        
        settings.setDiaryReminderEnabled(dto.getDiaryReminderEnabled());
        settings.setDiaryReminderTime(dto.getDiaryReminderTime());
        settings.setMoodAnalysisEnabled(dto.getMoodAnalysisEnabled());
        settings.setFinancialInsightsEnabled(dto.getFinancialInsightsEnabled());
        settings.setAchievementNotificationsEnabled(dto.getAchievementNotificationsEnabled());
        settings.setPushNotificationsEnabled(dto.getPushNotificationsEnabled());
        settings.setEmailNotificationsEnabled(dto.getEmailNotificationsEnabled());
        
        notificationSettingsRepository.save(settings);
    }

    private NotificationSettings createDefaultNotificationSettings(User user) {
        NotificationSettings settings = NotificationSettings.builder()
                .user(user)
                .build();
        return notificationSettingsRepository.save(settings);
    }

    // 시스템 알림 메서드들
    public void sendDiaryReminder(String username) {
        createNotification(username, Notification.NotificationType.DIARY_REMINDER,
                "일기 작성 시간입니다", "오늘의 감정을 기록해보세요!", "/diary/new");
    }

    public void sendMoodAnalysis(String username, String analysis) {
        createNotification(username, Notification.NotificationType.MOOD_ANALYSIS,
                "감정 분석 결과", analysis, "/dashboard");
    }

    public void sendFinancialInsight(String username, String insight) {
        createNotification(username, Notification.NotificationType.FINANCIAL_INSIGHT,
                "금융 인사이트", insight, "/dashboard/financial");
    }

    public void sendAchievementNotification(String username, String achievement) {
        createNotification(username, Notification.NotificationType.ACHIEVEMENT,
                "목표 달성!", achievement, "/dashboard");
    }

    // SSE 관련 메서드들
    public SseEmitter createSseConnection(String username) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30분 타임아웃
        
        // 기존 연결이 있다면 제거
        SseEmitter oldEmitter = sseEmitters.put(username, emitter);
        if (oldEmitter != null) {
            oldEmitter.complete();
        }
        
        // 연결 종료 시 정리
        emitter.onCompletion(() -> {
            sseEmitters.remove(username);
            log.info("SSE connection completed for user: {}", username);
        });
        
        emitter.onTimeout(() -> {
            sseEmitters.remove(username);
            log.info("SSE connection timeout for user: {}", username);
        });
        
        emitter.onError((ex) -> {
            sseEmitters.remove(username);
            log.error("SSE connection error for user: {}", username, ex);
        });
        
        try {
            // 연결 확인 메시지 전송
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("SSE connection established"));
            log.info("SSE connection established for user: {}", username);
        } catch (Exception e) {
            log.error("Error sending SSE connect message for user: {}", username, e);
            sseEmitters.remove(username);
            emitter.completeWithError(e);
        }
        
        return emitter;
    }
    
    private void sendSseNotificationToUser(String username, NotificationDTO notification) {
        SseEmitter emitter = sseEmitters.get(username);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(notification));
                log.info("SSE notification sent to user: {}", username);
            } catch (Exception e) {
                log.error("Error sending SSE notification to user: {}", username, e);
                sseEmitters.remove(username);
                emitter.completeWithError(e);
            }
        }
    }
    
    // FCM 관련 메서드들
    private void sendFcmNotificationToUser(User user, NotificationDTO notification) {
        try {
            if (fcmService.isPresent()) {
                List<String> activeTokens = fcmTokenRepository.findActiveTokensByUser(user);
                if (!activeTokens.isEmpty()) {
                    fcmService.get().sendNotificationToTokens(activeTokens, notification);
                    log.info("FCM notification sent to {} tokens for user: {}", activeTokens.size(), user.getEmail());
                }
            } else {
                log.debug("FCM service not available, skipping FCM notification for user: {}", user.getEmail());
            }
        } catch (Exception e) {
            log.error("Error sending FCM notification to user: {}", user.getEmail(), e);
        }
    }
    
    public void registerFcmToken(String username, String token, String deviceType, String browserInfo) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // 기존 토큰 확인
        FCMToken existingToken = fcmTokenRepository.findByUserAndToken(user, token).orElse(null);
        
        if (existingToken != null) {
            // 기존 토큰 업데이트
            existingToken.setDeviceType(deviceType);
            existingToken.setBrowserInfo(browserInfo);
            existingToken.setIsActive(true);
            existingToken.updateLastUsed();
            fcmTokenRepository.save(existingToken);
            log.info("FCM token updated for user: {}", username);
        } else {
            // 새 토큰 등록
            FCMToken fcmToken = FCMToken.builder()
                    .user(user)
                    .token(token)
                    .deviceType(deviceType)
                    .browserInfo(browserInfo)
                    .isActive(true)
                    .lastUsedAt(LocalDateTime.now())
                    .build();
            
            fcmTokenRepository.save(fcmToken);
            log.info("New FCM token registered for user: {}", username);
        }
    }
    
    public void unregisterFcmToken(String username, String token) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        fcmTokenRepository.deactivateToken(user, token);
        log.info("FCM token deactivated for user: {}", username);
    }
    
    public void unregisterAllFcmTokens(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        fcmTokenRepository.deactivateAllTokensByUser(user);
        log.info("All FCM tokens deactivated for user: {}", username);
    }
    
    public void sendTestFcmNotification(String username, String token) {
        if (fcmService.isPresent()) {
            fcmService.get().sendTestNotification(token);
            log.info("Test FCM notification sent to user: {}", username);
        } else {
            log.warn("FCM service not available, cannot send test notification for user: {}", username);
        }
    }
}