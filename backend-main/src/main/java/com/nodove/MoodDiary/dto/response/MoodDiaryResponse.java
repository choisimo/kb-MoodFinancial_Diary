package com.nodove.MoodDiary.dto.response;

import com.nodove.MoodDiary.enums.MoodType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoodDiaryResponse {
    
    private Long id;
    private Long userId;
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
    
    // 추가 정보
    private String userNickname;
    private String moodDisplay;
    private String moodEmoji;
    private String moodColor;
    
    // 일기 요약 정보
    private Integer wordCount;
    private Boolean hasImages;
    private Integer commentCount;
}