package com.nodove.MoodDiary.repository;

import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.enums.AuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByVerificationToken(String verificationToken);
    
    Optional<User> findByResetPasswordToken(String resetPasswordToken);
    
    Optional<User> findByProviderAndProviderId(AuthProvider provider, String providerId);
    
    boolean existsByEmail(String email);
    
    boolean existsByNickname(String nickname);
    
    @Query("SELECT u FROM User u WHERE u.emailVerified = false AND u.verificationTokenExpiry < :expiry")
    List<User> findUnverifiedUsersWithExpiredTokens(@Param("expiry") LocalDateTime expiry);
    
    @Query("SELECT u FROM User u WHERE u.lockedUntil IS NOT NULL AND u.lockedUntil < :now")
    List<User> findUsersWithExpiredLocks(@Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate")
    long countUsersCreatedAfter(@Param("startDate") LocalDateTime startDate);
}