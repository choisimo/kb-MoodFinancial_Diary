package com.nodove.MoodDiary.repository;

import com.nodove.MoodDiary.entity.FCMToken;
import com.nodove.MoodDiary.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FCMTokenRepository extends JpaRepository<FCMToken, Long> {

    List<FCMToken> findByUserAndIsActiveTrue(User user);

    Optional<FCMToken> findByUserAndToken(User user, String token);

    @Query("SELECT ft.token FROM FCMToken ft WHERE ft.user = :user AND ft.isActive = true")
    List<String> findActiveTokensByUser(@Param("user") User user);

    @Modifying
    @Query("UPDATE FCMToken ft SET ft.isActive = false WHERE ft.user = :user AND ft.token = :token")
    void deactivateToken(@Param("user") User user, @Param("token") String token);

    @Modifying
    @Query("UPDATE FCMToken ft SET ft.isActive = false WHERE ft.user = :user")
    void deactivateAllTokensByUser(@Param("user") User user);

    @Modifying
    @Query("UPDATE FCMToken ft SET ft.lastUsedAt = :lastUsedAt WHERE ft.user = :user AND ft.token = :token")
    void updateLastUsedAt(@Param("user") User user, @Param("token") String token, @Param("lastUsedAt") LocalDateTime lastUsedAt);

    @Modifying
    @Query("DELETE FROM FCMToken ft WHERE ft.isActive = false AND ft.updatedAt < :cutoffDate")
    void deleteInactiveTokensOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT COUNT(ft) FROM FCMToken ft WHERE ft.user = :user AND ft.isActive = true")
    long countActiveTokensByUser(@Param("user") User user);
}