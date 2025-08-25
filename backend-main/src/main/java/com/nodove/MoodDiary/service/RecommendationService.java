package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.dto.EmotionAnalysisResult;
import com.nodove.MoodDiary.dto.FinancialCorrelationResult;
import com.nodove.MoodDiary.dto.PersonalizedRecommendation;
import com.nodove.MoodDiary.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;

@Service
public class RecommendationService {
    
    private static final Logger logger = LoggerFactory.getLogger(RecommendationService.class);
    
    @Autowired
    private OpenAIService openAIService;

    public List<PersonalizedRecommendation> generateRecommendations(User user, EmotionAnalysisResult emotionResult, FinancialCorrelationResult financialResult) {
        try {
            logger.debug("Generating recommendations for user: {}", user.getId());
            
            List<PersonalizedRecommendation> recommendations = new ArrayList<>();
            
            // Add emotion-based recommendations
            recommendations.addAll(generateEmotionBasedRecommendations(emotionResult));
            
            // Add financial-based recommendations
            recommendations.addAll(generateFinancialRecommendations(financialResult));
            
            // Add AI-enhanced recommendations if available
            if (openAIService != null) {
                List<String> aiRecommendations = openAIService.generatePersonalizedRecommendations(
                    buildUserProfile(user),
                    emotionResult.getEmotionScore(),
                    financialResult.getSpendingTrend()
                );
                recommendations.addAll(convertToPersonalizedRecommendations(aiRecommendations, true));
            }
            
            // Sort by priority and return top recommendations
            return recommendations.stream()
                    .sorted(Comparator.comparing(PersonalizedRecommendation::getPriority).reversed())
                    .limit(8)
                    .toList();
                    
        } catch (Exception e) {
            logger.error("Error generating recommendations", e);
            return getDefaultRecommendations();
        }
    }

    private List<PersonalizedRecommendation> generateEmotionBasedRecommendations(EmotionAnalysisResult emotionResult) {
        List<PersonalizedRecommendation> recommendations = new ArrayList<>();
        
        double emotionScore = emotionResult.getEmotionScore();
        String dominantEmotion = emotionResult.getDominantEmotion();
        
        if (emotionScore < -1.5) {
            // Very negative emotions
            recommendations.addAll(Arrays.asList(
                PersonalizedRecommendation.builder()
                    .category("감정관리")
                    .title("스트레스 해소 활동")
                    .description("산책, 명상, 또는 좋아하는 음악 감상으로 기분을 전환해보세요")
                    .actionType("IMMEDIATE")
                    .priority(5)
                    .aiGenerated(false)
                    .build(),
                PersonalizedRecommendation.builder()
                    .category("재정관리")
                    .title("감정적 소비 방지")
                    .description("감정이 안 좋을 때는 24시간 후에 구매를 결정하는 규칙을 만들어보세요")
                    .actionType("PREVENTIVE")
                    .priority(4)
                    .aiGenerated(false)
                    .build()
            ));
        } else if (emotionScore > 1.5) {
            // Very positive emotions
            recommendations.add(
                PersonalizedRecommendation.builder()
                    .category("재정관리")
                    .title("계획적 소비")
                    .description("기분 좋은 날이지만 예산을 확인하고 계획적으로 소비해보세요")
                    .actionType("PLANNING")
                    .priority(3)
                    .aiGenerated(false)
                    .build()
            );
        }
        
        return recommendations;
    }

    private List<PersonalizedRecommendation> generateFinancialRecommendations(FinancialCorrelationResult financialResult) {
        List<PersonalizedRecommendation> recommendations = new ArrayList<>();
        
        String spendingTrend = financialResult.getSpendingTrend();
        String riskLevel = financialResult.getRiskLevel();
        
        switch (spendingTrend) {
            case "HIGH_SPENDING":
                recommendations.addAll(Arrays.asList(
                    PersonalizedRecommendation.builder()
                        .category("재정관리")
                        .title("지출 검토")
                        .description("최근 일주일간 높은 지출이 감지되었습니다. 가계부를 점검해보세요")
                        .actionType("REVIEW")
                        .priority(5)
                        .aiGenerated(false)
                        .build(),
                    PersonalizedRecommendation.builder()
                        .category("예산관리")
                        .title("예산 재조정")
                        .description("월 예산을 재검토하고 필요시 조정해보세요")
                        .actionType("PLANNING")
                        .priority(4)
                        .aiGenerated(false)
                        .build()
                ));
                break;
            case "MODERATE_SPENDING":
                recommendations.add(
                    PersonalizedRecommendation.builder()
                        .category("재정관리")
                        .title("균형 유지")
                        .description("적절한 소비 패턴을 유지하고 있습니다. 이대로 계속해보세요")
                        .actionType("MAINTAIN")
                        .priority(2)
                        .aiGenerated(false)
                        .build()
                );
                break;
            case "LOW_SPENDING":
                recommendations.add(
                    PersonalizedRecommendation.builder()
                        .category("라이프스타일")
                        .title("적절한 소비 고려")
                        .description("절약은 좋지만 필요한 것들은 적절히 소비하는 것도 중요합니다")
                        .actionType("BALANCE")
                        .priority(2)
                        .aiGenerated(false)
                        .build()
                );
                break;
        }
        
        if ("HIGH".equals(riskLevel)) {
            recommendations.add(
                PersonalizedRecommendation.builder()
                    .category("위험관리")
                    .title("감정적 소비 주의")
                    .description("감정과 소비 패턴 간의 높은 상관관계가 감지되었습니다. 특별한 주의가 필요합니다")
                    .actionType("ALERT")
                    .priority(5)
                    .aiGenerated(false)
                    .build()
            );
        }
        
        return recommendations;
    }
    
    private String buildUserProfile(User user) {
        return String.format("사용자 ID: %d, 이름: %s", user.getId(), user.getName());
    }
    
    private List<PersonalizedRecommendation> convertToPersonalizedRecommendations(List<String> aiRecommendations, boolean aiGenerated) {
        List<PersonalizedRecommendation> recommendations = new ArrayList<>();
        
        for (int i = 0; i < aiRecommendations.size() && i < 4; i++) {
            String recommendation = aiRecommendations.get(i);
            recommendations.add(
                PersonalizedRecommendation.builder()
                    .category("AI추천")
                    .title("개인화된 조언")
                    .description(recommendation)
                    .actionType("SUGGESTION")
                    .priority(3)
                    .aiGenerated(aiGenerated)
                    .build()
            );
        }
        
        return recommendations;
    }

    private List<PersonalizedRecommendation> getDefaultRecommendations() {
        return Arrays.asList(
            PersonalizedRecommendation.builder()
                .category("재정관리")
                .title("가계부 작성")
                .description("정기적인 가계부 작성으로 재정 상태를 파악해보세요")
                .actionType("HABIT")
                .priority(3)
                .aiGenerated(false)
                .build(),
            PersonalizedRecommendation.builder()
                .category("감정관리")
                .title("일기 작성")
                .description("하루의 감정을 기록하여 패턴을 파악해보세요")
                .actionType("HABIT")
                .priority(3)
                .aiGenerated(false)
                .build()
        );
    }
}