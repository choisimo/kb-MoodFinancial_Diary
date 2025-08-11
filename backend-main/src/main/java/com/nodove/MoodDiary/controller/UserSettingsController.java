package com.nodove.MoodDiary.controller;

import com.nodove.MoodDiary.dto.UserSettingsRequest;
import com.nodove.MoodDiary.dto.UserSettingsResponse;
import com.nodove.MoodDiary.dto.request.OnboardingRequest;
import com.nodove.MoodDiary.dto.request.UserSettingsUpdateRequest;
import com.nodove.MoodDiary.dto.response.ApiResponse;
import com.nodove.MoodDiary.service.UserSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "사용자 설정", description = "사용자 설정 관리 API")
@RestController
@RequestMapping("/api/user-settings")
@RequiredArgsConstructor
public class UserSettingsController {
    
    private final UserSettingsService userSettingsService;
    
    // 기존 API 유지 (호환성)
    @GetMapping
    public ResponseEntity<UserSettingsResponse> getUserSettings(Authentication authentication) {
        Long userId = (Long) authentication.getDetails();
        UserSettingsResponse response = userSettingsService.getUserSettings(userId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping
    public ResponseEntity<UserSettingsResponse> updateUserSettings(
            @RequestBody UserSettingsRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getDetails();
        UserSettingsResponse response = userSettingsService.updateUserSettings(userId, request);
        return ResponseEntity.ok(response);
    }
    
    // 새로운 확장 API들
    
    @Operation(summary = "확장 사용자 설정 조회", description = "모든 사용자 설정 정보를 조회합니다")
    @GetMapping("/extended")
    public ResponseEntity<ApiResponse<com.nodove.MoodDiary.dto.response.UserSettingsResponse>> getExtendedUserSettings(
            Authentication authentication) {
        Long userId = (Long) authentication.getDetails();
        var response = userSettingsService.getExtendedUserSettings(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @Operation(summary = "확장 사용자 설정 업데이트", description = "사용자 설정을 업데이트합니다")
    @PutMapping("/extended")
    public ResponseEntity<ApiResponse<com.nodove.MoodDiary.dto.response.UserSettingsResponse>> updateExtendedUserSettings(
            @Valid @RequestBody UserSettingsUpdateRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getDetails();
        var response = userSettingsService.updateExtendedUserSettings(userId, request);
        return ResponseEntity.ok(ApiResponse.success("설정이 성공적으로 업데이트되었습니다.", response));
    }
    
    @Operation(summary = "온보딩 완료", description = "사용자 온보딩을 완료하고 초기 설정을 저장합니다")
    @PostMapping("/onboarding")
    public ResponseEntity<ApiResponse<com.nodove.MoodDiary.dto.response.UserSettingsResponse>> completeOnboarding(
            @Valid @RequestBody OnboardingRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getDetails();
        var response = userSettingsService.completeOnboarding(userId, request);
        return ResponseEntity.ok(ApiResponse.success("온보딩이 성공적으로 완료되었습니다.", response));
    }
    
    @Operation(summary = "온보딩 상태 확인", description = "사용자의 온보딩 완료 상태를 확인합니다")
    @GetMapping("/onboarding/status")
    public ResponseEntity<ApiResponse<Boolean>> getOnboardingStatus(Authentication authentication) {
        Long userId = (Long) authentication.getDetails();
        boolean isCompleted = userSettingsService.isOnboardingCompleted(userId);
        return ResponseEntity.ok(ApiResponse.success(isCompleted));
    }
    
    @Operation(summary = "설정 초기화", description = "사용자 설정을 기본값으로 초기화합니다")
    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<com.nodove.MoodDiary.dto.response.UserSettingsResponse>> resetSettings(
            Authentication authentication) {
        Long userId = (Long) authentication.getDetails();
        var response = userSettingsService.resetSettings(userId);
        return ResponseEntity.ok(ApiResponse.success("설정이 성공적으로 초기화되었습니다.", response));
    }
}