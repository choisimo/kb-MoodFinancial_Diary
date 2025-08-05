package com.nodove.MoodDiary.dto;

import java.time.LocalTime;

public record UserSettingsResponse(
    Long id,
    Boolean notificationEnabled,
    LocalTime dailyReminderTime,
    Integer targetEntriesPerWeek,
    Boolean privacyMode
) {}