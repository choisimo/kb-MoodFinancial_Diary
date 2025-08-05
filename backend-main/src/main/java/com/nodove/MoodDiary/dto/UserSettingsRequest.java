package com.nodove.MoodDiary.dto;

import lombok.Data;

import java.time.LocalTime;

@Data
public class UserSettingsRequest {
    
    private Boolean notificationEnabled;
    private LocalTime dailyReminderTime;
    private Integer targetEntriesPerWeek;
    private Boolean privacyMode;
}