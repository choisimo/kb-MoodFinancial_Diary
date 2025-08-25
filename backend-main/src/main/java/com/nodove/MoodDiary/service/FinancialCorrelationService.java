package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.dto.FinancialCorrelationResult;
import com.nodove.MoodDiary.entity.MoodDiary;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.entity.Transaction;
import com.nodove.MoodDiary.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.OptionalDouble;

@Service
public class FinancialCorrelationService {
    
    private static final Logger logger = LoggerFactory.getLogger(FinancialCorrelationService.class);
    
    @Autowired
    private TransactionRepository transactionRepository;

    public FinancialCorrelationResult analyzeCorrelation(User user, MoodDiary diary) {
        try {
            logger.debug("Analyzing financial correlation for user: {} and diary date: {}", 
                        user.getId(), diary.getDiaryDate());
            
            LocalDateTime startDate = diary.getDiaryDate().minusDays(7);
            LocalDateTime endDate = diary.getDiaryDate().plusDays(1);
            
            List<Transaction> recentTransactions = transactionRepository
                    .findByUserAndTransactionDateBetween(user, startDate, endDate);
            
            if (recentTransactions.isEmpty()) {
                return getDefaultCorrelationResult();
            }
            
            double correlationScore = calculateEmotionSpendingCorrelation(recentTransactions, diary);
            String spendingTrend = analyzeSpendingTrend(recentTransactions);
            double emotionImpact = calculateEmotionImpact(diary.getEmotionScore(), recentTransactions);
            String riskLevel = assessRiskLevel(correlationScore, emotionImpact);
            
            return FinancialCorrelationResult.builder()
                    .correlationScore(correlationScore)
                    .spendingTrend(spendingTrend)
                    .emotionImpact(emotionImpact)
                    .riskLevel(riskLevel)
                    .analysisDetails(generateAnalysisDetails(correlationScore, spendingTrend, emotionImpact))
                    .build();
                    
        } catch (Exception e) {
            logger.error("Error in financial correlation analysis", e);
            return getDefaultCorrelationResult();
        }
    }

    private double calculateEmotionSpendingCorrelation(List<Transaction> transactions, MoodDiary diary) {
        if (transactions.isEmpty()) return 0.0;
        
        OptionalDouble avgSpending = transactions.stream()
                .mapToDouble(t -> Math.abs(t.getAmount().doubleValue()))
                .average();
        
        if (!avgSpending.isPresent()) return 0.0;
        
        double spendingIntensity = avgSpending.getAsDouble() / 100000.0; // Normalize to 100k KRW
        double emotionIntensity = Math.abs(diary.getEmotionScore() != null ? diary.getEmotionScore() : 0.0);
        
        double correlation = Math.min(1.0, spendingIntensity * emotionIntensity * 0.5);
        
        if (diary.getEmotionScore() != null && diary.getEmotionScore() < -1.0) {
            correlation *= 1.3; // Negative emotions tend to correlate more with spending
        }
        
        return correlation;
    }
    
    private String analyzeSpendingTrend(List<Transaction> transactions) {
        if (transactions.size() < 2) return "INSUFFICIENT_DATA";
        
        double totalSpending = transactions.stream()
                .filter(t -> t.getAmount().doubleValue() < 0) // Negative amounts are expenses
                .mapToDouble(t -> Math.abs(t.getAmount().doubleValue()))
                .sum();
        
        double averageDailySpending = totalSpending / 7.0; // Weekly period
        
        if (averageDailySpending > 150000) return "HIGH_SPENDING";
        if (averageDailySpending > 80000) return "MODERATE_SPENDING";
        if (averageDailySpending > 30000) return "LOW_SPENDING";
        return "MINIMAL_SPENDING";
    }
    
    private double calculateEmotionImpact(Double emotionScore, List<Transaction> transactions) {
        if (emotionScore == null || transactions.isEmpty()) return 0.0;
        
        double totalSpending = transactions.stream()
                .filter(t -> t.getAmount().doubleValue() < 0)
                .mapToDouble(t -> Math.abs(t.getAmount().doubleValue()))
                .sum();
        
        double emotionIntensity = Math.abs(emotionScore);
        double spendingNormalized = Math.min(1.0, totalSpending / 500000.0); // Normalize to 500k KRW
        
        return emotionIntensity * spendingNormalized;
    }
    
    private String assessRiskLevel(double correlationScore, double emotionImpact) {
        double riskScore = (correlationScore + emotionImpact) / 2.0;
        
        if (riskScore > 0.8) return "HIGH";
        if (riskScore > 0.5) return "MODERATE";
        if (riskScore > 0.2) return "LOW";
        return "MINIMAL";
    }
    
    private String generateAnalysisDetails(double correlationScore, String spendingTrend, double emotionImpact) {
        StringBuilder details = new StringBuilder();
        details.append("재정-감정 상관관계 분석 결과: ");
        
        if (correlationScore > 0.7) {
            details.append("감정 상태와 소비 패턴 간에 강한 상관관계가 발견되었습니다. ");
        } else if (correlationScore > 0.4) {
            details.append("감정 상태와 소비 패턴 간에 중간 정도의 상관관계가 있습니다. ");
        } else {
            details.append("감정 상태와 소비 패턴 간의 상관관계는 약합니다. ");
        }
        
        switch (spendingTrend) {
            case "HIGH_SPENDING" -> details.append("현재 높은 수준의 소비 패턴을 보이고 있습니다.");
            case "MODERATE_SPENDING" -> details.append("적당한 수준의 소비 패턴을 유지하고 있습니다.");
            case "LOW_SPENDING" -> details.append("절약적인 소비 패턴을 보이고 있습니다.");
            default -> details.append("소비 패턴 데이터가 부족합니다.");
        }
        
        return details.toString();
    }

    private FinancialCorrelationResult getDefaultCorrelationResult() {
        return FinancialCorrelationResult.builder()
                .correlationScore(0.0)
                .spendingTrend("INSUFFICIENT_DATA")
                .emotionImpact(0.0)
                .riskLevel("UNKNOWN")
                .analysisDetails("충분한 거래 데이터가 없어 상관관계 분석을 수행할 수 없습니다.")
                .build();
    }
}