package com.nodove.MoodDiary.security;

import com.nodove.MoodDiary.dto.AuthResponse;
import com.nodove.MoodDiary.dto.UserProfileResponse;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.service.OAuth2UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                       Authentication authentication) throws IOException, ServletException {
        
        OAuth2UserService.CustomOAuth2User oauth2User = (OAuth2UserService.CustomOAuth2User) authentication.getPrincipal();
        User user = oauth2User.getUser();
        
        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        
        // Create user profile response
        UserProfileResponse userProfile = UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profileImageUrl(user.getProfileImageUrl())
                .emailVerified(user.getEmailVerified())
                .role(user.getRole())
                .status(user.getStatus())
                .provider(user.getProvider())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
        
        // Create auth response
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationTime())
                .user(userProfile)
                .build();
        
        log.info("OAuth2 login successful for user: {}", user.getEmail());
        
        // Redirect to frontend with tokens
        String redirectUrl = "http://localhost:3000/login/oauth2/success?" +
                "accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8) +
                "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8) +
                "&tokenType=Bearer" +
                "&userId=" + user.getId() +
                "&email=" + URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8) +
                "&nickname=" + URLEncoder.encode(user.getNickname() != null ? user.getNickname() : "", StandardCharsets.UTF_8);
        
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}