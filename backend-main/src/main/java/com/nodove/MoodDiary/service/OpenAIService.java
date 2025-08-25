package com.nodove.MoodDiary.service;

import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.completion.chat.ChatCompletionResult;
import com.theokanning.openai.service.OpenAiService;
import com.nodove.MoodDiary.dto.EmotionAnalysisResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.Duration;
import java.util.*;

@Service
public class OpenAIService {
    
    private static final Logger logger = LoggerFactory.getLogger(OpenAIService.class);
    
    @Value("${openai.api.key:}")
    private String openaiApiKey;
    
    @Value("${openai.model:gpt-3.5-turbo}")
    private String model;
    
    private OpenAiService openAiService;
    private ObjectMapper objectMapper = new ObjectMapper();

    private OpenAiService getOpenAiService() {
        if (openAiService == null && openaiApiKey != null && !openaiApiKey.isEmpty()) {
            openAiService = new OpenAiService(openaiApiKey, Duration.ofSeconds(30));
        }
        return openAiService;
    }

    public EmotionAnalysisResult enhanceEmotionAnalysis(String text, EmotionAnalysisResult basicResult) {
        if (getOpenAiService() == null) {
            logger.warn("OpenAI service not available - using basic analysis only");
            return basicResult;
        }
        
        try {
            String prompt = buildEmotionAnalysisPrompt(text, basicResult);
            
            ChatCompletionRequest chatRequest = ChatCompletionRequest.builder()
                    .model(model)
                    .messages(Arrays.asList(
                        new ChatMessage("system", "You are an expert emotion analyst specializing in Korean text and financial psychology."),
                        new ChatMessage("user", prompt)
                    ))
                    .temperature(0.3)
                    .maxTokens(500)
                    .build();

            ChatCompletionResult result = openAiService.createChatCompletion(chatRequest);
            
            if (result.getChoices() != null && !result.getChoices().isEmpty()) {
                String aiResponse = result.getChoices().get(0).getMessage().getContent();
                return parseAiEmotionResponse(aiResponse, basicResult);
            }
            
        } catch (Exception e) {
            logger.error("Error calling OpenAI API for emotion analysis", e);
        }
        
        return basicResult;
    }

    public List<String> generatePersonalizedRecommendations(String userProfile, double emotionScore, String financialContext) {
        if (getOpenAiService() == null) {
            return getDefaultRecommendations(emotionScore);
        }
        
        try {
            String prompt = buildRecommendationPrompt(userProfile, emotionScore, financialContext);
            
            ChatCompletionRequest chatRequest = ChatCompletionRequest.builder()
                    .model(model)
                    .messages(Arrays.asList(
                        new ChatMessage("system", "You are a personal financial wellness advisor specializing in emotional spending patterns."),
                        new ChatMessage("user", prompt)
                    ))
                    .temperature(0.7)
                    .maxTokens(800)
                    .build();

            ChatCompletionResult result = openAiService.createChatCompletion(chatRequest);
            
            if (result.getChoices() != null && !result.getChoices().isEmpty()) {
                String aiResponse = result.getChoices().get(0).getMessage().getContent();
                return parseRecommendations(aiResponse);
            }
            
        } catch (Exception e) {
            logger.error("Error generating AI recommendations", e);
        }
        
        return getDefaultRecommendations(emotionScore);
    }

    private String buildEmotionAnalysisPrompt(String text, EmotionAnalysisResult basicResult) {
        return String.format(
            "다음 한국어 텍스트의 감정을 분석해주세요:\n\n" +
            "텍스트: \"%s\"\n\n" +
            "기본 분석 결과:\n" +
            "- 감정 점수: %.2f\n" +
            "- 주요 감정: %s\n" +
            "- 신뢰도: %.2f\n\n" +
            "다음 JSON 형식으로 향상된 분석을 제공해주세요:\n" +
            "{\n" +
            "  \"enhancedEmotionScore\": number,\n" +
            "  \"enhancedDominantEmotion\": string,\n" +
            "  \"contextualInsights\": string,\n" +
            "  \"emotionalTriggers\": [string],\n" +
            "  \"improvementConfidence\": number\n" +
            "}",
            text, basicResult.getEmotionScore(), basicResult.getDominantEmotion(), basicResult.getConfidence()
        );
    }

