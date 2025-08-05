package com.nodove.MoodDiary.enums;

public enum ValidationConstants {
    PASSWORD_MIN_LENGTH(8),
    NICKNAME_MIN_LENGTH(2),
    NICKNAME_MAX_LENGTH(100);

    private final int value;

    ValidationConstants(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}