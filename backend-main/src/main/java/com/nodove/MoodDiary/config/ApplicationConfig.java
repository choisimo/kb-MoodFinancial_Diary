package com.nodove.MoodDiary.config;

import com.nodove.MoodDiary.enums.EmailConstants;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class ApplicationConfig {

    @Bean
    public JavaMailSender getJavaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(EmailConstants.SMTP_HOST.getStringValue());
        mailSender.setPort(EmailConstants.SMTP_PORT.getIntValue());

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", EmailConstants.SMTP_AUTH.getBooleanValue());
        props.put("mail.smtp.starttls.enable", EmailConstants.STARTTLS_ENABLE.getBooleanValue());
        props.put("mail.debug", "true");

        return mailSender;
    }

    // Spring Boot 자동 설정을 사용하여 OAuth2 클라이언트 등록

}