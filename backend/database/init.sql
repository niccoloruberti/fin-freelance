-- FinFreelance Database Initialization

-- Create database (if using docker-compose this is automatic)
CREATE DATABASE IF NOT EXISTS finfreelance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finfreelance;

-- Create tables will be handled by TypeORM migrations
-- This file is for any initial setup or seeds

-- Insert default categories
INSERT INTO categories (id, name, type, icon, color, isDefault, createdAt, updatedAt) VALUES
(UUID(), 'Consulenza', 'income', '💼', '#10B981', true, NOW(), NOW()),
(UUID(), 'Sviluppo Software', 'income', '💻', '#3B82F6', true, NOW(), NOW()),
(UUID(), 'Formazione', 'income', '📚', '#8B5CF6', true, NOW(), NOW()),
(UUID(), 'Design', 'income', '🎨', '#EC4899', true, NOW(), NOW()),
(UUID(), 'Marketing', 'income', '📈', '#F59E0B', true, NOW(), NOW()),

(UUID(), 'Software/Tools', 'expense', '🛠️', '#6B7280', true, NOW(), NOW()),
(UUID(), 'Formazione', 'expense', '📖', '#8B5CF6', true, NOW(), NOW()),
(UUID(), 'Ufficio', 'expense', '🏢', '#059669', true, NOW(), NOW()),
(UUID(), 'Marketing', 'expense', '📣', '#F59E0B', true, NOW(), NOW()),
(UUID(), 'Trasporti', 'expense', '🚗', '#EF4444', true, NOW(), NOW()),
(UUID(), 'Altro', 'both', '📦', '#6B7280', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE name=name;

-- Note: User creation and test data should be done via seeds script
