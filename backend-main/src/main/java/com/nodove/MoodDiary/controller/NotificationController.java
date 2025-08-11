package com.nodove.MoodDiary.controller;

import com.nodove.MoodDiary.dto.NotificationDTO;
import com.nodove.MoodDiary.dto.NotificationSettingsDTO;
import com.nodove.MoodDiary.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationDTO> notifications = notificationService.getUserNotifications(
                authentication.getName(), pageable);
        
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(Authentication authentication) {
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(
                authentication.getName());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        long count = notificationService.getUnreadCount(authentication.getName());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(Authentication authentication, @PathVariable Long id) {
        notificationService.markAsRead(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/settings")
    public ResponseEntity<NotificationSettingsDTO> getNotificationSettings(Authentication authentication) {
        NotificationSettingsDTO settings = notificationService.getNotificationSettings(
                authentication.getName());
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    public ResponseEntity<Void> updateNotificationSettings(
            Authentication authentication,
            @RequestBody NotificationSettingsDTO dto) {
        
        notificationService.updateNotificationSettings(authentication.getName(), dto);
        return ResponseEntity.ok().build();
    }

    // SSE 스트림 연결
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(
            Authentication authentication,
            @RequestParam(value = "token", required = false) String token) {
        
        // 인증 확인 (토큰이 제공된 경우 추가 검증 가능)
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Authentication required for SSE connection");
        }
        
        return notificationService.createSseConnection(authentication.getName());
    }

    // 테스트용 엔드포인트
    @PostMapping("/test")
    public ResponseEntity<Void> sendTestNotification(Authentication authentication) {
        notificationService.createNotification(
                authentication.getName(),
                com.nodove.MoodDiary.entity.Notification.NotificationType.SYSTEM,
                "테스트 알림",
                "이것은 테스트 알림입니다.",
                null
        );
        return ResponseEntity.ok().build();
    }

    // FCM 토큰 관리 엔드포인트
    @PostMapping("/fcm/register")
    public ResponseEntity<Void> registerFcmToken(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        
        String token = request.get("token");
        String deviceType = request.getOrDefault("deviceType", "web");
        String browserInfo = request.get("browserInfo");
        
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        notificationService.registerFcmToken(authentication.getName(), token, deviceType, browserInfo);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/fcm/unregister")
    public ResponseEntity<Void> unregisterFcmToken(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        
        String token = request.get("token");
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        notificationService.unregisterFcmToken(authentication.getName(), token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/fcm/test")
    public ResponseEntity<Void> sendTestFcmNotification(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        
        String token = request.get("token");
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        notificationService.sendTestFcmNotification(authentication.getName(), token);
        return ResponseEntity.ok().build();
    }
}