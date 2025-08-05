package com.nodove.MoodDiary.enums;

/**
 * Authentication provider enumeration
 */
public enum AuthProvider {
    LOCAL("로컬"),
    GOOGLE("구글"),
    KAKAO("카카오"),
    NAVER("네이버"),
    FACEBOOK("페이스북");
    
    private final String displayName;
    
    AuthProvider(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isOAuth2Provider() {
        return this != LOCAL;
    }
    
    public boolean isLocal() {
        return this == LOCAL;
    }
}
