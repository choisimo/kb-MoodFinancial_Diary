package com.nodove.MoodDiary.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
@Slf4j
public class FCMConfig {

    @Value("${firebase.service-account-file:firebase-service-account.json}")
    private String serviceAccountFile;

    @Value("${firebase.database-url:}")
    private String databaseUrl;

    @Bean
    @ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
    public FirebaseApp firebaseApp() {
        try {
            // 이미 초기화된 경우 기존 인스턴스 반환
            if (!FirebaseApp.getApps().isEmpty()) {
                return FirebaseApp.getInstance();
            }

            // 서비스 계정 키 파일 로드
            InputStream serviceAccount;
            try {
                serviceAccount = new ClassPathResource(serviceAccountFile).getInputStream();
            } catch (IOException e) {
                log.warn("Firebase service account file not found in classpath: {}. FCM will be disabled.", serviceAccountFile);
                return null;
            }

            FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount));

            // 데이터베이스 URL이 설정된 경우 추가
            if (databaseUrl != null && !databaseUrl.isEmpty()) {
                optionsBuilder.setDatabaseUrl(databaseUrl);
            }

            FirebaseOptions options = optionsBuilder.build();
            FirebaseApp firebaseApp = FirebaseApp.initializeApp(options);
            
            log.info("Firebase application initialized successfully");
            return firebaseApp;
            
        } catch (IOException e) {
            log.error("Failed to initialize Firebase application", e);
            return null;
        }
    }

    @Bean
    @ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
    public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
        if (firebaseApp == null) {
            log.warn("FirebaseApp is null, FCM messaging will be disabled");
            return null;
        }
        return FirebaseMessaging.getInstance(firebaseApp);
    }
}