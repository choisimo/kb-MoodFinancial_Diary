package com.nodove.MoodDiary.enums;

public enum EmailConstants {
    SMTP_HOST("smtp.gmail.com"),
    SMTP_PORT(587),
    SMTP_AUTH(true),
    STARTTLS_ENABLE(true);

    private final Object value;

    EmailConstants(Object value) {
        this.value = value;
    }

    public String getStringValue() {
        return (String) value;
    }

    public Integer getIntValue() {
        return (Integer) value;
    }

    public Boolean getBooleanValue() {
        return (Boolean) value;
    }
}