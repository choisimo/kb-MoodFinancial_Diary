package com.nodove.MoodDiary.security;

import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.enums.AuthProvider;
import com.nodove.MoodDiary.repository.UserRepository;
import com.nodove.MoodDiary.service.InfisicalService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final InfisicalService infisicalService;
    
    @Value("${app.frontend.url:http://localhost:8080}")
    private String frontendUrl;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        log.info("OAuth2 로그인 성공: {}", oAuth2User.getAttributes());
        
        try {
            // OAuth2 사용자 정보에서 이메일 추출
            String email = extractEmail(oAuth2User);
            if (email == null) {
                log.error("OAuth2 사용자에서 이메일을 찾을 수 없습니다: {}", oAuth2User.getAttributes());
                redirectToLoginWithError(response, "이메일 정보를 가져올 수 없습니다.");
                return;
            }
            
            // 사용자 조회 또는 생성
            Optional<User> userOptional = userRepository.findByEmail(email);
            User user;
            
            if (userOptional.isPresent()) {
                user = userOptional.get();
                log.info("기존 사용자 OAuth2 로그인: {}", email);
            } else {
                // 새 사용자 생성
                user = createNewOAuth2User(oAuth2User, email);
                log.info("새 OAuth2 사용자 생성: {}", email);
            }
            
            // JWT 토큰 생성
            String accessToken = jwtTokenProvider.generateAccessToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);
            
            // Get frontend URL from Infisical with fallback to configured value
            String dynamicFrontendUrl = infisicalService.getSecret("FRONTEND_URL", frontendUrl);
            
            // 프론트엔드로 리다이렉트 (토큰을 쿼리 파라미터로 전달)
            String redirectUrl = UriComponentsBuilder.fromUriString(dynamicFrontendUrl + "/oauth2/redirect")
                    .queryParam("accessToken", accessToken)
                    .queryParam("refreshToken", refreshToken)
                    .build().toUriString();
            
            log.info("OAuth2 로그인 성공, 리다이렉트: {}", redirectUrl);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            
        } catch (Exception e) {
            log.error("OAuth2 인증 처리 중 오류 발생", e);
            redirectToLoginWithError(response, "로그인 처리 중 오류가 발생했습니다.");
        }
    }
    
    private String extractEmail(OAuth2User oAuth2User) {
        // Google의 경우
        if (oAuth2User.getAttributes().containsKey("email")) {
            return (String) oAuth2User.getAttributes().get("email");
        }
        
        // Kakao의 경우
        if (oAuth2User.getAttributes().containsKey("kakao_account")) {
            Object kakaoAccount = oAuth2User.getAttributes().get("kakao_account");
            if (kakaoAccount instanceof java.util.Map) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> account = (java.util.Map<String, Object>) kakaoAccount;
                return (String) account.get("email");
            }
        }
        
        return null;
    }
    
    private User createNewOAuth2User(OAuth2User oAuth2User, String email) {
        User user = new User();
        user.setEmail(email);
        
        // Google의 경우
        if (oAuth2User.getAttributes().containsKey("name")) {
            user.setNickname((String) oAuth2User.getAttributes().get("name"));
        }
        if (oAuth2User.getAttributes().containsKey("given_name")) {
            user.setFirstName((String) oAuth2User.getAttributes().get("given_name"));
        }
        if (oAuth2User.getAttributes().containsKey("family_name")) {
            user.setLastName((String) oAuth2User.getAttributes().get("family_name"));
        }
        if (oAuth2User.getAttributes().containsKey("picture")) {
            user.setProfileImageUrl((String) oAuth2User.getAttributes().get("picture"));
        }
        
        // Kakao의 경우
        if (oAuth2User.getAttributes().containsKey("properties")) {
            Object properties = oAuth2User.getAttributes().get("properties");
            if (properties instanceof java.util.Map) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> props = (java.util.Map<String, Object>) properties;
                user.setNickname((String) props.get("nickname"));
                user.setProfileImageUrl((String) props.get("profile_image"));
            }
        }
        
        // 기본값 설정
        if (user.getNickname() == null) {
            user.setNickname("OAuth2 User");
        }
        
        user.setPassword(""); // OAuth2 사용자는 비밀번호 불필요
        user.setEmailVerified(true); // OAuth2로 로그인했으므로 이메일 인증됨
        user.setProvider(determineProvider(oAuth2User));
        user.setProviderId(extractProviderId(oAuth2User));
        
        return userRepository.save(user);
    }
    
    private AuthProvider determineProvider(OAuth2User oAuth2User) {
        // Google의 경우 'sub' 속성이 있음
        if (oAuth2User.getAttributes().containsKey("sub")) {
            return AuthProvider.GOOGLE;
        }
        
        // Kakao의 경우 'id' 속성이 있음
        if (oAuth2User.getAttributes().containsKey("id")) {
            return AuthProvider.KAKAO;
        }
        
        return AuthProvider.LOCAL;
    }
    
    private String extractProviderId(OAuth2User oAuth2User) {
        // Google의 경우
        if (oAuth2User.getAttributes().containsKey("sub")) {
            return (String) oAuth2User.getAttributes().get("sub");
        }
        
        // Kakao의 경우
        if (oAuth2User.getAttributes().containsKey("id")) {
            return String.valueOf(oAuth2User.getAttributes().get("id"));
        }
        
        return null;
    }
    
    private void redirectToLoginWithError(HttpServletResponse response, String errorMessage) throws IOException {
        // Get frontend URL from Infisical with fallback to configured value
        String dynamicFrontendUrl = infisicalService.getSecret("FRONTEND_URL", frontendUrl);
        
        String redirectUrl = UriComponentsBuilder.fromUriString(dynamicFrontendUrl + "/login")
                .queryParam("error", errorMessage)
                .build().toUriString();
        
        getRedirectStrategy().sendRedirect(null, response, redirectUrl);
    }
}
