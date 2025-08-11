package com.nodove.MoodDiary.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class AuthenticationUtil {
    
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("인증되지 않은 사용자입니다.");
        }
        
        // Custom UserDetails에서 사용자 ID 추출
        if (authentication.getDetails() instanceof Long) {
            return (Long) authentication.getDetails();
        }
        
        // Spring Security User 객체에서 추출
        if (authentication.getName() != null) {
            try {
                return Long.parseLong(authentication.getName());
            } catch (NumberFormatException e) {
                // 이메일이나 다른 식별자인 경우
            }
        }
        
        throw new RuntimeException("사용자 ID를 추출할 수 없습니다.");
    }
    
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("인증되지 않은 사용자입니다.");
        }
        
        return authentication.getName();
    }
}