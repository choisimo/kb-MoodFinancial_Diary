package com.nodove.MoodDiary.dto;

import com.nodove.MoodDiary.enums.AuthProvider;
import com.nodove.MoodDiary.enums.UserRole;
import com.nodove.MoodDiary.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 사용자 프로필 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    
    private Long id;
    private String email;
    private String nickname;
    private String firstName;
    private String lastName;
    private String profileImageUrl;
    private Boolean emailVerified;
    private UserRole role;
    private UserStatus status;
    private AuthProvider provider;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Helper methods
    public String getDisplayName() {
        if (nickname != null && !nickname.trim().isEmpty()) {
            return nickname;
        }
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        }
        if (firstName != null) {
            return firstName;
        }
        return email.split("@")[0];
    }
}
