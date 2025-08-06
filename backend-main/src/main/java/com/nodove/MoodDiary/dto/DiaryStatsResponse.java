package com.nodove.MoodDiary.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryStatsResponse {
    private long totalDiaries;
    private long happyDiaries;
    private long sadDiaries;
    private long angryDiaries;
    private long anxiousDiaries;
}
