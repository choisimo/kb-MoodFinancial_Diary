package com.nodove.MoodDiary.controller;

import com.nodove.MoodDiary.dto.UserSettingsRequest;
import com.nodove.MoodDiary.dto.UserSettingsResponse;
import com.nodove.MoodDiary.service.UserSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-settings")
@RequiredArgsConstructor
public class UserSettingsController {
    
    private final UserSettingsService userSettingsService;
    
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
}