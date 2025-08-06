package com.nodove.MoodDiary.repository;

import com.nodove.MoodDiary.entity.MoodDiary;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.enums.MoodType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MoodDiaryRepository extends JpaRepository<MoodDiary, Long> {
    
    // 사용자별 일기 조회
    Page<MoodDiary> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // 사용자별 특정 기분의 일기 조회
    Page<MoodDiary> findByUserAndMoodOrderByCreatedAtDesc(User user, MoodType mood, Pageable pageable);
    
    // 사용자별 기간별 일기 조회
    @Query("SELECT md FROM MoodDiary md WHERE md.user = :user AND md.createdAt BETWEEN :startDate AND :endDate ORDER BY md.createdAt DESC")
    List<MoodDiary> findByUserAndDateRange(@Param("user") User user, 
                                          @Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    // 사용자별 태그로 일기 검색
    @Query("SELECT md FROM MoodDiary md WHERE md.user = :user AND :tag MEMBER OF md.tags ORDER BY md.createdAt DESC")
    Page<MoodDiary> findByUserAndTag(@Param("user") User user, @Param("tag") String tag, Pageable pageable);
    
    // 사용자별 제목이나 내용으로 일기 검색
    @Query("SELECT md FROM MoodDiary md WHERE md.user = :user AND (md.title LIKE %:keyword% OR md.content LIKE %:keyword%) ORDER BY md.createdAt DESC")
    Page<MoodDiary> findByUserAndKeyword(@Param("user") User user, @Param("keyword") String keyword, Pageable pageable);
    
    // 사용자별 일기 개수
    long countByUser(User user);
    
    // 사용자별 기분별 일기 개수
    long countByUserAndMood(User user, MoodType mood);
    
    // 사용자의 특정 일기 조회 (보안을 위해)
    Optional<MoodDiary> findByIdAndUser(Long id, User user);
    
    // 사용자별 최근 일기들
    List<MoodDiary> findTop5ByUserOrderByCreatedAtDesc(User user);
}
