package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.dto.AuthResponse;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.entity.UserSettings;
import com.nodove.MoodDiary.repository.UserRepository;
import com.nodove.MoodDiary.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OAuth2UserService extends DefaultOAuth2UserService {
    
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String email = extractEmail(oauth2User, registrationId);
        String nickname = extractNickname(oauth2User, registrationId);
        
        User user = saveOrUpdateUser(email, nickname, registrationId);
        
        return new CustomOAuth2User(oauth2User, user);
    }
    
    private String extractEmail(OAuth2User oauth2User, String registrationId) {
        switch (registrationId) {
            case "google":
                return oauth2User.getAttribute("email");
            case "kakao":
                Map<String, Object> kakaoAccount = oauth2User.getAttribute("kakao_account");
                if (kakaoAccount != null) {
                    return (String) kakaoAccount.get("email");
                }
                break;
        }
        return null;
    }
    
    private String extractNickname(OAuth2User oauth2User, String registrationId) {
        switch (registrationId) {
            case "google":
                return oauth2User.getAttribute("name");
            case "kakao":
                Map<String, Object> properties = oauth2User.getAttribute("properties");
                if (properties != null) {
                    return (String) properties.get("nickname");
                }
                break;
        }
        return "사용자";
    }
    
    private User saveOrUpdateUser(String email, String nickname, String provider) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (user.getNickname() == null || user.getNickname().isEmpty()) {
                user.setNickname(nickname);
            }
            user.setEmailVerified(true); // OAuth users are considered verified
            return userRepository.save(user);
        } else {
            User newUser = User.builder()
                    .email(email)
                    .nickname(nickname)
                    .password("") // OAuth users don't have passwords
                    .emailVerified(true)
                    .build();
            
            UserSettings settings = UserSettings.builder()
                    .user(newUser)
                    .build();
            
            newUser.setUserSettings(settings);
            
            return userRepository.save(newUser);
        }
    }
    
    public static class CustomOAuth2User implements OAuth2User {
        private final OAuth2User oauth2User;
        private final User user;
        
        public CustomOAuth2User(OAuth2User oauth2User, User user) {
            this.oauth2User = oauth2User;
            this.user = user;
        }
        
        @Override
        public Map<String, Object> getAttributes() {
            return oauth2User.getAttributes();
        }
        
        @Override
        public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
            return oauth2User.getAuthorities();
        }
        
        @Override
        public String getName() {
            return user.getEmail();
        }
        
        public User getUser() {
            return user;
        }
    }
}