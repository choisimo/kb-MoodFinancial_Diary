package com.nodove.mood_diary.config;

import com.nodove.mood_diary.service.InfisicalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "infisical.enabled", havingValue = "true")
public class InfisicalPropertyConfiguration {
    
    @Autowired(required = false)
    private InfisicalService infisicalService;
    
    private final Environment environment;
    
    /**
     * Infisical에서 시크릿을 가져오는 헬퍼 메서드
     */
    public String getInfisicalSecret(String key) {
        if (infisicalService != null) {
            return infisicalService.getSecret(key, environment.getProperty(key));
        }
        return environment.getProperty(key);
    }
    
    // Database Configuration
    @Bean
    public String databaseUrl() {
        return getInfisicalSecret("DATABASE_URL");
    }
    
    @Bean
    public String databaseUsername() {
        return getInfisicalSecret("DATABASE_USERNAME");
    }
    
    @Bean
    public String databasePassword() {
        return getInfisicalSecret("DATABASE_PASSWORD");
    }
    
    // Redis Configuration
    @Bean
    public String redisHost() {
        return getInfisicalSecret("REDIS_HOST");
    }
    
    @Bean
    public String redisPort() {
        return getInfisicalSecret("REDIS_PORT");
    }
    
    @Bean
    public String redisPassword() {
        return getInfisicalSecret("REDIS_PASSWORD");
    }
    
    // JWT Configuration
    @Bean
    public String jwtSecret() {
        return getInfisicalSecret("JWT_SECRET");
    }
    
    // OAuth Configuration
    @Bean
    public String googleOAuthClientId() {
        return getInfisicalSecret("GOOGLE_OAUTH_CLIENT_ID");
    }
    
    @Bean
    public String googleOAuthClientSecret() {
        return getInfisicalSecret("GOOGLE_OAUTH_CLIENT_SECRET");
    }
    
    @Bean
    public String kakaoOAuthClientId() {
        return getInfisicalSecret("KAKAO_OAUTH_CLIENT_ID");
    }
    
    @Bean
    public String kakaoOAuthClientSecret() {
        return getInfisicalSecret("KAKAO_OAUTH_CLIENT_SECRET");
    }
    
    // SMTP Configuration
    @Bean
    public String smtpHost() {
        return getInfisicalSecret("SMTP_HOST");
    }
    
    @Bean
    public String smtpPort() {
        return getInfisicalSecret("SMTP_PORT");
    }
    
    @Bean
    public String smtpUsername() {
        return getInfisicalSecret("SMTP_USERNAME");
    }
    
    @Bean
    public String smtpPassword() {
        return getInfisicalSecret("SMTP_PASSWORD");
    }
    
    // Application Configuration
    @Bean
    public String frontendUrl() {
        return getInfisicalSecret("FRONTEND_URL");
    }
    
    @Bean
    public String corsAllowedOrigins() {
        return getInfisicalSecret("CORS_ALLOWED_ORIGINS");
    }
    
    @Bean
    public String uploadPath() {
        return getInfisicalSecret("UPLOAD_PATH");
    }
    
    // External API Keys
    @Bean
    public String kakaoMapKey() {
        return getInfisicalSecret("KAKAO_MAP_KEY");
    }
    
    @Bean
    public String openAIApiKey() {
        return getInfisicalSecret("OPENAI_API_KEY");
    }
    
    @Bean
    public String paymentApiKey() {
        return getInfisicalSecret("PAYMENT_API_KEY");
    }
    
    // Security Keys
    @Bean
    public String encryptionKey() {
        return getInfisicalSecret("ENCRYPTION_KEY");
    }
    
    @Bean
    public String appSecret() {
        return getInfisicalSecret("APP_SECRET");
    }
}