package com.nodove.MoodDiary.controller;

import com.nodove.MoodDiary.dto.EmotionAnalysisResult;
import com.nodove.MoodDiary.dto.FinancialCorrelationResult;
import com.nodove.MoodDiary.dto.PersonalizedRecommendation;
import com.nodove.MoodDiary.entity.MoodDiary;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.service.AIService;
import com.nodove.MoodDiary.service.MoodDiaryService;
import com.nodove.MoodDiary.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Service", description = "감정 분석 및 AI 기반 추천 서비스")
public class AIController {
    
    private static final Logger logger = LoggerFactory.getLogger(AIController.class);
    
    @Autowired
    private AIService aiService;
    
    @Autowired
    private MoodDiaryService moodDiaryService;
    
    @Autowired
    private AuthService authService;

    @PostMapping("/analyze-emotion")
    @Operation(summary = "감정 분석", description = "텍스트의 감정을 분석합니다")
    public CompletableFuture<ResponseEntity<EmotionAnalysisResult>> analyzeEmotion(
            @RequestBody Map<String, String> request) {
        
        String text = request.get("text");
        if (text == null || text.trim().isEmpty()) {
            return CompletableFuture.completedFuture(
                ResponseEntity.badRequest().build()
            );
        }
        
        logger.info("Analyzing emotion for text length: {}", text.length());
        
        return aiService.analyzeEmotion(text)
                .thenApply(ResponseEntity::ok)
                .exceptionally(ex -> {
                    logger.error("Error in emotion analysis", ex);
                    return ResponseEntity.internalServerError().build();
                });
    }

    @PostMapping("/analyze-financial-correlation/{diaryId}")
    @Operation(summary = "재정-감정 상관관계 분석", description = "다이어리와 재정 데이터의 상관관계를 분석합니다")
    public CompletableFuture<ResponseEntity<FinancialCorrelationResult>> analyzeFinancialCorrelation(
            @PathVariable Long diaryId,
            Authentication authentication) {
        
        try {
            User user = authService.getCurrentUser(authentication);
            MoodDiary diary = moodDiaryService.findById(diaryId);
            
            if (diary == null || !diary.getUser().equals(user)) {
                return CompletableFuture.completedFuture(
                    ResponseEntity.notFound().build()
                );
            }
            
            logger.info("Analyzing financial correlation for diary: {} and user: {}", diaryId, user.getId());
            
            return aiService.analyzeFinancialCorrelation(user, diary)
                    .thenApply(ResponseEntity::ok)
                    .exceptionally(ex -> {
                        logger.error("Error in financial correlation analysis", ex);
                        return ResponseEntity.internalServerError().build();
                    });
                    
        } catch (Exception e) {
            logger.error("Error accessing diary or user", e);
            return CompletableFuture.completedFuture(
                ResponseEntity.badRequest().build()
            );
        }
    }

    @GetMapping("/recommendations")
    @Operation(summary = "개인화된 추천", description = "사용자의 감정과 재정 상태를 기반으로 개인화된 추천을 제공합니다")
    public CompletableFuture<ResponseEntity<List<PersonalizedRecommendation>>> getRecommendations(
            Authentication authentication,
            @RequestParam(required = false) Long diaryId) {
        
        try {
            User user = authService.getCurrentUser(authentication);
            
            logger.info("Generating recommendations for user: {}", user.getId());
            
            if (diaryId != null) {
                MoodDiary diary = moodDiaryService.findById(diaryId);
                if (diary != null && diary.getUser().equals(user)) {
                    return generateRecommendationsForDiary(user, diary);
                }
            }
            
            return generateGeneralRecommendations(user);
            
        } catch (Exception e) {
            logger.error("Error generating recommendations", e);
            return CompletableFuture.completedFuture(
                ResponseEntity.internalServerError().build()
            );
        }
    }

    @PostMapping("/process-diary/{diaryId}")
    @Operation(summary = "다이어리 종합 AI 분석", description = "다이어리에 대한 종합적인 AI 분석을 수행합니다")
    public CompletableFuture<ResponseEntity<String>> processComprehensiveAnalysis(
            @PathVariable Long diaryId,
            Authentication authentication) {
        
        try {
            User user = authService.getCurrentUser(authentication);
            MoodDiary diary = moodDiaryService.findById(diaryId);
            
            if (diary == null || !diary.getUser().equals(user)) {
                return CompletableFuture.completedFuture(
                    ResponseEntity.notFound().build()
                );
            }
            
            logger.info("Starting comprehensive AI analysis for diary: {}", diaryId);
            
            return aiService.processComprehensiveAnalysis(user, diary)
                    .thenApply(result -> ResponseEntity.ok("분석이 완료되었습니다"))
                    .exceptionally(ex -> {
                        logger.error("Error in comprehensive analysis", ex);
                        return ResponseEntity.internalServerError()
                                .body("분석 중 오류가 발생했습니다");
                    });
                    
        } catch (Exception e) {
            logger.error("Error starting comprehensive analysis", e);
            return CompletableFuture.completedFuture(
                ResponseEntity.badRequest().body("잘못된 요청입니다")
            );
        }
    }

    @GetMapping("/health")
    @Operation(summary = "AI 서비스 상태 확인", description = "AI 서비스의 상태를 확인합니다")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = Map.of(
            "status", "UP",
            "aiService", "ACTIVE",
            "emotionAnalysis", "AVAILABLE",
            "financialCorrelation", "AVAILABLE",
            "recommendations", "AVAILABLE"
        );
        
        return ResponseEntity.ok(health);
    }

    private CompletableFuture<ResponseEntity<List<PersonalizedRecommendation>>> generateRecommendationsForDiary(User user, MoodDiary diary) {
        return aiService.analyzeEmotion(diary.getContent())
                .thenCompose(emotionResult -> {
                    return aiService.analyzeFinancialCorrelation(user, diary)
                            .thenCompose(financialResult -> {
                                return aiService.generateRecommendations(user, emotionResult, financialResult);
                            });
                })
                .thenApply(ResponseEntity::ok)
                .exceptionally(ex -> {
                    logger.error("Error generating diary-based recommendations", ex);
                    return ResponseEntity.internalServerError().build();
                });
    }

    private CompletableFuture<ResponseEntity<List<PersonalizedRecommendation>>> generateGeneralRecommendations(User user) {
        EmotionAnalysisResult defaultEmotionResult = EmotionAnalysisResult.builder()
                .emotionScore(0.0)
                .dominantEmotion("NEUTRAL")
                .confidence(0.0)
                .aiEnhanced(false)
                .build();
                
        FinancialCorrelationResult defaultFinancialResult = FinancialCorrelationResult.builder()
                .correlationScore(0.0)
                .spendingTrend("MODERATE")
                .emotionImpact(0.0)
                .riskLevel("LOW")
                .build();
        
        return aiService.generateRecommendations(user, defaultEmotionResult, defaultFinancialResult)
                .thenApply(ResponseEntity::ok)
                .exceptionally(ex -> {
                    logger.error("Error generating general recommendations", ex);
                    return ResponseEntity.internalServerError().build();
                });
    }
}