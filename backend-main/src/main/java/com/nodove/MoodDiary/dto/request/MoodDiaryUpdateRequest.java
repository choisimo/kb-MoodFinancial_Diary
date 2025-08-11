package com.nodove.MoodDiary.dto.request;

import com.nodove.MoodDiary.enums.MoodType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoodDiaryUpdateRequest {
    
    @Size(min = 1, max = 255, message = "제목은 1자 이상 255자 이하로 입력해주세요")
    private String title;
    
    @Size(max = 10000, message = "내용은 10000자 이하로 입력해주세요")
    private String content;
    
    private MoodType mood;
    
    @Min(value = 1, message = "감정 강도는 1 이상이어야 합니다")
    @Max(value = 10, message = "감정 강도는 10 이하여야 합니다")
    private Integer moodIntensity;
    
    @Size(max = 10, message = "태그는 최대 10개까지 가능합니다")
    private List<String> tags;
    
    @Size(max = 100, message = "날씨는 100자 이하로 입력해주세요")
    private String weather;
    
    @Size(max = 255, message = "위치는 255자 이하로 입력해주세요")
    private String location;
    
    private Boolean isPrivate;
}