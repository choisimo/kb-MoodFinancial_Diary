package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.dto.UserSettingsRequest;
import com.nodove.MoodDiary.dto.UserSettingsResponse;
import com.nodove.MoodDiary.dto.request.OnboardingRequest;
import com.nodove.MoodDiary.dto.request.UserSettingsUpdateRequest;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.entity.UserSettings;
import com.nodove.MoodDiary.exception.ResourceNotFoundException;
import com.nodove.MoodDiary.repository.UserRepository;
import com.nodove.MoodDiary.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserSettingsService {
    
    private final UserSettingsRepository userSettingsRepository;
    private final UserRepository userRepository;
    
    // 기존 메서드 유지
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
    
    // 새로운 메서드들 추가
    
    /**
     * 확장된 사용자 설정 조회
     */
    @Transactional(readOnly = true)
    public com.nodove.MoodDiary.dto.response.UserSettingsResponse getExtendedUserSettings(Long userId) {
        UserSettings settings = getUserSettingsEntity(userId);
        return convertToExtendedResponse(settings);
    }
    
    /**
     * 확장된 사용자 설정 업데이트
     */
    public com.nodove.MoodDiary.dto.response.UserSettingsResponse updateExtendedUserSettings(Long userId, UserSettingsUpdateRequest request) {
        UserSettings settings = getUserSettingsEntity(userId);
        updateSettingsFromRequest(settings, request);
        
        UserSettings savedSettings = userSettingsRepository.save(settings);
        log.info("사용자 설정 업데이트 완료: userId={}", userId);
        
        return convertToExtendedResponse(savedSettings);
    }
    
    /**
     * 온보딩 설정
     */
    public com.nodove.MoodDiary.dto.response.UserSettingsResponse completeOnboarding(Long userId, OnboardingRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        
        // 닉네임 업데이트
        user.setNickname(request.getNickname());
        userRepository.save(user);
        
        // 설정 생성 또는 업데이트
        UserSettings settings = userSettingsRepository.findByUserId(userId)
            .orElse(UserSettings.builder()
                .user(user)
                .build());
        
        // 온보딩 정보로 설정 업데이트
        updateSettingsFromOnboarding(settings, request);
        settings.completeOnboarding();
        
        UserSettings savedSettings = userSettingsRepository.save(settings);
        log.info("온보딩 완료: userId={}, nickname={}", userId, request.getNickname());
        
        return convertToExtendedResponse(savedSettings);
    }
    
    /**
     * 기본 설정 생성
     */
    public com.nodove.MoodDiary.dto.response.UserSettingsResponse createDefaultSettings(User user) {
        UserSettings settings = UserSettings.builder()
            .user(user)
            .build();
        
        UserSettings savedSettings = userSettingsRepository.save(settings);
        log.info("기본 설정 생성 완료: userId={}", user.getId());
        
        return convertToExtendedResponse(savedSettings);
    }
    
    /**
     * 온보딩 상태 확인
     */
    @Transactional(readOnly = true)
    public boolean isOnboardingCompleted(Long userId) {
        return userSettingsRepository.findByUserId(userId)
            .map(UserSettings::getOnboardingCompleted)
            .orElse(false);
    }
    
    /**
     * 설정 초기화
     */
    public com.nodove.MoodDiary.dto.response.UserSettingsResponse resetSettings(Long userId) {
        UserSettings settings = getUserSettingsEntity(userId);
        
        // 기본값으로 초기화 (온보딩 상태는 유지)
        boolean onboardingCompleted = settings.getOnboardingCompleted();
        var onboardingCompletedAt = settings.getOnboardingCompletedAt();
        
        UserSettings newSettings = UserSettings.builder()
            .user(settings.getUser())
            .onboardingCompleted(onboardingCompleted)
            .onboardingCompletedAt(onboardingCompletedAt)
            .build();
        
        newSettings.setId(settings.getId());
        UserSettings savedSettings = userSettingsRepository.save(newSettings);
        
        log.info("사용자 설정 초기화 완료: userId={}", userId);
        return convertToExtendedResponse(savedSettings);
    }
    
    private UserSettings getUserSettingsEntity(Long userId) {
        return userSettingsRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("사용자 설정을 찾을 수 없습니다: " + userId));
    }
    
    private void updateSettingsFromRequest(UserSettings settings, UserSettingsUpdateRequest request) {
        Optional.ofNullable(request.getLanguage()).ifPresent(settings::setLanguage);
        Optional.ofNullable(request.getTimezone()).ifPresent(settings::setTimezone);
        Optional.ofNullable(request.getCurrency()).ifPresent(settings::setCurrency);
        
        Optional.ofNullable(request.getNotificationEnabled()).ifPresent(settings::setNotificationEnabled);
        Optional.ofNullable(request.getDailyReminderTime()).ifPresent(settings::setDailyReminderTime);
        Optional.ofNullable(request.getWeeklyReportEnabled()).ifPresent(settings::setWeeklyReportEnabled);
        Optional.ofNullable(request.getMonthlyReportEnabled()).ifPresent(settings::setMonthlyReportEnabled);
        Optional.ofNullable(request.getExpenseAlertEnabled()).ifPresent(settings::setExpenseAlertEnabled);
        Optional.ofNullable(request.getDailyExpenseLimit()).ifPresent(settings::setDailyExpenseLimit);
        Optional.ofNullable(request.getMonthlyExpenseLimit()).ifPresent(settings::setMonthlyExpenseLimit);
        
        Optional.ofNullable(request.getTargetEntriesPerWeek()).ifPresent(settings::setTargetEntriesPerWeek);
        Optional.ofNullable(request.getShowMoodStats()).ifPresent(settings::setShowMoodStats);
        Optional.ofNullable(request.getShowExpenseAnalysis()).ifPresent(settings::setShowExpenseAnalysis);
        Optional.ofNullable(request.getShowCorrelationInsights()).ifPresent(settings::setShowCorrelationInsights);
        
        Optional.ofNullable(request.getPrivacyMode()).ifPresent(settings::setPrivacyMode);
        Optional.ofNullable(request.getDataProcessingConsent()).ifPresent(settings::setDataProcessingConsent);
        Optional.ofNullable(request.getMarketingConsent()).ifPresent(settings::setMarketingConsent);
        Optional.ofNullable(request.getAnalyticsConsent()).ifPresent(settings::setAnalyticsConsent);
        
        Optional.ofNullable(request.getSavingGoal()).ifPresent(settings::setSavingGoal);
        Optional.ofNullable(request.getTargetSavingAmount()).ifPresent(settings::setTargetSavingAmount);
        Optional.ofNullable(request.getTargetSavingDate()).ifPresent(settings::setTargetSavingDate);
        
        Optional.ofNullable(request.getTheme()).ifPresent(settings::setTheme);
        Optional.ofNullable(request.getPrimaryColor()).ifPresent(settings::setPrimaryColor);
    }
    
    private void updateSettingsFromOnboarding(UserSettings settings, OnboardingRequest request) {
        settings.setLanguage(request.getLanguage());
        settings.setCurrency(request.getCurrency());
        settings.setNotificationEnabled(request.getNotificationEnabled());
        settings.setDailyReminderTime(request.getDailyReminderTime());
        settings.setWeeklyReportEnabled(request.getWeeklyReportEnabled());
        settings.setMonthlyReportEnabled(request.getMonthlyReportEnabled());
        settings.setExpenseAlertEnabled(request.getExpenseAlertEnabled());
        settings.setTargetEntriesPerWeek(request.getTargetEntriesPerWeek());
        
        Optional.ofNullable(request.getSavingGoal()).ifPresent(settings::setSavingGoal);
        Optional.ofNullable(request.getTargetSavingAmount()).ifPresent(settings::setTargetSavingAmount);
        Optional.ofNullable(request.getTargetSavingDate()).ifPresent(settings::setTargetSavingDate);
        Optional.ofNullable(request.getMonthlyExpenseLimit()).ifPresent(settings::setMonthlyExpenseLimit);
        
        settings.setTheme(request.getTheme());
        settings.setPrimaryColor(request.getPrimaryColor());
        
        settings.setDataProcessingConsent(request.getDataProcessingConsent());
        settings.setMarketingConsent(request.getMarketingConsent());
        settings.setAnalyticsConsent(request.getAnalyticsConsent());
    }
    
    private com.nodove.MoodDiary.dto.response.UserSettingsResponse convertToExtendedResponse(UserSettings settings) {
        return com.nodove.MoodDiary.dto.response.UserSettingsResponse.builder()
            .id(settings.getId())
            .userId(settings.getUser().getId())
            .language(settings.getLanguage())
            .timezone(settings.getTimezone())
            .currency(settings.getCurrency())
            .notificationEnabled(settings.getNotificationEnabled())
            .dailyReminderTime(settings.getDailyReminderTime())
            .weeklyReportEnabled(settings.getWeeklyReportEnabled())
            .monthlyReportEnabled(settings.getMonthlyReportEnabled())
            .expenseAlertEnabled(settings.getExpenseAlertEnabled())
            .dailyExpenseLimit(settings.getDailyExpenseLimit())
            .monthlyExpenseLimit(settings.getMonthlyExpenseLimit())
            .targetEntriesPerWeek(settings.getTargetEntriesPerWeek())
            .showMoodStats(settings.getShowMoodStats())
            .showExpenseAnalysis(settings.getShowExpenseAnalysis())
            .showCorrelationInsights(settings.getShowCorrelationInsights())
            .privacyMode(settings.getPrivacyMode())
            .dataProcessingConsent(settings.getDataProcessingConsent())
            .marketingConsent(settings.getMarketingConsent())
            .analyticsConsent(settings.getAnalyticsConsent())
            .savingGoal(settings.getSavingGoal())
            .targetSavingAmount(settings.getTargetSavingAmount())
            .targetSavingDate(settings.getTargetSavingDate())
            .theme(settings.getTheme())
            .primaryColor(settings.getPrimaryColor())
            .onboardingCompleted(settings.getOnboardingCompleted())
            .onboardingCompletedAt(settings.getOnboardingCompletedAt())
            .createdAt(settings.getCreatedAt())
            .updatedAt(settings.getUpdatedAt())
            .build();
    }
}