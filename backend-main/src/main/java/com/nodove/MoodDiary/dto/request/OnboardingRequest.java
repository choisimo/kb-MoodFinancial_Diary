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
public class OnboardingRequest {
    
    @NotBlank(message = "닉네임은 필수입니다")
    @Size(min = 2, max = 50, message = "닉네임은 2자 이상 50자 이하로 입력해주세요")
    private String nickname;
    
    // 기본 설정
    @Pattern(regexp = "^(ko|en)$", message = "지원되는 언어는 ko, en입니다")
    @Builder.Default
    private String language = "ko";
    
    @Pattern(regexp = "^(KRW|USD|EUR)$", message = "지원되는 통화는 KRW, USD, EUR입니다")
    @Builder.Default
    private String currency = "KRW";
    
    // 알림 설정
    @NotNull(message = "알림 설정은 필수입니다")
    @Builder.Default
    private Boolean notificationEnabled = true;
    
    @Builder.Default
    private LocalTime dailyReminderTime = LocalTime.of(21, 0);
    
    @Builder.Default
    private Boolean weeklyReportEnabled = true;
    
    @Builder.Default
    private Boolean monthlyReportEnabled = true;
    
    @Builder.Default
    private Boolean expenseAlertEnabled = true;
    
    // 목표 설정
    @Min(value = 1, message = "주간 목표 작성 횟수는 1 이상이어야 합니다")
    @Max(value = 7, message = "주간 목표 작성 횟수는 7 이하여야 합니다")
    @Builder.Default
    private Integer targetEntriesPerWeek = 5;
    
    @Size(max = 500, message = "저축 목표는 500자 이하로 입력해주세요")
    private String savingGoal;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "목표 저축 금액은 0보다 커야 합니다")
    @Digits(integer = 13, fraction = 2, message = "유효한 금액을 입력해주세요")
    private BigDecimal targetSavingAmount;
    
    private LocalDateTime targetSavingDate;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "월간 지출 한도는 0보다 커야 합니다")
    @Digits(integer = 13, fraction = 2, message = "유효한 금액을 입력해주세요")
    private BigDecimal monthlyExpenseLimit;
    
    // 테마 설정
    @Pattern(regexp = "^(light|dark)$", message = "지원되는 테마는 light, dark입니다")
    @Builder.Default
    private String theme = "light";
    
    @Pattern(regexp = "^(blue|green|purple|red|orange)$", message = "지원되는 색상은 blue, green, purple, red, orange입니다")
    @Builder.Default
    private String primaryColor = "blue";
    
    // 필수 동의
    @AssertTrue(message = "데이터 처리 동의는 필수입니다")
    private Boolean dataProcessingConsent;
    
    // 선택 동의
    @Builder.Default
    private Boolean marketingConsent = false;
    
    @Builder.Default
    private Boolean analyticsConsent = false;
}