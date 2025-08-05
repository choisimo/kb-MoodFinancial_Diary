package com.nodove.MoodDiary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String email;
    private String nickname;
    private boolean emailVerified;
}