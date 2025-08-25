package com.nodove.MoodDiary.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalizedRecommendation {
    private String category;
    private String title;
    private String description;
    private String actionType;
    private Integer priority;
    private Boolean aiGenerated;
}