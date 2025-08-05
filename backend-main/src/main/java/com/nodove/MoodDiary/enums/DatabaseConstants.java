package com.nodove.MoodDiary.enums;

public enum DatabaseConstants {
    MOOD_DIARY_DB_NAME("mood_diary"),
    MARIADB_DIALECT("org.hibernate.dialect.MariaDBDialect"),
    MARIADB_DRIVER("org.mariadb.jdbc.Driver");

    private final String value;

    DatabaseConstants(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}