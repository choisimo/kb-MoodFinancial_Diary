package com.nodove.MoodDiary.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.file")
public class FileStorageProperties {
    
    private String uploadDir = "uploads";
    private String profileImageDir = "uploads/profiles";
    private long maxFileSize = 5 * 1024 * 1024; // 5MB
    private String[] allowedImageTypes = {"image/jpeg", "image/jpg", "image/png", "image/gif"};
    
    public String getUploadDir() {
        return uploadDir;
    }
    
    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }
    
    public String getProfileImageDir() {
        return profileImageDir;
    }
    
    public void setProfileImageDir(String profileImageDir) {
        this.profileImageDir = profileImageDir;
    }
    
    public long getMaxFileSize() {
        return maxFileSize;
    }
    
    public void setMaxFileSize(long maxFileSize) {
        this.maxFileSize = maxFileSize;
    }
    
    public String[] getAllowedImageTypes() {
        return allowedImageTypes;
    }
    
    public void setAllowedImageTypes(String[] allowedImageTypes) {
        this.allowedImageTypes = allowedImageTypes;
    }
}