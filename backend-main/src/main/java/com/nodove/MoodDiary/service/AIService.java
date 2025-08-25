package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.dto.EmotionAnalysisResult;
import com.nodove.MoodDiary.dto.FinancialCorrelationResult;
import com.nodove.MoodDiary.dto.PersonalizedRecommendation;
import com.nodove.MoodDiary.entity.MoodDiary;
import com.nodove.MoodDiary.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class AIService {
    
    private static final Logger logger = LoggerFactory.getLogger(AIService.class);
    
    @Autowired
    private EmotionAnalysisService emotionAnalysisService;
    
    @Autowired
    private FinancialCorrelationService financialCorrelationService;
    
    @Autowired
    private RecommendationService recommendationService;
    
    @Autowired
    private OpenAIService openAIService;

    public CompletableFuture<EmotionAnalysisResult> analyzeEmotion(String diaryText) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Starting emotion analysis for diary text");
                
                EmotionAnalysisResult result = emotionAnalysisService.analyzeSentiment(diaryText);
                
                EmotionAnalysisResult enhancedResult = openAIService.enhanceEmotionAnalysis(diaryText, result);
                
                logger.info("Emotion analysis completed with score: {}", enhancedResult.getEmotionScore());
                return enhancedResult;
                
            } catch (Exception e) {
                logger.error("Error during emotion analysis", e);
                return EmotionAnalysisResult.builder()
                        .emotionScore(0.0)
                        .dominantEmotion("NEUTRAL")
                        .confidence(0.0)
                        .aiEnhanced(false)
                        .build();
            }
        });
    }

    public CompletableFuture<FinancialCorrelationResult> analyzeFinancialCorrelation(User user, MoodDiary diary) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Starting financial correlation analysis for user: {}", user.getId());
                
                return financialCorrelationService.analyzeCorrelation(user, diary);
                
            } catch (Exception e) {
                logger.error("Error during financial correlation analysis", e);
                return FinancialCorrelationResult.builder()
                        .correlationScore(0.0)
                        .spendingTrend("NEUTRAL")
                        .emotionImpact(0.0)
                        .build();
            }
        });
    }

    public CompletableFuture<List<PersonalizedRecommendation>> generateRecommendations(User user, EmotionAnalysisResult emotionResult, FinancialCorrelationResult financialResult) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Generating personalized recommendations for user: {}", user.getId());
                
                return recommendationService.generateRecommendations(user, emotionResult, financialResult);
                
            } catch (Exception e) {
                logger.error("Error generating recommendations", e);
                return List.of();
            }
        });
    }

    public CompletableFuture<Void> processComprehensiveAnalysis(User user, MoodDiary diary) {
        return analyzeEmotion(diary.getContent())
                .thenCompose(emotionResult -> {
                    diary.setEmotionScore(emotionResult.getEmotionScore());
                    diary.setDominantEmotion(emotionResult.getDominantEmotion());
                    
                    return analyzeFinancialCorrelation(user, diary);
                })
                .thenCompose(financialResult -> {
                    return generateRecommendations(user, 
                        EmotionAnalysisResult.builder()
                            .emotionScore(diary.getEmotionScore())
                            .dominantEmotion(diary.getDominantEmotion())
                            .build(), 
                        financialResult);
                })
                .thenAccept(recommendations -> {
                    logger.info("Comprehensive AI analysis completed for diary: {}", diary.getId());
                });
    }
}