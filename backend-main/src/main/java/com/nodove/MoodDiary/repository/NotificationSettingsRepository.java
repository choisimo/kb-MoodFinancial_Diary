package com.nodove.MoodDiary.repository;

import com.nodove.MoodDiary.entity.NotificationSettings;
import com.nodove.MoodDiary.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, Long> {
    Optional<NotificationSettings> findByUser(User user);
}