package com.nodove.MoodDiary.dto;

import java.time.LocalTime;

public record UserSettingsRequest(
    Boolean notificationEnabled,
    LocalTime dailyReminderTime,
    Integer targetEntriesPerWeek,
    Boolean privacyMode
) {}