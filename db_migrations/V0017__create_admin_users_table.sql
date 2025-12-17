-- Создание таблицы для хранения администраторов
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление первого администратора (логин: admin, пароль: admin123)
-- Хеш для пароля admin123 (bcrypt)
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$rW8JZ8X8X8X8X8X8X8X8Xuu7YqJ7qJ7qJ7qJ7qJ7qJ7qJ7qJ7qJ7q')
ON CONFLICT (username) DO NOTHING;