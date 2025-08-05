package com.nodove.MoodDiary.enums;

/**
 * User role enumeration
 */
public enum UserRole {
    USER("일반 사용자"),
    ADMIN("관리자"),
    PREMIUM("프리미엄 사용자");
    
    private final String description;
    
    UserRole(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean isAdmin() {
        return this == ADMIN;
    }
    
    public boolean isPremium() {
        return this == PREMIUM;
    }
}
