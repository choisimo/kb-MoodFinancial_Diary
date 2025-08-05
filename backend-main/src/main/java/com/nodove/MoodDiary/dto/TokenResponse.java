package com.nodove.MoodDiary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 토큰 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private Long refreshExpiresIn;
    
    public static TokenResponse of(String accessToken, String refreshToken, Long expiresIn, Long refreshExpiresIn) {
        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .refreshExpiresIn(refreshExpiresIn)
                .build();
    }
}
