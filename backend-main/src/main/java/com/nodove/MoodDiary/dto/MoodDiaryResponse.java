package com.nodove.MoodDiary.dto;

import com.nodove.MoodDiary.enums.MoodType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoodDiaryResponse {
    
    private Long id;
    private String title;
    private String content;
    private MoodType mood;
    private Integer moodIntensity;
    private List<String> tags;
    private String weather;
    private String location;
    private Boolean isPrivate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 기분 정보 추가
    private String moodKoreanName;
    private String moodEmoji;
    private String moodColor;
}
