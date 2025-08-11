package com.nodove.mood_diary.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "infisical")
@Data
public class InfisicalConfig {
    private String host = "http://localhost:8222";
    private String projectId;
    private String environment = "dev";
    private String serviceToken;
    private boolean enabled = false;
}