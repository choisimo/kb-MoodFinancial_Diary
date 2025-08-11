package com.nodove.MoodDiary.dto.request;

import jakarta.validation.constraints.*;
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
public class UserSettingsUpdateRequest {
    
    // 기본 설정
    @Pattern(regexp = "^(ko|en)$", message = "지원되는 언어는 ko, en입니다")
    private String language;
    
    @Pattern(regexp = "^[A-Za-z_/]+$", message = "유효한 타임존을 입력해주세요")
    private String timezone;
    
    @Pattern(regexp = "^(KRW|USD|EUR)$", message = "지원되는 통화는 KRW, USD, EUR입니다")
    private String currency;
    
    // 알림 설정
    private Boolean notificationEnabled;
    
    private LocalTime dailyReminderTime;
    
    private Boolean weeklyReportEnabled;
    
    private Boolean monthlyReportEnabled;
    
    private Boolean expenseAlertEnabled;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "일일 지출 한도는 0보다 커야 합니다")
    @Digits(integer = 13, fraction = 2, message = "유효한 금액을 입력해주세요")
    private BigDecimal dailyExpenseLimit;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "월간 지출 한도는 0보다 커야 합니다")
    @Digits(integer = 13, fraction = 2, message = "유효한 금액을 입력해주세요")
    private BigDecimal monthlyExpenseLimit;
    
    // 개인화 설정
    @Min(value = 1, message = "주간 목표 작성 횟수는 1 이상이어야 합니다")
    @Max(value = 7, message = "주간 목표 작성 횟수는 7 이하여야 합니다")
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
    @Size(max = 500, message = "저축 목표는 500자 이하로 입력해주세요")
    private String savingGoal;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "목표 저축 금액은 0보다 커야 합니다")
    @Digits(integer = 13, fraction = 2, message = "유효한 금액을 입력해주세요")
    private BigDecimal targetSavingAmount;
    
    private LocalDateTime targetSavingDate;
    
    // 테마 설정
    @Pattern(regexp = "^(light|dark)$", message = "지원되는 테마는 light, dark입니다")
    private String theme;
    
    @Pattern(regexp = "^(blue|green|purple|red|orange)$", message = "지원되는 색상은 blue, green, purple, red, orange입니다")
    private String primaryColor;
}