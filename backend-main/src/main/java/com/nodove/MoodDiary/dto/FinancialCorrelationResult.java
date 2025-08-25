package com.nodove.MoodDiary.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialCorrelationResult {
    private Double correlationScore;
    private String spendingTrend;
    private Double emotionImpact;
    private String riskLevel;
    private String analysisDetails;
}