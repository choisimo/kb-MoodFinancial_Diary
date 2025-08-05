package com.nodove.MoodDiary.enums;

public enum AuthConstants {
    TOKEN_TYPE("Bearer"),
    JWT_EXPIRATION_MS(86400000L), // 24 hours in milliseconds
    JWT_CLAIM_USER_ID("userId");

    private final Object value;

    AuthConstants(Object value) {
        this.value = value;
    }

    public String getStringValue() {
        return (String) value;
    }

    public Long getLongValue() {
        return (Long) value;
    }
}