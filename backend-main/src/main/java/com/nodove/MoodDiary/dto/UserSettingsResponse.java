package com.nodove.MoodDiary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsResponse {
    
    private Long id;
    private Boolean notificationEnabled;
    private LocalTime dailyReminderTime;
    private Integer targetEntriesPerWeek;
    private Boolean privacyMode;
}