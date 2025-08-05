package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.dto.*;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.entity.UserSettings;
import com.nodove.MoodDiary.enums.AuthProvider;
import com.nodove.MoodDiary.enums.UserStatus;
import com.nodove.MoodDiary.repository.UserRepository;
import com.nodove.MoodDiary.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final RedisTemplate<String, String> redisTemplate;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";
    private static final String BLACKLIST_PREFIX = "blacklist:";
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 30;
    
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다");
        }
        
        String verificationToken = UUID.randomUUID().toString();
        
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .emailVerified(false)
                .verificationToken(verificationToken)
                .verificationTokenExpiry(LocalDateTime.now().plusHours(24))
                .provider(AuthProvider.LOCAL)
                .status(UserStatus.PENDING_VERIFICATION)
                .build();
        
        UserSettings settings = UserSettings.builder()
                .user(user)
                .build();
        
        user.setUserSettings(settings);
        
        User savedUser = userRepository.save(user);
        
        // Send verification email
        emailService.sendVerificationEmail(savedUser.getEmail(), verificationToken);
        
        String accessToken = jwtTokenProvider.generateAccessToken(savedUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser);
        
        // Store refresh token in Redis
        storeRefreshToken(savedUser.getId(), refreshToken);
        
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationTime())
                .user(UserProfileResponse.builder()
                        .id(savedUser.getId())
                        .email(savedUser.getEmail())
                        .nickname(savedUser.getNickname())
                        .firstName(savedUser.getFirstName())
                        .lastName(savedUser.getLastName())
                        .profileImageUrl(savedUser.getProfileImageUrl())
                        .emailVerified(savedUser.getEmailVerified())
                        .role(savedUser.getRole())
                        .status(savedUser.getStatus())
                        .provider(savedUser.getProvider())
                        .createdAt(savedUser.getCreatedAt())
                        .build())
                .build();
    }
    
    public AuthResponse login(LoginRequest request, String clientIp, String userAgent) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("존재하지 않는 사용자입니다"));
        
        // Check if account is locked
        if (!user.isAccountNonLocked()) {
            throw new BadCredentialsException("계정이 잠겨있습니다. 잠시 후 다시 시도해주세요.");
        }
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            user.incrementLoginAttempts();
            if (user.getLoginAttempts() >= MAX_LOGIN_ATTEMPTS) {
                user.lockAccount(LOCK_DURATION_MINUTES);
                log.warn("Account locked due to too many failed login attempts: {}", user.getEmail());
            }
            userRepository.save(user);
            throw new BadCredentialsException("비밀번호가 일치하지 않습니다");
        }
        
        // Reset login attempts on successful login
        user.resetLoginAttempts();
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        
        // Store refresh token in Redis
        storeRefreshToken(user.getId(), refreshToken);
        
        log.info("User logged in successfully: {} from IP: {}", user.getEmail(), clientIp);
        
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
    
    public TokenResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw new RuntimeException("유효하지 않은 리프레시 토큰입니다");
        }
        
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        
        // Check if refresh token exists in Redis
        String storedToken = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + userId);
        if (!refreshToken.equals(storedToken)) {
            throw new RuntimeException("유효하지 않은 리프레시 토큰입니다");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다"));
        
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);
        
        // Update refresh token in Redis
        storeRefreshToken(user.getId(), newRefreshToken);
        
        return TokenResponse.of(newAccessToken, newRefreshToken, 
                jwtTokenProvider.getExpirationTime(), 
                jwtTokenProvider.getRefreshExpirationTime());
    }
    
    public void logout(String email, String refreshToken) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다"));
        
        // Remove refresh token from Redis
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + user.getId());
        
        // Add refresh token to blacklist
        if (refreshToken != null) {
            long expiration = jwtTokenProvider.getRefreshExpirationTime() / 1000;
            redisTemplate.opsForValue().set(BLACKLIST_PREFIX + refreshToken, "blacklisted", expiration, TimeUnit.SECONDS);
        }
        
        log.info("User logged out: {}", email);
    }
    
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 인증 토큰입니다"));
        
        if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("인증 토큰이 만료되었습니다");
        }
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        
        log.info("Email verified for user: {}", user.getEmail());
    }
    
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다"));
        
        if (user.getEmailVerified()) {
            throw new RuntimeException("이미 인증된 이메일입니다");
        }
        
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);
        
        emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        
        log.info("Verification email resent to: {}", email);
    }
    
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다"));
        
        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        
        log.info("Password reset email sent to: {}", email);
    }
    
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 비밀번호 재설정 토큰입니다"));
        
        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("비밀번호 재설정 토큰이 만료되었습니다");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
        
        log.info("Password reset for user: {}", user.getEmail());
    }
    
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다"));
        
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("현재 비밀번호가 일치하지 않습니다");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        log.info("Password changed for user: {}", email);
    }
    
    public UserProfileResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다"));
        
        return UserProfileResponse.builder()
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
    }
    
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }
    
    private void storeRefreshToken(Long userId, String refreshToken) {
        long expiration = jwtTokenProvider.getRefreshExpirationTime() / 1000;
        redisTemplate.opsForValue().set(REFRESH_TOKEN_PREFIX + userId, refreshToken, expiration, TimeUnit.SECONDS);
    }
}