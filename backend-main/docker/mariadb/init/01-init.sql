-- KB Mood Financial Diary Database Initialization
-- Character set and collation settings
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS kb_mood_diary 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE kb_mood_diary;

-- Grant privileges to user
GRANT ALL PRIVILEGES ON kb_mood_diary.* TO 'kb_user'@'%';
FLUSH PRIVILEGES;

-- Create indexes for better performance (will be created by JPA, but good to have)
-- These will be created automatically by Spring Boot JPA
