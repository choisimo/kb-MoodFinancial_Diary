package com.nodove.MoodDiary.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void sendVerificationEmail(String toEmail, String verificationToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("KB 무드 금융 다이어리 이메일 인증");
            message.setText(
                "안녕하세요!\n\n" +
                "KB 무드 금융 다이어리 회원가입을 완료하기 위해 아래 링크를 클릭해주세요:\n\n" +
                "http://localhost:3000/verify-email?token=" + verificationToken + "\n\n" +
                "링크는 24시간 후 만료됩니다.\n\n" +
                "감사합니다."
            );
            
            mailSender.send(message);
            log.info("Verification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", toEmail, e);
            throw new RuntimeException("이메일 전송에 실패했습니다.", e);
        }
    }
    
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("KB 무드 금융 다이어리 비밀번호 재설정");
            message.setText(
                "안녕하세요!\n\n" +
                "비밀번호 재설정을 위해 아래 링크를 클릭해주세요:\n\n" +
                "http://localhost:3000/reset-password?token=" + resetToken + "\n\n" +
                "링크는 1시간 후 만료됩니다.\n\n" +
                "만약 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시해주세요.\n\n" +
                "감사합니다."
            );
            
            mailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("비밀번호 재설정 이메일 전송에 실패했습니다.", e);
        }
    }
    
    public void sendWelcomeEmail(String toEmail, String nickname) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("KB 무드 금융 다이어리에 오신 것을 환영합니다!");
            message.setText(
                nickname + "님, 안녕하세요!\n\n" +
                "KB 무드 금융 다이어리 회원가입을 완료해주셔서 감사합니다.\n\n" +
                "이제 감정과 금융을 함께 관리하는 새로운 경험을 시작해보세요!\n\n" +
                "궁금한 점이 있으시면 언제든 문의해주세요.\n\n" +
                "감사합니다."
            );
            
            mailSender.send(message);
            log.info("Welcome email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
            // Welcome email failure should not block the process
        }
    }
}