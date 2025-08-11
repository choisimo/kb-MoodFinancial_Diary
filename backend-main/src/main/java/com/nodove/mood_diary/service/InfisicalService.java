package com.nodove.mood_diary.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nodove.mood_diary.config.InfisicalConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "infisical.enabled", havingValue = "true")
public class InfisicalService {
    
    private final InfisicalConfig infisicalConfig;
    private final ObjectMapper objectMapper;
    private WebClient webClient;
    
    // 캐시를 위한 맵
    private final Map<String, String> secretCache = new ConcurrentHashMap<>();
    
    @PostConstruct
    public void initWebClient() {
        this.webClient = WebClient.builder()
            .baseUrl(infisicalConfig.getHost())
            .defaultHeader("Authorization", "Bearer " + infisicalConfig.getServiceToken())
            .defaultHeader("Content-Type", "application/json")
            .build();
        
        log.info("Infisical service initialized with host: {}", infisicalConfig.getHost());
    }
    
    public String getSecret(String secretKey) {
        return getSecret(secretKey, null);
    }
    
    public String getSecret(String secretKey, String defaultValue) {
        // 캐시에서 먼저 확인
        if (secretCache.containsKey(secretKey)) {
            return secretCache.get(secretKey);
        }
        
        try {
            String response = webClient.get()
                .uri("/api/v3/secrets/{secretKey}?workspaceId={projectId}&environment={environment}", 
                     secretKey, infisicalConfig.getProjectId(), infisicalConfig.getEnvironment())
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(10))
                .block();
            
            String secretValue = parseSecretValue(response);
            if (secretValue != null) {
                secretCache.put(secretKey, secretValue);
                return secretValue;
            }
        } catch (Exception e) {
            log.error("Failed to fetch secret: {}", secretKey, e);
        }
        
        return defaultValue;
    }
    
    public Map<String, String> getAllSecrets() {
        try {
            String response = webClient.get()
                .uri("/api/v3/secrets?workspaceId={projectId}&environment={environment}", 
                     infisicalConfig.getProjectId(), infisicalConfig.getEnvironment())
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(30))
                .block();
            
            return parseAllSecrets(response);
        } catch (Exception e) {
            log.error("Failed to fetch all secrets", e);
            return new HashMap<>();
        }
    }
    
    private String parseSecretValue(String response) {
        try {
            JsonNode jsonNode = objectMapper.readTree(response);
            JsonNode secret = jsonNode.get("secret");
            if (secret != null) {
                return secret.get("secretValue").asText();
            }
        } catch (Exception e) {
            log.error("Failed to parse secret response", e);
        }
        return null;
    }
    
    private Map<String, String> parseAllSecrets(String response) {
        Map<String, String> secrets = new HashMap<>();
        try {
            JsonNode jsonNode = objectMapper.readTree(response);
            JsonNode secretsArray = jsonNode.get("secrets");
            if (secretsArray != null && secretsArray.isArray()) {
                for (JsonNode secret : secretsArray) {
                    String key = secret.get("secretKey").asText();
                    String value = secret.get("secretValue").asText();
                    secrets.put(key, value);
                    secretCache.put(key, value); // 캐시에도 저장
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse all secrets response", e);
        }
        return secrets;
    }
    
    public void clearCache() {
        secretCache.clear();
        log.info("Infisical secret cache cleared");
    }
    
    public void refreshSecret(String secretKey) {
        secretCache.remove(secretKey);
        getSecret(secretKey);
    }
}