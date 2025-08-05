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
            message.setSubject("감정 다이어리 이메일 인증");
            message.setText(
                "안녕하세요!\n\n" +
                "감정 다이어리 회원가입을 완료하기 위해 아래 링크를 클릭해주세요:\n\n" +
                "http://localhost:3000/verify-email?token=" + verificationToken + "\n\n" +
                "감사합니다."
            );
            
            mailSender.send(message);
            log.info("Verification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", toEmail, e);
        }
    }
}