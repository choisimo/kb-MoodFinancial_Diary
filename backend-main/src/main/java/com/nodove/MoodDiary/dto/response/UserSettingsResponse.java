package com.nodove.MoodDiary.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsResponse {
    
    private Long id;
    private Long userId;
    
    // 기본 설정
    private String language;
    private String timezone;
    private String currency;
    
    // 알림 설정
    private Boolean notificationEnabled;
    private LocalTime dailyReminderTime;
    private Boolean weeklyReportEnabled;
    private Boolean monthlyReportEnabled;
    private Boolean expenseAlertEnabled;
    private BigDecimal dailyExpenseLimit;
    private BigDecimal monthlyExpenseLimit;
    
    // 개인화 설정
    private Integer targetEntriesPerWeek;
    private Boolean showMoodStats;
    private Boolean showExpenseAnalysis;
    private Boolean showCorrelationInsights;
    
    // 프라이버시 설정
    private Boolean privacyMode;
    private Boolean dataProcessingConsent;
    private Boolean marketingConsent;
    private Boolean analyticsConsent;
    
    // 목표 설정
    private String savingGoal;
    private BigDecimal targetSavingAmount;
    private LocalDateTime targetSavingDate;
    
    // 테마 설정
    private String theme;
    private String primaryColor;
    
    // 온보딩 상태
    private Boolean onboardingCompleted;
    private LocalDateTime onboardingCompletedAt;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}