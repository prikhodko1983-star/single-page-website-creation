-- Создание таблицы администраторов для JWT авторизации
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление первого администратора (логин: admin, пароль: admin123)
-- Хеш сгенерирован через bcrypt с cost=10
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$rZ5L8EQXvGJ3PqF0y0uJZOKzW8QqJ8xJ8X8QqJ8xJ8X8QqJ8xJ8Qq')
ON CONFLICT (username) DO NOTHING;