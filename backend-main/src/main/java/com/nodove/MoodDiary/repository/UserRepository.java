package com.nodove.MoodDiary.repository;

import com.nodove.MoodDiary.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByVerificationToken(String verificationToken);
    
    boolean existsByEmail(String email);
}