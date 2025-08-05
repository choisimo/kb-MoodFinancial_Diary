package com.nodove.MoodDiary.repository;

import com.nodove.MoodDiary.entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {
    
    Optional<UserSettings> findByUserId(Long userId);
}