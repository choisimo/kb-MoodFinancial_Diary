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
        
        return UserSettingsResponse.builder()
                .id(settings.getId())
                .notificationEnabled(settings.getNotificationEnabled())
                .dailyReminderTime(settings.getDailyReminderTime())
                .targetEntriesPerWeek(settings.getTargetEntriesPerWeek())
                .privacyMode(settings.getPrivacyMode())
                .build();
    }
    
    public UserSettingsResponse updateUserSettings(Long userId, UserSettingsRequest request) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자 설정을 찾을 수 없습니다"));
        
        if (request.getNotificationEnabled() != null) {
            settings.setNotificationEnabled(request.getNotificationEnabled());
        }
        if (request.getDailyReminderTime() != null) {
            settings.setDailyReminderTime(request.getDailyReminderTime());
        }
        if (request.getTargetEntriesPerWeek() != null) {
            settings.setTargetEntriesPerWeek(request.getTargetEntriesPerWeek());
        }
        if (request.getPrivacyMode() != null) {
            settings.setPrivacyMode(request.getPrivacyMode());
        }
        
        UserSettings updatedSettings = userSettingsRepository.save(settings);
        
        return UserSettingsResponse.builder()
                .id(updatedSettings.getId())
                .notificationEnabled(updatedSettings.getNotificationEnabled())
                .dailyReminderTime(updatedSettings.getDailyReminderTime())
                .targetEntriesPerWeek(updatedSettings.getTargetEntriesPerWeek())
                .privacyMode(updatedSettings.getPrivacyMode())
                .build();
    }
}