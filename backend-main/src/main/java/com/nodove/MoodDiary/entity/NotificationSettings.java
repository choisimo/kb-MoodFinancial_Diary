package com.nodove.MoodDiary.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "diary_reminder_enabled", nullable = false)
    @Builder.Default
    private Boolean diaryReminderEnabled = true;

    @Column(name = "diary_reminder_time")
    @Builder.Default
    private LocalTime diaryReminderTime = LocalTime.of(20, 0);

    @Column(name = "mood_analysis_enabled", nullable = false)
    @Builder.Default
    private Boolean moodAnalysisEnabled = true;

    @Column(name = "financial_insights_enabled", nullable = false)
    @Builder.Default
    private Boolean financialInsightsEnabled = true;

    @Column(name = "achievement_notifications_enabled", nullable = false)
    @Builder.Default
    private Boolean achievementNotificationsEnabled = true;

    @Column(name = "push_notifications_enabled", nullable = false)
    @Builder.Default
    private Boolean pushNotificationsEnabled = true;

    @Column(name = "email_notifications_enabled", nullable = false)
    @Builder.Default
    private Boolean emailNotificationsEnabled = false;
}