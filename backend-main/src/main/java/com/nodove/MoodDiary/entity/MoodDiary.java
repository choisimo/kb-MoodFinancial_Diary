package com.nodove.MoodDiary.entity;

import com.nodove.MoodDiary.enums.MoodType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "mood_diaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoodDiary {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MoodType mood;
    
    @Column(name = "mood_intensity")
    private Integer moodIntensity; // 1-10 scale
    
    @ElementCollection
    @CollectionTable(name = "mood_diary_tags", joinColumns = @JoinColumn(name = "diary_id"))
    @Column(name = "tag")
    private List<String> tags;
    
    @Column(name = "weather")
    private String weather;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "is_private")
    @Builder.Default
    private Boolean isPrivate = true;
    
    // AI Analysis Fields
    @Column(name = "emotion_score")
    private Double emotionScore;
    
    @Column(name = "dominant_emotion")
    private String dominantEmotion;
    
    @Column(name = "financial_emotion_score")
    private Double financialEmotionScore;
    
    @Column(name = "ai_analysis_completed")
    @Builder.Default
    private Boolean aiAnalysisCompleted = false;
    
    @Column(name = "analysis_details", columnDefinition = "TEXT")
    private String analysisDetails;
    
    @Column(name = "diary_date", nullable = false)
    private LocalDateTime diaryDate;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        if (diaryDate == null) {
            diaryDate = LocalDateTime.now();
        }
    }
}
