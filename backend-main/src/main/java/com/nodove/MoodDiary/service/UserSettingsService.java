package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.dto.UserSettingsRequest;
import com.nodove.MoodDiary.dto.UserSettingsResponse;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.entity.UserSettings;
import com.nodove.MoodDiary.repository.UserRepository;
import com.nodove.MoodDiary.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserSettingsService {
    
    private final UserSettingsRepository userSettingsRepository;
    private final UserRepository userRepository;
    
    public UserSettingsResponse getUserSettings(Long userId) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자 설정을 찾을 수 없습니다"));
        
        return new UserSettingsResponse(
                settings.getId(),
                settings.getNotificationEnabled(),
                settings.getDailyReminderTime(),
                settings.getTargetEntriesPerWeek(),
                settings.getPrivacyMode()
        );
    }
    
    public UserSettingsResponse updateUserSettings(Long userId, UserSettingsRequest request) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자 설정을 찾을 수 없습니다"));
        
        if (request.notificationEnabled() != null) {
            settings.setNotificationEnabled(request.notificationEnabled());
        }
        if (request.dailyReminderTime() != null) {
            settings.setDailyReminderTime(request.dailyReminderTime());
        }
        if (request.targetEntriesPerWeek() != null) {
            settings.setTargetEntriesPerWeek(request.targetEntriesPerWeek());
        }
        if (request.privacyMode() != null) {
            settings.setPrivacyMode(request.privacyMode());
        }
        
        UserSettings updatedSettings = userSettingsRepository.save(settings);
        
        return new UserSettingsResponse(
                updatedSettings.getId(),
                updatedSettings.getNotificationEnabled(),
                updatedSettings.getDailyReminderTime(),
                updatedSettings.getTargetEntriesPerWeek(),
                updatedSettings.getPrivacyMode()
        );
    }
}