package com.nodove.MoodDiary.enums;

public enum OAuth2Scopes {
    // Google scopes
    GOOGLE_EMAIL("email"),
    GOOGLE_PROFILE("profile"),
    
    // Kakao scopes
    KAKAO_PROFILE_NICKNAME("profile_nickname"),
    KAKAO_ACCOUNT_EMAIL("account_email");

    private final String scope;

    OAuth2Scopes(String scope) {
        this.scope = scope;
    }

    public String getScope() {
        return scope;
    }
}