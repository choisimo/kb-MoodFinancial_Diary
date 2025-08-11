package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.dto.AuthResponse;
import com.nodove.MoodDiary.dto.UserProfileResponse;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.enums.AuthProvider;
import com.nodove.MoodDiary.enums.UserRole;
import com.nodove.MoodDiary.enums.UserStatus;
import com.nodove.MoodDiary.repository.UserRepository;
import com.nodove.MoodDiary.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OAuth2Service {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, Object> redisTemplate;

    public AuthResponse processOAuth2User(OAuth2User oauth2User, HttpServletRequest request) {
        String email = extractEmail(oauth2User);
        String provider = extractProvider(request);
        
        log.info("OAuth2 사용자 처리: email={}, provider={}", email, provider);

        // 기존 사용자 조회 또는 새 사용자 생성
        User user = userRepository.findByEmail(email)
                .map(existingUser -> updateExistingUser(existingUser, oauth2User, provider))
                .orElseGet(() -> createNewUser(oauth2User, email, provider));

        // 마지막 로그인 시간 업데이트
        user.setLastLoginAt(LocalDateTime.now());
        user = userRepository.save(user);

        // JWT 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        // Refresh Token을 Redis에 저장
        storeRefreshToken(user.getId(), refreshToken);

        log.info("OAuth2 로그인 완료: userId={}, email={}", user.getId(), user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationTime())
                .user(UserProfileResponse.builder()
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
                        .build())
                .build();
    }

    private String extractEmail(OAuth2User oauth2User) {
        // Google OAuth2 사용자의 이메일 추출
        return oauth2User.getAttribute("email");
    }

    private String extractProvider(HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        if (requestURI.contains("google")) {
            return "GOOGLE";
        } else if (requestURI.contains("kakao")) {
            return "KAKAO";
        }
        return "UNKNOWN";
    }

    private User updateExistingUser(User existingUser, OAuth2User oauth2User, String provider) {
        // 기존 사용자의 OAuth2 정보 업데이트
        if (existingUser.getProvider() == AuthProvider.LOCAL) {
            // 로컬 계정을 OAuth2 계정으로 연동
            existingUser.setProvider(AuthProvider.valueOf(provider));
        }

        // 프로필 정보 업데이트 (OAuth2에서 가져온 최신 정보로)
        updateUserProfile(existingUser, oauth2User, provider);
        
        return existingUser;
    }

    private User createNewUser(OAuth2User oauth2User, String email, String provider) {
        User newUser = User.builder()
                .email(email)
                .provider(AuthProvider.valueOf(provider))
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE) // OAuth2 사용자는 이메일 인증이 완료된 것으로 간주
                .emailVerified(true)
                .createdAt(LocalDateTime.now())
                .build();

        // OAuth2 제공자별 프로필 정보 설정
        updateUserProfile(newUser, oauth2User, provider);

        return newUser;
    }

    private void updateUserProfile(User user, OAuth2User oauth2User, String provider) {
        if ("GOOGLE".equals(provider)) {
            user.setFirstName(oauth2User.getAttribute("given_name"));
            user.setLastName(oauth2User.getAttribute("family_name"));
            user.setNickname(oauth2User.getAttribute("name"));
            user.setProfileImageUrl(oauth2User.getAttribute("picture"));
        } else if ("KAKAO".equals(provider)) {
            Map<String, Object> kakaoAccount = oauth2User.getAttribute("kakao_account");
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            
            user.setNickname((String) profile.get("nickname"));
            user.setProfileImageUrl((String) profile.get("profile_image_url"));
        }
    }

    private void storeRefreshToken(Long userId, String refreshToken) {
        String key = "refresh_token:" + userId;
        redisTemplate.opsForValue().set(key, refreshToken, 7, TimeUnit.DAYS);
    }
}
