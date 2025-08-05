package com.nodove.MoodDiary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 인증 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private UserProfileResponse user;
    
    // Legacy constructor for backward compatibility
    public AuthResponse(String token, Long userId, String email, String nickname, boolean emailVerified) {
        this.accessToken = token;
        this.tokenType = "Bearer";
        this.user = UserProfileResponse.builder()
                .id(userId)
                .email(email)
                .nickname(nickname)
                .emailVerified(emailVerified)
                .build();
    }
}