    private String buildRecommendationPrompt(String userProfile, double emotionScore, String financialContext) {
        return String.format(
            "사용자의 감정 상태와 재정 상황을 바탕으로 개인화된 조언을 제공해주세요:\n\n" +
            "사용자 프로필: %s\n" +
            "현재 감정 점수: %.2f\n" +
            "재정 상황: %s\n\n" +
            "다음 카테고리별로 3-5개의 실용적인 조언을 한국어로 제공해주세요:\n" +
            "1. 감정 관리\n" +
            "2. 재정 관리\n" +
            "3. 라이프스타일 개선\n" +
            "4. 장기적 목표 설정\n\n" +
            "각 조언은 구체적이고 실행 가능해야 합니다.",
            userProfile, emotionScore, financialContext
        );
    }

    private EmotionAnalysisResult parseAiEmotionResponse(String aiResponse, EmotionAnalysisResult basicResult) {
        try {
            Map<String, Object> aiData = objectMapper.readValue(aiResponse, Map.class);
            
            return EmotionAnalysisResult.builder()
                    .emotionScore((Double) aiData.getOrDefault("enhancedEmotionScore", basicResult.getEmotionScore()))
                    .dominantEmotion((String) aiData.getOrDefault("enhancedDominantEmotion", basicResult.getDominantEmotion()))
                    .confidence(basicResult.getConfidence())
                    .emotionBreakdown(basicResult.getEmotionBreakdown())
                    .financialEmotionScore(basicResult.getFinancialEmotionScore())
                    .aiEnhanced(true)
                    .analysisDetails((String) aiData.getOrDefault("contextualInsights", basicResult.getAnalysisDetails()))
                    .emotionalTriggers((List<String>) aiData.getOrDefault("emotionalTriggers", new ArrayList<>()))
                    .build();
                    
        } catch (Exception e) {
            logger.error("Error parsing AI emotion response", e);
            return basicResult.toBuilder().aiEnhanced(false).build();
        }
    }

    private List<String> parseRecommendations(String aiResponse) {
        List<String> recommendations = new ArrayList<>();
        
        String[] lines = aiResponse.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && 
                (line.startsWith("-") || line.startsWith("•") || line.matches("\\d+\\..*"))) {
                String cleanLine = line.replaceAll("^[-•]\\s*|^\\d+\\.\\s*", "").trim();
                if (!cleanLine.isEmpty()) {
                    recommendations.add(cleanLine);
                }
            }
        }
        
        return recommendations.isEmpty() ? getDefaultRecommendations(0.0) : recommendations;
    }

    private List<String> getDefaultRecommendations(double emotionScore) {
        List<String> defaultRecommendations = new ArrayList<>();
        
        if (emotionScore > 1.0) {
            defaultRecommendations.addAll(Arrays.asList(
                "긍정적인 기분을 유지하면서 계획적인 소비를 해보세요",
                "기분 좋은 날이지만 충동구매는 피하고 예산을 확인해보세요",
                "좋은 감정을 기록해두고 나중에 힘든 날에 되돌아보세요"
            ));
        } else if (emotionScore < -1.0) {
            defaultRecommendations.addAll(Arrays.asList(
                "감정적인 소비보다는 건강한 활동을 찾아보세요",
                "스트레스 해소를 위한 무료 활동들을 시도해보세요",
                "가까운 사람들과 대화를 나누어보세요"
            ));
        } else {
            defaultRecommendations.addAll(Arrays.asList(
                "균형잡힌 소비 습관을 유지하세요",
                "정기적인 가계부 작성을 통해 재정 상태를 점검해보세요",
                "작은 목표부터 차근차근 달성해나가세요"
            ));
        }
        
        return defaultRecommendations;
    }
}