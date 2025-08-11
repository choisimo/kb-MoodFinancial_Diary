package com.nodove.MoodDiary.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "user_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UserSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // 기본 설정
    @Column(length = 10)
    @Builder.Default
    private String language = "ko";
    
    @Column(length = 50)
    @Builder.Default
    private String timezone = "Asia/Seoul";
    
    @Column(length = 10)
    @Builder.Default
    private String currency = "KRW";
    
    // 알림 설정
    @Builder.Default
    @Column(nullable = false)
    private Boolean notificationEnabled = true;
    
    @Builder.Default
    @Column(nullable = false)
    private LocalTime dailyReminderTime = LocalTime.of(21, 0);
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean weeklyReportEnabled = true;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean monthlyReportEnabled = true;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean expenseAlertEnabled = true;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal dailyExpenseLimit;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal monthlyExpenseLimit;
    
    // 개인화 설정
    @Builder.Default
    @Column(nullable = false)
    private Integer targetEntriesPerWeek = 5;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean showMoodStats = true;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean showExpenseAnalysis = true;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean showCorrelationInsights = true;
    
    // 프라이버시 설정
    @Builder.Default
    @Column(nullable = false)
    private Boolean privacyMode = false;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean dataProcessingConsent = false;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean marketingConsent = false;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean analyticsConsent = false;
    
    // 목표 설정
    @Column(length = 500)
    private String savingGoal;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal targetSavingAmount;
    
    @Column
    private LocalDateTime targetSavingDate;
    
    // 테마 설정
    @Column(length = 20)
    @Builder.Default
    private String theme = "light";
    
    @Column(length = 50)
    @Builder.Default
    private String primaryColor = "blue";
    
    // 온보딩 상태
    @Builder.Default
    @Column(nullable = false)
    private Boolean onboardingCompleted = false;
    
    @Column
    private LocalDateTime onboardingCompletedAt;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Helper methods
    public void completeOnboarding() {
        this.onboardingCompleted = true;
        this.onboardingCompletedAt = LocalDateTime.now();
    }
    
    public boolean hasExpenseLimit() {
        return dailyExpenseLimit != null || monthlyExpenseLimit != null;
    }
    
    public boolean hasNotificationsEnabled() {
        return notificationEnabled || weeklyReportEnabled || monthlyReportEnabled || expenseAlertEnabled;
    }
}