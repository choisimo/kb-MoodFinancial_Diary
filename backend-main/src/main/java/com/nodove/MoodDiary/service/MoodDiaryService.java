package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.dto.MoodDiaryRequest;
import com.nodove.MoodDiary.dto.MoodDiaryResponse;
import com.nodove.MoodDiary.entity.MoodDiary;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.enums.MoodType;
import com.nodove.MoodDiary.repository.MoodDiaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MoodDiaryService {
    
    private final MoodDiaryRepository moodDiaryRepository;
    
    @Transactional
    public MoodDiaryResponse createDiary(User user, MoodDiaryRequest request) {
        log.info("Creating mood diary for user: {}", user.getEmail());
        
        MoodDiary diary = MoodDiary.builder()
                .user(user)
                .title(request.getTitle())
                .content(request.getContent())
                .mood(request.getMood())
                .moodIntensity(request.getMoodIntensity())
                .tags(request.getTags())
                .weather(request.getWeather())
                .location(request.getLocation())
                .isPrivate(request.getIsPrivate())
                .build();
        
        MoodDiary savedDiary = moodDiaryRepository.save(diary);
        return convertToResponse(savedDiary);
    }
    
    @Transactional
    public MoodDiaryResponse updateDiary(User user, Long diaryId, MoodDiaryRequest request) {
        log.info("Updating mood diary {} for user: {}", diaryId, user.getEmail());
        
        MoodDiary diary = moodDiaryRepository.findByIdAndUser(diaryId, user)
                .orElseThrow(() -> new RuntimeException("일기를 찾을 수 없습니다."));
        
        diary.setTitle(request.getTitle());
        diary.setContent(request.getContent());
        diary.setMood(request.getMood());
        diary.setMoodIntensity(request.getMoodIntensity());
        diary.setTags(request.getTags());
        diary.setWeather(request.getWeather());
        diary.setLocation(request.getLocation());
        diary.setIsPrivate(request.getIsPrivate());
        
        MoodDiary updatedDiary = moodDiaryRepository.save(diary);
        return convertToResponse(updatedDiary);
    }
    
    @Transactional
    public void deleteDiary(User user, Long diaryId) {
        log.info("Deleting mood diary {} for user: {}", diaryId, user.getEmail());
        
        MoodDiary diary = moodDiaryRepository.findByIdAndUser(diaryId, user)
                .orElseThrow(() -> new RuntimeException("일기를 찾을 수 없습니다."));
        
        moodDiaryRepository.delete(diary);
    }
    
    public MoodDiaryResponse getDiary(User user, Long diaryId) {
        MoodDiary diary = moodDiaryRepository.findByIdAndUser(diaryId, user)
                .orElseThrow(() -> new RuntimeException("일기를 찾을 수 없습니다."));
        
        return convertToResponse(diary);
    }
    
    public Page<MoodDiaryResponse> getUserDiaries(User user, Pageable pageable) {
        Page<MoodDiary> diaries = moodDiaryRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return diaries.map(this::convertToResponse);
    }
    
    public Page<MoodDiaryResponse> getDiariesByMood(User user, MoodType mood, Pageable pageable) {
        Page<MoodDiary> diaries = moodDiaryRepository.findByUserAndMoodOrderByCreatedAtDesc(user, mood, pageable);
        return diaries.map(this::convertToResponse);
    }
    
    public List<MoodDiaryResponse> getDiariesByDateRange(User user, LocalDateTime startDate, LocalDateTime endDate) {
        List<MoodDiary> diaries = moodDiaryRepository.findByUserAndDateRange(user, startDate, endDate);
        return diaries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public Page<MoodDiaryResponse> searchDiaries(User user, String keyword, Pageable pageable) {
        Page<MoodDiary> diaries = moodDiaryRepository.findByUserAndKeyword(user, keyword, pageable);
        return diaries.map(this::convertToResponse);
    }
    
    public List<MoodDiaryResponse> getRecentDiaries(User user) {
        List<MoodDiary> diaries = moodDiaryRepository.findTop5ByUserOrderByCreatedAtDesc(user);
        return diaries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public long getUserDiaryCount(User user) {
        return moodDiaryRepository.countByUser(user);
    }
    
    public long getUserMoodCount(User user, MoodType mood) {
        return moodDiaryRepository.countByUserAndMood(user, mood);
    }
    
    private MoodDiaryResponse convertToResponse(MoodDiary diary) {
        return MoodDiaryResponse.builder()
                .id(diary.getId())
                .title(diary.getTitle())
                .content(diary.getContent())
                .mood(diary.getMood())
                .moodIntensity(diary.getMoodIntensity())
                .tags(diary.getTags())
                .weather(diary.getWeather())
                .location(diary.getLocation())
                .isPrivate(diary.getIsPrivate())
                .createdAt(diary.getCreatedAt())
                .updatedAt(diary.getUpdatedAt())
                .moodKoreanName(diary.getMood().getKoreanName())
                .moodEmoji(diary.getMood().getEmoji())
                .moodColor(diary.getMood().getColor())
                .build();
    }
}
