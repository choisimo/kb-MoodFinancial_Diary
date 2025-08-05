package com.nodove.MoodDiary.security;

import com.nodove.MoodDiary.dto.AuthResponse;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.service.OAuth2UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

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
        
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getId());
        
        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .emailVerified(user.getEmailVerified())
                .build();
        
        // Redirect to frontend with token
        String redirectUrl = "http://localhost:3000/login/oauth2/success?token=" + token + 
                           "&userId=" + user.getId() + 
                           "&email=" + user.getEmail() + 
                           "&nickname=" + user.getNickname() + 
                           "&emailVerified=" + user.getEmailVerified();
        
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}