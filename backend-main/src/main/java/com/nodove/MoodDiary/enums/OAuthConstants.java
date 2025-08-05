package com.nodove.MoodDiary.enums;

public enum OAuthConstants {
    GOOGLE_PROVIDER("google"),
    KAKAO_PROVIDER("kakao"),
    OAUTH_REDIRECT_URI("{baseUrl}/login/oauth2/code/{registrationId}"),
    
    // Kakao OAuth URLs
    KAKAO_AUTHORIZATION_URI("https://kauth.kakao.com/oauth/authorize"),
    KAKAO_TOKEN_URI("https://kauth.kakao.com/oauth/token"),
    KAKAO_USER_INFO_URI("https://kapi.kakao.com/v2/user/me"),
    KAKAO_USER_NAME_ATTRIBUTE("id"),
    
    // OAuth Grant Types
    AUTHORIZATION_GRANT_TYPE("authorization_code"),
    CLIENT_AUTHENTICATION_METHOD("client_secret_post");

    private final String value;

    OAuthConstants(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}