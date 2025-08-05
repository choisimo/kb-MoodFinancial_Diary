package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.dto.AuthResponse;
import com.nodove.MoodDiary.dto.LoginRequest;
import com.nodove.MoodDiary.dto.SignupRequest;
import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.entity.UserSettings;
import com.nodove.MoodDiary.repository.UserRepository;
import com.nodove.MoodDiary.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다");
        }
        
        String verificationToken = UUID.randomUUID().toString();
        
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .emailVerified(false)
                .verificationToken(verificationToken)
                .build();
        
        UserSettings settings = UserSettings.builder()
                .user(user)
                .build();
        
        user.setUserSettings(settings);
        
        User savedUser = userRepository.save(user);
        
        // Send verification email
        emailService.sendVerificationEmail(savedUser.getEmail(), verificationToken);
        
        String token = jwtTokenProvider.generateToken(savedUser.getEmail(), savedUser.getId());
        
        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .nickname(savedUser.getNickname())
                .emailVerified(savedUser.getEmailVerified())
                .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다");
        }
        
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getId());
        
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .emailVerified(user.getEmailVerified())
                .build();
    }
    
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 인증 토큰입니다"));
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }
}