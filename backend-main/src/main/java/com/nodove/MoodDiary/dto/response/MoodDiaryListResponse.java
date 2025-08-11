package com.nodove.MoodDiary.dto.response;

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
public class MoodDiaryListResponse {
    
    private List<MoodDiarySummary> diaries;
    private int totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
    private boolean hasNext;
    private boolean hasPrevious;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MoodDiarySummary {
        private Long id;
        private String title;
        private String content; // 요약된 내용 (첫 100자)
        private String mood;
        private String moodEmoji;
        private String moodColor;
        private Integer moodIntensity;
        private List<String> tags;
        private String weather;
        private Boolean isPrivate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Integer wordCount;
        private Boolean hasImages;
    }
}