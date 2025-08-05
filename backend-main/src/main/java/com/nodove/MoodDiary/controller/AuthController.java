package com.nodove.MoodDiary.controller;

import com.nodove.MoodDiary.dto.*;
import com.nodove.MoodDiary.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        log.info("회원가입 요청: {}", request.getEmail());
        AuthResponse response = authService.signup(request);
        return ResponseEntity.ok(ApiResponse.success("회원가입이 완료되었습니다.", response));
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        log.info("로그인 요청: {}", request.getEmail());
        String clientIp = getClientIpAddress(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        
        AuthResponse response = authService.login(request, clientIp, userAgent);
        return ResponseEntity.ok(ApiResponse.success("로그인이 완료되었습니다.", response));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("토큰 갱신 요청");
        TokenResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("토큰이 갱신되었습니다.", response));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> request) {
        log.info("로그아웃 요청: {}", userDetails.getUsername());
        String refreshToken = request.get("refreshToken");
        authService.logout(userDetails.getUsername(), refreshToken);
        return ResponseEntity.ok(ApiResponse.success("로그아웃이 완료되었습니다.", null));
    }
    
    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        log.info("이메일 인증 요청: {}", token);
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("이메일 인증이 완료되었습니다.", null));
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerificationEmail(@Valid @RequestBody ResendVerificationRequest request) {
        log.info("인증 메일 재발송 요청: {}", request.getEmail());
        authService.resendVerificationEmail(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("인증 메일이 재발송되었습니다.", null));
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("비밀번호 재설정 요청: {}", request.getEmail());
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("비밀번호 재설정 메일이 발송되었습니다.", null));
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("비밀번호 재설정 실행: {}", request.getToken());
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("비밀번호가 재설정되었습니다.", null));
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody ChangePasswordRequest request) {
        log.info("비밀번호 변경 요청: {}", userDetails.getUsername());
        authService.changePassword(userDetails.getUsername(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("비밀번호가 변경되었습니다.", null));
    }
    
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("현재 사용자 정보 요청: {}", userDetails.getUsername());
        UserProfileResponse response = authService.getCurrentUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("사용자 정보를 조회했습니다.", response));
    }
    
    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkEmailAvailability(@RequestParam String email) {
        log.info("이메일 중복 확인: {}", email);
        boolean available = authService.isEmailAvailable(email);
        return ResponseEntity.ok(ApiResponse.success("이메일 중복 확인이 완료되었습니다.", Map.of("available", available)));
    }
    
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("인증 서비스가 정상 작동 중입니다.", Map.of("status", "UP", "timestamp", String.valueOf(System.currentTimeMillis()))));
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}