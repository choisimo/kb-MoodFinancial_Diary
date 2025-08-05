package com.nodove.MoodDiary.enums;

public enum ValidationMessages {
    EMAIL_REQUIRED("이메일은 필수입니다"),
    EMAIL_INVALID("올바른 이메일 형식이 아닙니다"),
    PASSWORD_REQUIRED("비밀번호는 필수입니다"),
    PASSWORD_MIN_LENGTH("비밀번호는 최소 8자 이상이어야 합니다"),
    NICKNAME_REQUIRED("닉네임은 필수입니다"),
    NICKNAME_LENGTH("닉네임은 2자 이상 100자 이하여야 합니다");

    private final String message;

    ValidationMessages(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}