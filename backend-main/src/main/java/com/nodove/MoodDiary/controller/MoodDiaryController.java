package com.nodove.MoodDiary.controller;

import com.nodove.MoodDiary.dto.ApiResponse;
import com.nodove.MoodDiary.dto.DiaryStatsResponse;
import com.nodove.MoodDiary.dto.MoodDiaryRequest;
import com.nodove.MoodDiary.dto.MoodDiaryResponse;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.enums.MoodType;
import com.nodove.MoodDiary.service.MoodDiaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/mood-diaries")
@RequiredArgsConstructor
public class MoodDiaryController {
    
    private final MoodDiaryService moodDiaryService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<MoodDiaryResponse>> createDiary(
            @Valid @RequestBody MoodDiaryRequest request,
            Authentication authentication) {
        
        Long userId = (Long) authentication.getDetails();
        log.info("Creating mood diary for user: {}", userId);
        MoodDiaryResponse response = moodDiaryService.createDiary(request, userId);
        
        return ResponseEntity.ok(ApiResponse.<MoodDiaryResponse>builder()
                .success(true)
                .message("일기가 성공적으로 작성되었습니다.")
                .data(response)
                .build());
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<MoodDiaryResponse>>> getUserDiaries(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Long userId = (Long) authentication.getDetails();
        Pageable pageable = PageRequest.of(page, size);
        Page<MoodDiaryResponse> diaries = moodDiaryService.getUserDiaries(userId, pageable);
        
        return ResponseEntity.ok(ApiResponse.<Page<MoodDiaryResponse>>builder()
                .success(true)
                .message("일기 목록을 성공적으로 조회했습니다.")
                .data(diaries)
                .build());
    }
    
    @GetMapping("/{diaryId}")
    public ResponseEntity<ApiResponse<MoodDiaryResponse>> getDiary(
            Authentication authentication,
            @PathVariable Long diaryId) {
        
        Long userId = (Long) authentication.getDetails();
        MoodDiaryResponse diary = moodDiaryService.getDiary(userId, diaryId);
        
        return ResponseEntity.ok(ApiResponse.<MoodDiaryResponse>builder()
                .success(true)
                .message("일기를 성공적으로 조회했습니다.")
                .data(diary)
                .build());
    }
    
    @PutMapping("/{diaryId}")
    public ResponseEntity<ApiResponse<MoodDiaryResponse>> updateDiary(
            Authentication authentication,
            @PathVariable Long diaryId,
            @Valid @RequestBody MoodDiaryRequest request) {
        
        Long userId = (Long) authentication.getDetails();
        MoodDiaryResponse response = moodDiaryService.updateDiary(userId, diaryId, request);
        
        return ResponseEntity.ok(ApiResponse.<MoodDiaryResponse>builder()
                .success(true)
                .message("일기가 성공적으로 수정되었습니다.")
                .data(response)
                .build());
    }
    
    @DeleteMapping("/{diaryId}")
    public ResponseEntity<ApiResponse<Void>> deleteDiary(
            Authentication authentication,
            @PathVariable Long diaryId) {
        
        Long userId = (Long) authentication.getDetails();
        moodDiaryService.deleteDiary(userId, diaryId);
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("일기가 성공적으로 삭제되었습니다.")
                .build());
    }
    
    @GetMapping("/mood/{mood}")
    public ResponseEntity<ApiResponse<Page<MoodDiaryResponse>>> getDiariesByMood(
            Authentication authentication,
            @PathVariable MoodType mood,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Long userId = (Long) authentication.getDetails();
        Pageable pageable = PageRequest.of(page, size);
        Page<MoodDiaryResponse> diaries = moodDiaryService.getDiariesByMood(userId, mood, pageable);
        
        return ResponseEntity.ok(ApiResponse.<Page<MoodDiaryResponse>>builder()
                .success(true)
                .message("기분별 일기 목록을 성공적으로 조회했습니다.")
                .data(diaries)
                .build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<MoodDiaryResponse>>> searchDiaries(
            Authentication authentication,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Long userId = (Long) authentication.getDetails();
        Pageable pageable = PageRequest.of(page, size);
        Page<MoodDiaryResponse> diaries = moodDiaryService.searchDiaries(userId, keyword, pageable);
        
        return ResponseEntity.ok(ApiResponse.<Page<MoodDiaryResponse>>builder()
                .success(true)
                .message("일기 검색 결과를 성공적으로 조회했습니다.")
                .data(diaries)
                .build());
    }
    
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<MoodDiaryResponse>>> getRecentDiaries(
            Authentication authentication) {
        
        Long userId = (Long) authentication.getDetails();
        List<MoodDiaryResponse> diaries = moodDiaryService.getRecentDiaries(userId);
        
        return ResponseEntity.ok(ApiResponse.<List<MoodDiaryResponse>>builder()
                .success(true)
                .message("최근 일기 목록을 성공적으로 조회했습니다.")
                .data(diaries)
                .build());
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<MoodDiaryResponse>>> getDiariesByDateRange(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        Long userId = (Long) authentication.getDetails();
        List<MoodDiaryResponse> diaries = moodDiaryService.getDiariesByDateRange(userId, startDate, endDate);
        
        return ResponseEntity.ok(ApiResponse.<List<MoodDiaryResponse>>builder()
                .success(true)
                .message("기간별 일기 목록을 성공적으로 조회했습니다.")
                .data(diaries)
                .build());
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DiaryStatsResponse>> getDiaryStats(
            @AuthenticationPrincipal User user) {
        
        long totalCount = moodDiaryService.getUserDiaryCount(user);
        
        // 기분별 통계
        DiaryStatsResponse stats = DiaryStatsResponse.builder()
                .totalDiaries(totalCount)
                .happyDiaries(moodDiaryService.getUserMoodCount(user, MoodType.HAPPY))
                .sadDiaries(moodDiaryService.getUserMoodCount(user, MoodType.SAD))
                .angryDiaries(moodDiaryService.getUserMoodCount(user, MoodType.ANGRY))
                .anxiousDiaries(moodDiaryService.getUserMoodCount(user, MoodType.ANXIOUS))
                .build();
        
        return ResponseEntity.ok(ApiResponse.<DiaryStatsResponse>builder()
                .success(true)
                .message("일기 통계를 성공적으로 조회했습니다.")
                .data(stats)
                .build());
    }
}
