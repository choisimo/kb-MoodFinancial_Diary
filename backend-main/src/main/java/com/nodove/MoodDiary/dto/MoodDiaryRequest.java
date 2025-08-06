package com.nodove.MoodDiary.dto;

import com.nodove.MoodDiary.enums.MoodType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoodDiaryRequest {
    
    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 100, message = "제목은 100자를 초과할 수 없습니다")
    private String title;
    
    @Size(max = 5000, message = "내용은 5000자를 초과할 수 없습니다")
    private String content;
    
    @NotNull(message = "기분은 필수입니다")
    private MoodType mood;
    
    @Min(value = 1, message = "기분 강도는 1 이상이어야 합니다")
    @Max(value = 10, message = "기분 강도는 10 이하여야 합니다")
    private Integer moodIntensity;
    
    private List<String> tags;
    
    private String weather;
    
    private String location;
    
    @Builder.Default
    private Boolean isPrivate = true;
}
