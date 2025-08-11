package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.dto.MoodDiaryRequest;
import com.nodove.MoodDiary.dto.MoodDiaryResponse;
import com.nodove.MoodDiary.dto.request.MoodDiaryCreateRequest;
import com.nodove.MoodDiary.dto.request.MoodDiaryUpdateRequest;
import com.nodove.MoodDiary.dto.response.MoodDiaryListResponse;
import com.nodove.MoodDiary.entity.MoodDiary;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.enums.MoodType;
import com.nodove.MoodDiary.exception.ResourceNotFoundException;
import com.nodove.MoodDiary.repository.MoodDiaryRepository;
import com.nodove.MoodDiary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MoodDiaryService {
    
    private final MoodDiaryRepository moodDiaryRepository;
    private final UserRepository userRepository;
    
    // 기존 메서드들 유지
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
    
    // 새로운 확장 메서드들
    
    /**
     * 일기 생성 (확장 버전)
     */
    @Transactional
    public com.nodove.MoodDiary.dto.response.MoodDiaryResponse createDiaryExtended(Long userId, MoodDiaryCreateRequest request) {
        User user = getUserById(userId);
        
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
        log.info("일기 생성 완료: userId={}, diaryId={}", userId, savedDiary.getId());
        
        return convertToExtendedResponse(savedDiary);
    }
    
    /**
     * 일기 조회 (확장 버전)
     */
    public com.nodove.MoodDiary.dto.response.MoodDiaryResponse getDiaryExtended(Long userId, Long diaryId) {
        User user = getUserById(userId);
        MoodDiary diary = moodDiaryRepository.findByIdAndUser(diaryId, user)
            .orElseThrow(() -> new ResourceNotFoundException("일기를 찾을 수 없습니다: " + diaryId));
        
        return convertToExtendedResponse(diary);
    }
    
    /**
     * 일기 목록 조회 (확장 버전)
     */
    public MoodDiaryListResponse getDiaryListExtended(Long userId, int page, int size, String sortBy, String sortDir) {
        User user = getUserById(userId);
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<MoodDiary> diaryPage = moodDiaryRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        
        List<MoodDiaryListResponse.MoodDiarySummary> diaries = diaryPage.getContent().stream()
            .map(this::convertToSummary)
            .collect(Collectors.toList());
        
        return MoodDiaryListResponse.builder()
            .diaries(diaries)
            .totalElements((int) diaryPage.getTotalElements())
            .totalPages(diaryPage.getTotalPages())
            .currentPage(diaryPage.getNumber())
            .pageSize(diaryPage.getSize())
            .hasNext(diaryPage.hasNext())
            .hasPrevious(diaryPage.hasPrevious())
            .build();
    }
    
    /**
     * 일기 수정 (확장 버전)
     */
    @Transactional
    public com.nodove.MoodDiary.dto.response.MoodDiaryResponse updateDiaryExtended(Long userId, Long diaryId, MoodDiaryUpdateRequest request) {
        User user = getUserById(userId);
        MoodDiary diary = moodDiaryRepository.findByIdAndUser(diaryId, user)
            .orElseThrow(() -> new ResourceNotFoundException("일기를 찾을 수 없습니다: " + diaryId));
        
        updateDiaryFromRequest(diary, request);
        MoodDiary updatedDiary = moodDiaryRepository.save(diary);
        
        log.info("일기 수정 완료: userId={}, diaryId={}", userId, diaryId);
        return convertToExtendedResponse(updatedDiary);
    }
    
    /**
     * 일기 삭제 (확장 버전)
     */
    @Transactional
    public void deleteDiaryExtended(Long userId, Long diaryId) {
        User user = getUserById(userId);
        MoodDiary diary = moodDiaryRepository.findByIdAndUser(diaryId, user)
            .orElseThrow(() -> new ResourceNotFoundException("일기를 찾을 수 없습니다: " + diaryId));
        
        moodDiaryRepository.delete(diary);
        log.info("일기 삭제 완료: userId={}, diaryId={}", userId, diaryId);
    }
    
    /**
     * 태그별 일기 조회 (확장 버전)
     */
    public MoodDiaryListResponse getDiariesByTagExtended(Long userId, String tag, int page, int size) {
        User user = getUserById(userId);
        Pageable pageable = PageRequest.of(page, size);
        
        Page<MoodDiary> diaryPage = moodDiaryRepository.findByUserAndTag(user, tag, pageable);
        
        List<MoodDiaryListResponse.MoodDiarySummary> diaries = diaryPage.getContent().stream()
            .map(this::convertToSummary)
            .collect(Collectors.toList());
        
        return MoodDiaryListResponse.builder()
            .diaries(diaries)
            .totalElements((int) diaryPage.getTotalElements())
            .totalPages(diaryPage.getTotalPages())
            .currentPage(diaryPage.getNumber())
            .pageSize(diaryPage.getSize())
            .hasNext(diaryPage.hasNext())
            .hasPrevious(diaryPage.hasPrevious())
            .build();
    }
    
    /**
     * 키워드 검색 (확장 버전)
     */
    public MoodDiaryListResponse searchDiariesExtended(Long userId, String keyword, int page, int size) {
        User user = getUserById(userId);
        Pageable pageable = PageRequest.of(page, size);
        
        Page<MoodDiary> diaryPage = moodDiaryRepository.findByUserAndKeyword(user, keyword, pageable);
        
        List<MoodDiaryListResponse.MoodDiarySummary> diaries = diaryPage.getContent().stream()
            .map(this::convertToSummary)
            .collect(Collectors.toList());
        
        return MoodDiaryListResponse.builder()
            .diaries(diaries)
            .totalElements((int) diaryPage.getTotalElements())
            .totalPages(diaryPage.getTotalPages())
            .currentPage(diaryPage.getNumber())
            .pageSize(diaryPage.getSize())
            .hasNext(diaryPage.hasNext())
            .hasPrevious(diaryPage.hasPrevious())
            .build();
    }
    
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
    }
    
    private void updateDiaryFromRequest(MoodDiary diary, MoodDiaryUpdateRequest request) {
        Optional.ofNullable(request.getTitle()).ifPresent(diary::setTitle);
        Optional.ofNullable(request.getContent()).ifPresent(diary::setContent);
        Optional.ofNullable(request.getMood()).ifPresent(diary::setMood);
        Optional.ofNullable(request.getMoodIntensity()).ifPresent(diary::setMoodIntensity);
        Optional.ofNullable(request.getTags()).ifPresent(diary::setTags);
        Optional.ofNullable(request.getWeather()).ifPresent(diary::setWeather);
        Optional.ofNullable(request.getLocation()).ifPresent(diary::setLocation);
        Optional.ofNullable(request.getIsPrivate()).ifPresent(diary::setIsPrivate);
    }
    
    // 기존 convertToResponse 메서드 유지
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
    
    // 새로운 convertToExtendedResponse 메서드
    private com.nodove.MoodDiary.dto.response.MoodDiaryResponse convertToExtendedResponse(MoodDiary diary) {
        return com.nodove.MoodDiary.dto.response.MoodDiaryResponse.builder()
            .id(diary.getId())
            .userId(diary.getUser().getId())
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
            .userNickname(diary.getUser().getDisplayName())
            .moodDisplay(diary.getMood().getKoreanName())
            .moodEmoji(diary.getMood().getEmoji())
            .moodColor(diary.getMood().getColor())
            .wordCount(diary.getContent() != null ? diary.getContent().length() : 0)
            .hasImages(false) // TODO: 이미지 기능 구현 후 수정
            .commentCount(0) // TODO: 댓글 기능 구현 후 수정
            .build();
    }
    
    private MoodDiaryListResponse.MoodDiarySummary convertToSummary(MoodDiary diary) {
        String summary = diary.getContent() != null && diary.getContent().length() > 100 ?
            diary.getContent().substring(0, 100) + "..." : diary.getContent();
            
        return MoodDiaryListResponse.MoodDiarySummary.builder()
            .id(diary.getId())
            .title(diary.getTitle())
            .content(summary)
            .mood(diary.getMood().getKoreanName())
            .moodEmoji(diary.getMood().getEmoji())
            .moodColor(diary.getMood().getColor())
            .moodIntensity(diary.getMoodIntensity())
            .tags(diary.getTags())
            .weather(diary.getWeather())
            .isPrivate(diary.getIsPrivate())
            .createdAt(diary.getCreatedAt())
            .updatedAt(diary.getUpdatedAt())
            .wordCount(diary.getContent() != null ? diary.getContent().length() : 0)
            .hasImages(false) // TODO: 이미지 기능 구현 후 수정
            .build();
    }
}
