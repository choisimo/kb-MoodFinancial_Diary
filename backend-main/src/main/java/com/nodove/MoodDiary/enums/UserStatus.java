package com.nodove.MoodDiary.enums;

/**
 * User status enumeration
 */
public enum UserStatus {
    ACTIVE("활성"),
    INACTIVE("비활성"),
    SUSPENDED("정지"),
    DELETED("삭제됨"),
    PENDING_VERIFICATION("이메일 인증 대기");
    
    private final String description;
    
    UserStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean isActive() {
        return this == ACTIVE;
    }
    
    public boolean canLogin() {
        return this == ACTIVE;
    }
}
