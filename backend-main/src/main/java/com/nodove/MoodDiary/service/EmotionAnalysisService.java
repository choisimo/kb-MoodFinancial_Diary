package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.dto.EmotionAnalysisResult;
import org.apache.commons.math3.stat.StatUtils;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class EmotionAnalysisService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmotionAnalysisService.class);
    
    private static final Map<String, Double> POSITIVE_WORDS = Map.of(
        "행복", 2.0, "기쁘", 2.0, "좋", 1.5, "만족", 1.5, "즐거", 2.0,
        "사랑", 1.8, "감사", 1.7, "평화", 1.5, "희망", 1.8, "성공", 1.9,
        "완벽", 1.6, "훌륭", 1.7, "멋지", 1.5, "대단", 1.6, "최고", 2.0
    );
    
    private static final Map<String, Double> NEGATIVE_WORDS = Map.of(
        "슬프", -2.0, "우울", -2.5, "화나", -2.3, "짜증", -1.8, "스트레스", -2.0,
        "불안", -2.2, "걱정", -1.7, "힘들", -1.9, "피곤", -1.5, "실망", -1.8,
        "후회", -1.9, "절망", -2.8, "분노", -2.5, "미워", -2.1, "싫어", -1.6
    );
    
    private static final Map<String, Double> FINANCIAL_EMOTION_WORDS = Map.of(
        "돈", 0.0, "비싸", -1.2, "싸", 0.8, "할인", 1.0, "세일", 1.2,
        "투자", 0.5, "저축", 1.0, "빚", -2.0, "대출", -1.5, "카드", -0.5,
        "쇼핑", 0.3, "구매", 0.0, "지출", -0.8, "수입", 1.2, "월급", 0.8
    );

    public EmotionAnalysisResult analyzeSentiment(String text) {
        try {
            logger.debug("Analyzing sentiment for text length: {}", text.length());
            
            double emotionScore = calculateEmotionScore(text);
            String dominantEmotion = determineDominantEmotion(text, emotionScore);
            double confidence = calculateConfidence(text);
            Map<String, Double> emotionBreakdown = getEmotionBreakdown(text);
            
            return EmotionAnalysisResult.builder()
                    .emotionScore(emotionScore)
                    .dominantEmotion(dominantEmotion)
                    .confidence(confidence)
                    .emotionBreakdown(emotionBreakdown)
                    .financialEmotionScore(calculateFinancialEmotionScore(text))
                    .aiEnhanced(false)
                    .analysisDetails(generateAnalysisDetails(text, emotionScore))
                    .build();
                    
        } catch (Exception e) {
            logger.error("Error in sentiment analysis", e);
            return getDefaultEmotionResult();
        }
    }

    private double calculateEmotionScore(String text) {
        double totalScore = 0.0;
        int wordCount = 0;
        
        String[] words = text.split("\\s+");
        
        for (String word : words) {
            String cleanWord = word.replaceAll("[^가-힣a-zA-Z]", "");
            
            for (Map.Entry<String, Double> entry : POSITIVE_WORDS.entrySet()) {
                if (cleanWord.contains(entry.getKey())) {
                    totalScore += entry.getValue();
                    wordCount++;
                }
            }
            
            for (Map.Entry<String, Double> entry : NEGATIVE_WORDS.entrySet()) {
                if (cleanWord.contains(entry.getKey())) {
                    totalScore += entry.getValue();
                    wordCount++;
                }
            }
        }
        
        if (wordCount == 0) {
            return 0.0;
        }
        
        double normalizedScore = totalScore / Math.max(wordCount, 1);
        return Math.max(-3.0, Math.min(3.0, normalizedScore));
    }
    
    private double calculateFinancialEmotionScore(String text) {
        double totalScore = 0.0;
        int wordCount = 0;
        
        String[] words = text.split("\\s+");
        
        for (String word : words) {
            String cleanWord = word.replaceAll("[^가-힣a-zA-Z]", "");
            
            for (Map.Entry<String, Double> entry : FINANCIAL_EMOTION_WORDS.entrySet()) {
                if (cleanWord.contains(entry.getKey())) {
                    totalScore += entry.getValue();
                    wordCount++;
                }
            }
        }
        
        if (wordCount == 0) {
            return 0.0;
        }
        
        return totalScore / Math.max(wordCount, 1);
    }

    private String determineDominantEmotion(String text, double emotionScore) {
        if (emotionScore > 1.5) return "VERY_POSITIVE";
        if (emotionScore > 0.5) return "POSITIVE";
        if (emotionScore > -0.5) return "NEUTRAL";
        if (emotionScore > -1.5) return "NEGATIVE";
        return "VERY_NEGATIVE";
    }

    private double calculateConfidence(String text) {
        int emotionalWords = 0;
        String[] words = text.split("\\s+");
        
        for (String word : words) {
            String cleanWord = word.replaceAll("[^가-힣a-zA-Z]", "");
            
            if (POSITIVE_WORDS.keySet().stream().anyMatch(cleanWord::contains) ||
                NEGATIVE_WORDS.keySet().stream().anyMatch(cleanWord::contains)) {
                emotionalWords++;
            }
        }
        
        double confidence = (double) emotionalWords / Math.max(words.length, 1);
        return Math.min(1.0, confidence * 2.0);
    }

    private Map<String, Double> getEmotionBreakdown(String text) {
        Map<String, Double> breakdown = new HashMap<>();
        breakdown.put("joy", calculateEmotionTypeScore(text, Arrays.asList("행복", "기쁘", "즐거")));
        breakdown.put("sadness", Math.abs(calculateEmotionTypeScore(text, Arrays.asList("슬프", "우울", "절망"))));
        breakdown.put("anger", Math.abs(calculateEmotionTypeScore(text, Arrays.asList("화나", "분노", "짜증"))));
        breakdown.put("anxiety", Math.abs(calculateEmotionTypeScore(text, Arrays.asList("불안", "걱정", "스트레스"))));
        breakdown.put("satisfaction", calculateEmotionTypeScore(text, Arrays.asList("만족", "완벽", "성공")));
        
        return breakdown;
    }
    
    private double calculateEmotionTypeScore(String text, List<String> keywords) {
        return keywords.stream()
                .mapToDouble(keyword -> {
                    long count = Pattern.compile(keyword)
                            .matcher(text)
                            .results()
                            .count();
                    return count * (POSITIVE_WORDS.getOrDefault(keyword, 
                                   NEGATIVE_WORDS.getOrDefault(keyword, 0.0)));
                })
                .sum();
    }
    
    private String generateAnalysisDetails(String text, double emotionScore) {
        StringBuilder details = new StringBuilder();
        details.append("감정 분석 결과: ");
        
        if (emotionScore > 1.0) {
            details.append("매우 긍정적인 감정 상태가 감지되었습니다. ");
        } else if (emotionScore > 0.0) {
            details.append("긍정적인 감정 상태가 감지되었습니다. ");
        } else if (emotionScore < -1.0) {
            details.append("부정적인 감정 상태가 감지되었습니다. ");
        } else {
            details.append("중립적인 감정 상태입니다. ");
        }
        
        details.append(String.format("감정 점수: %.2f", emotionScore));
        
        return details.toString();
    }

    private EmotionAnalysisResult getDefaultEmotionResult() {
        return EmotionAnalysisResult.builder()
                .emotionScore(0.0)
                .dominantEmotion("NEUTRAL")
                .confidence(0.0)
                .emotionBreakdown(new HashMap<>())
                .financialEmotionScore(0.0)
                .aiEnhanced(false)
                .analysisDetails("분석 중 오류가 발생했습니다.")
                .build();
    }
}