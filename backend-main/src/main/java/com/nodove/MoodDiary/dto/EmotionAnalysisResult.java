package com.nodove.MoodDiary.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class EmotionAnalysisResult {
    private Double emotionScore;
    private String dominantEmotion;
    private Double confidence;
    private Map<String, Double> emotionBreakdown;
    private Double financialEmotionScore;
    private Boolean aiEnhanced;
    private String analysisDetails;
    private List<String> emotionalTriggers;
}