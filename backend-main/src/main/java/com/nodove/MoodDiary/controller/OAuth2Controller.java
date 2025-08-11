package com.nodove.MoodDiary.controller;

import com.nodove.MoodDiary.dto.ApiResponse;
import com.nodove.MoodDiary.dto.AuthResponse;
import com.nodove.MoodDiary.service.OAuth2Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/auth/oauth2")
@RequiredArgsConstructor
public class OAuth2Controller {

    private final OAuth2Service oauth2Service;

    @GetMapping("/success")
    public void handleOAuth2Success(
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {
        
        try {
            log.info("OAuth2 로그인 성공: {}", oauth2User.getName());
            
            // OAuth2 사용자 정보를 처리하고 JWT 토큰 생성
            AuthResponse authResponse = oauth2Service.processOAuth2User(oauth2User, request);
            
            // 프론트엔드로 리다이렉트 (토큰을 쿼리 파라미터로 전달)
            String redirectUrl = String.format(
                "http://localhost:8080/oauth2/redirect?access_token=%s&refresh_token=%s&token_type=%s",
                authResponse.getAccessToken(),
                authResponse.getRefreshToken(),
                authResponse.getTokenType()
            );
            
            response.sendRedirect(redirectUrl);
            
        } catch (Exception e) {
            log.error("OAuth2 로그인 처리 중 오류 발생", e);
            response.sendRedirect("http://localhost:8080/login?error=oauth2_error");
        }
    }

    @GetMapping("/failure")
    public void handleOAuth2Failure(HttpServletRequest request, HttpServletResponse response) throws IOException {
        log.error("OAuth2 로그인 실패");
        response.sendRedirect("http://localhost:8080/login?error=oauth2_failure");
    }
}
