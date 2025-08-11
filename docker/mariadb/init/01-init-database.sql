-- KB Mood Financial Diary Database Initialization
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS mood_diary CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE mood_diary;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    nickname VARCHAR(100),
    profile_image_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    auth_provider ENUM('LOCAL', 'GOOGLE', 'KAKAO') DEFAULT 'LOCAL',
    provider_id VARCHAR(255),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_provider (auth_provider, provider_id),
    INDEX idx_users_status (status)
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    notification_enabled BOOLEAN DEFAULT TRUE,
    daily_reminder_time TIME DEFAULT '21:00:00',
    target_entries_per_week INT DEFAULT 5,
    privacy_mode BOOLEAN DEFAULT FALSE,
    theme ENUM('LIGHT', 'DARK', 'AUTO') DEFAULT 'AUTO',
    language ENUM('KO', 'EN') DEFAULT 'KO',
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_settings_user_id (user_id)
);

-- Create mood_diaries table
CREATE TABLE IF NOT EXISTS mood_diaries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200),
    content TEXT,
    mood_type ENUM('VERY_HAPPY', 'HAPPY', 'NEUTRAL', 'SAD', 'VERY_SAD', 'ANGRY', 'ANXIOUS') NOT NULL,
    mood_intensity INT DEFAULT 5 CHECK (mood_intensity >= 1 AND mood_intensity <= 10),
    weather VARCHAR(50),
    location VARCHAR(200),
    tags JSON,
    image_urls JSON,
    entry_date DATE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_mood_diaries_user_date (user_id, entry_date),
    INDEX idx_mood_diaries_mood_type (mood_type),
    INDEX idx_mood_diaries_created_at (created_at),
    INDEX idx_mood_diaries_deleted (is_deleted)
);

-- Create financial_accounts table
CREATE TABLE IF NOT EXISTS financial_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    bank_code VARCHAR(10) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(100),
    account_type ENUM('CHECKING', 'SAVINGS', 'CREDIT') DEFAULT 'CHECKING',
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'KRW',
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_account (user_id, bank_code, account_number),
    INDEX idx_financial_accounts_user_id (user_id),
    INDEX idx_financial_accounts_bank_code (bank_code)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    transaction_type ENUM('INCOME', 'EXPENSE', 'TRANSFER') NOT NULL,
    category VARCHAR(50),
    subcategory VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2),
    description VARCHAR(500),
    merchant_name VARCHAR(200),
    merchant_category VARCHAR(100),
    location VARCHAR(200),
    transaction_date TIMESTAMP NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_recurring BOOLEAN DEFAULT FALSE,
    tags JSON,
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES financial_accounts(id) ON DELETE CASCADE,
    INDEX idx_transactions_user_date (user_id, transaction_date),
    INDEX idx_transactions_account_date (account_id, transaction_date),
    INDEX idx_transactions_type (transaction_type),
    INDEX idx_transactions_category (category),
    INDEX idx_transactions_amount (amount)
);

-- Create expense_categories table
CREATE TABLE IF NOT EXISTS expense_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id BIGINT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    is_system BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES expense_categories(id) ON DELETE SET NULL,
    INDEX idx_expense_categories_parent (parent_id),
    INDEX idx_expense_categories_system (is_system)
);

-- Create diary_change_logs table for audit trail
CREATE TABLE IF NOT EXISTS diary_change_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    diary_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    change_type ENUM('CREATE', 'UPDATE', 'DELETE', 'RESTORE') NOT NULL,
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diary_id) REFERENCES mood_diaries(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_diary_change_logs_diary_id (diary_id),
    INDEX idx_diary_change_logs_user_id (user_id),
    INDEX idx_diary_change_logs_changed_at (changed_at)
);

-- Create refresh_tokens table for JWT management
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_tokens_user_id (user_id),
    INDEX idx_refresh_tokens_token (token),
    INDEX idx_refresh_tokens_expires_at (expires_at)
);

-- Insert default expense categories
INSERT INTO expense_categories (name, parent_id, color, icon, is_system, sort_order) VALUES
('식비', NULL, '#EF4444', 'utensils', TRUE, 1),
('교통비', NULL, '#3B82F6', 'car', TRUE, 2),
('생활용품', NULL, '#10B981', 'shopping-cart', TRUE, 3),
('의료비', NULL, '#F59E0B', 'heart', TRUE, 4),
('문화생활', NULL, '#8B5CF6', 'film', TRUE, 5),
('교육비', NULL, '#06B6D4', 'book', TRUE, 6),
('의류', NULL, '#EC4899', 'shirt', TRUE, 7),
('통신비', NULL, '#6B7280', 'phone', TRUE, 8),
('주거비', NULL, '#84CC16', 'home', TRUE, 9),
('기타', NULL, '#64748B', 'more-horizontal', TRUE, 10);

-- Insert subcategories for 식비
INSERT INTO expense_categories (name, parent_id, color, icon, is_system, sort_order) VALUES
('외식', (SELECT id FROM expense_categories WHERE name = '식비' AND parent_id IS NULL), '#EF4444', 'utensils', TRUE, 1),
('배달음식', (SELECT id FROM expense_categories WHERE name = '식비' AND parent_id IS NULL), '#EF4444', 'truck', TRUE, 2),
('장보기', (SELECT id FROM expense_categories WHERE name = '식비' AND parent_id IS NULL), '#EF4444', 'shopping-bag', TRUE, 3),
('카페/음료', (SELECT id FROM expense_categories WHERE name = '식비' AND parent_id IS NULL), '#EF4444', 'coffee', TRUE, 4);

-- Insert subcategories for 교통비
INSERT INTO expense_categories (name, parent_id, color, icon, is_system, sort_order) VALUES
('대중교통', (SELECT id FROM expense_categories WHERE name = '교통비' AND parent_id IS NULL), '#3B82F6', 'bus', TRUE, 1),
('택시', (SELECT id FROM expense_categories WHERE name = '교통비' AND parent_id IS NULL), '#3B82F6', 'car', TRUE, 2),
('주차비', (SELECT id FROM expense_categories WHERE name = '교통비' AND parent_id IS NULL), '#3B82F6', 'square-parking', TRUE, 3),
('유류비', (SELECT id FROM expense_categories WHERE name = '교통비' AND parent_id IS NULL), '#3B82F6', 'fuel', TRUE, 4);

-- Create admin user (password: admin123!)
INSERT INTO users (email, password, nickname, email_verified, role, auth_provider) VALUES
('admin@mooddiary.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', TRUE, 'ADMIN', 'LOCAL');

-- Create admin user settings
INSERT INTO user_settings (user_id, notification_enabled, target_entries_per_week) VALUES
((SELECT id FROM users WHERE email = 'admin@mooddiary.com'), TRUE, 7);