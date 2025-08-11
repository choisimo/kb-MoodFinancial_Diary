package com.nodove.MoodDiary.controller;

import com.nodove.MoodDiary.dto.response.ApiResponse;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.exception.ResourceNotFoundException;
import com.nodove.MoodDiary.repository.UserRepository;
import com.nodove.MoodDiary.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Tag(name = "파일 업로드", description = "파일 업로드 관리 API")
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {
    
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    
    @Operation(summary = "프로필 이미지 업로드", description = "사용자 프로필 이미지를 업로드합니다")
    @PostMapping("/profile-image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        Long userId = (Long) authentication.getDetails();
        
        // 기존 프로필 이미지 삭제
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        
        if (user.getProfileImageUrl() != null) {
            fileStorageService.deleteFile(user.getProfileImageUrl());
        }
        
        // 새 이미지 업로드
        String imageUrl = fileStorageService.storeProfileImage(file, userId);
        
        // 사용자 프로필 이미지 URL 업데이트
        user.setProfileImageUrl(imageUrl);
        userRepository.save(user);
        
        Map<String, String> response = Map.of(
            "imageUrl", imageUrl,
            "message", "프로필 이미지가 성공적으로 업로드되었습니다."
        );
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @Operation(summary = "프로필 이미지 삭제", description = "사용자 프로필 이미지를 삭제합니다")
    @DeleteMapping("/profile-image")
    public ResponseEntity<ApiResponse<String>> deleteProfileImage(Authentication authentication) {
        
        Long userId = (Long) authentication.getDetails();
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        
        if (user.getProfileImageUrl() != null) {
            fileStorageService.deleteFile(user.getProfileImageUrl());
            user.setProfileImageUrl(null);
            userRepository.save(user);
        }
        
        return ResponseEntity.ok(ApiResponse.success("프로필 이미지가 성공적으로 삭제되었습니다."));
    }
}