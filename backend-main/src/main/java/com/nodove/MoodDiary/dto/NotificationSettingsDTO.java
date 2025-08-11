package com.nodove.MoodDiary.dto;

import lombok.Data;

import java.time.LocalTime;

@Data
public class NotificationSettingsDTO {
    private Boolean diaryReminderEnabled;
    private LocalTime diaryReminderTime;
    private Boolean moodAnalysisEnabled;
    private Boolean financialInsightsEnabled;
    private Boolean achievementNotificationsEnabled;
    private Boolean pushNotificationsEnabled;
    private Boolean emailNotificationsEnabled;
}