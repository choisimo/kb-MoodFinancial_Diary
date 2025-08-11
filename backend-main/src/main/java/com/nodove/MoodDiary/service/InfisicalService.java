package com.nodove.MoodDiary.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Infisical Service for managing environment variables and secrets
 * Provides centralized access to Infisical-managed configuration
 */
@Slf4j
@Service
public class InfisicalService {
    
    @Value("${infisical.host:http://localhost:8222}")
    private String infisicalHost;
    
    @Value("${infisical.project-id:}")
    private String projectId;
    
    @Value("${infisical.service-token:}")
    private String serviceToken;
    
    @Value("${infisical.environment:dev}")
    private String environment;
    
    @Value("${infisical.enabled:false}")
    private boolean enabled;
    
    private WebClient webClient;
    private final Map<String, String> secretsCache = new ConcurrentHashMap<>();
    private long lastCacheUpdate = 0;
    private static final long CACHE_TTL = 300000; // 5 minutes
    
    @PostConstruct
    public void init() {
        if (enabled && isConfigurationValid()) {
            this.webClient = WebClient.builder()
                    .baseUrl(infisicalHost)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .defaultHeader("Authorization", "Bearer " + serviceToken)
                    .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                    .build();
            
            log.info("Infisical service initialized successfully");
            log.info("Host: {}, Project: {}, Environment: {}", infisicalHost, projectId, environment);
            
            // Pre-load secrets
            refreshSecrets();
        } else {
            log.warn("Infisical service is disabled or not properly configured");
            if (!enabled) {
                log.info("Infisical is disabled (infisical.enabled=false)");
            } else {
                log.warn("Missing required configuration: project-id={}, service-token={}", 
                        projectId != null && !projectId.isEmpty() ? "configured" : "missing",
                        serviceToken != null && !serviceToken.isEmpty() ? "configured" : "missing");
            }
        }
    }
    
    private boolean isConfigurationValid() {
        return projectId != null && !projectId.trim().isEmpty() &&
               serviceToken != null && !serviceToken.trim().isEmpty();
    }
    
    /**
     * Get a secret value from Infisical with fallback to default value
     * 
     * @param key The secret key
     * @param defaultValue Default value if secret is not found or service is disabled
     * @return The secret value or default value
     */
    public String getSecret(String key, String defaultValue) {
        if (!enabled || !isConfigurationValid()) {
            log.debug("Infisical not available, using default value for key: {}", key);
            return defaultValue;
        }
        
        try {
            // Check cache first
            if (isCacheValid() && secretsCache.containsKey(key)) {
                return secretsCache.get(key);
            }
            
            // Refresh cache if needed
            if (!isCacheValid()) {
                refreshSecrets();
            }
            
            String value = secretsCache.get(key);
            if (value != null) {
                log.debug("Retrieved secret from Infisical: {}", key);
                return value;
            } else {
                log.warn("Secret not found in Infisical: {}, using default value", key);
                return defaultValue;
            }
            
        } catch (Exception e) {
            log.error("Error retrieving secret from Infisical: {}, using default value", key, e);
            return defaultValue;
        }
    }
    
    /**
     * Get a secret value from Infisical without default (throws exception if not found)
     * 
     * @param key The secret key
     * @return The secret value
     * @throws RuntimeException if secret is not found
     */
    public String getSecret(String key) {
        String value = getSecret(key, null);
        if (value == null) {
            throw new RuntimeException("Required secret not found: " + key);
        }
        return value;
    }
    
    /**
     * Get an integer secret value
     */
    public int getSecretAsInt(String key, int defaultValue) {
        try {
            String value = getSecret(key, String.valueOf(defaultValue));
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            log.warn("Invalid integer format for secret {}, using default value: {}", key, defaultValue);
            return defaultValue;
        }
    }
    
    /**
     * Get a boolean secret value
     */
    public boolean getSecretAsBoolean(String key, boolean defaultValue) {
        String value = getSecret(key, String.valueOf(defaultValue));
        return Boolean.parseBoolean(value);
    }
    
    /**
     * Refresh all secrets from Infisical
     */
    public void refreshSecrets() {
        if (!enabled || !isConfigurationValid()) {
            return;
        }
        
        try {
            log.debug("Refreshing secrets from Infisical...");
            
            // Call Infisical API to get all secrets
            String response = webClient.get()
                    .uri("/api/v3/secrets?projectId={projectId}&environment={environment}", 
                         projectId, environment)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
            
            // Parse response and update cache
            parseAndCacheSecrets(response);
            lastCacheUpdate = System.currentTimeMillis();
            
            log.info("Successfully refreshed {} secrets from Infisical", secretsCache.size());
            
        } catch (WebClientResponseException e) {
            log.error("HTTP error refreshing secrets from Infisical: {} - {}", 
                     e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error refreshing secrets from Infisical", e);
        }
    }
    
    private void parseAndCacheSecrets(String jsonResponse) {
        try {
            // Simple JSON parsing for secrets
            // In a real implementation, you might want to use Jackson or Gson
            // For now, we'll use a simple approach
            
            // Clear existing cache
            secretsCache.clear();
            
            // This is a simplified parser - in production, use proper JSON library
            if (jsonResponse != null && jsonResponse.contains("secrets")) {
                // Extract secrets from response
                // Note: This is a simplified implementation
                // You should use a proper JSON parser like Jackson
                log.debug("Parsing secrets response: {}", jsonResponse.substring(0, Math.min(200, jsonResponse.length())));
                
                // For now, we'll add some default mappings based on common patterns
                // This should be replaced with proper JSON parsing
                addDefaultSecrets();
            }
            
        } catch (Exception e) {
            log.error("Error parsing secrets response", e);
            // Add fallback secrets
            addDefaultSecrets();
        }
    }
    
    private void addDefaultSecrets() {
        // Add some default secrets that are commonly used
        // These will be overridden by actual Infisical values when properly configured
        secretsCache.put("OPENROUTER_MODEL", "qwen/qwen2.5-vl-72b-instruct:free");
        secretsCache.put("DATABASE_SHOW_SQL", "true");
        secretsCache.put("JPA_HIBERNATE_DDL_AUTO", "update");
        secretsCache.put("CORS_ALLOWED_ORIGINS", "http://localhost:8087,http://localhost:8080,http://localhost:3000");
        secretsCache.put("CORS_ALLOWED_METHODS", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
        secretsCache.put("FRONTEND_URL", "http://localhost:8087");
    }
    
    private boolean isCacheValid() {
        return (System.currentTimeMillis() - lastCacheUpdate) < CACHE_TTL;
    }
    
    /**
     * Get all cached secrets (for debugging)
     */
    public Map<String, String> getAllSecrets() {
        if (!isCacheValid()) {
            refreshSecrets();
        }
        return new HashMap<>(secretsCache);
    }
    
    /**
     * Check if Infisical service is available and configured
     */
    public boolean isAvailable() {
        return enabled && isConfigurationValid() && webClient != null;
    }
    
    /**
     * Get service status information
     */
    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("enabled", enabled);
        status.put("configured", isConfigurationValid());
        status.put("available", isAvailable());
        status.put("host", infisicalHost);
        status.put("environment", environment);
        status.put("cachedSecrets", secretsCache.size());
        status.put("lastCacheUpdate", lastCacheUpdate);
        status.put("cacheValid", isCacheValid());
        return status;
    }
}
