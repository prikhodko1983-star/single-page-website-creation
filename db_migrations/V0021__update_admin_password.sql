-- Обновление пароля администратора (логин: admin, пароль: admin123)
-- Хеш: $2b$10$N9qo8uLOickgx2ZMRZoMye
UPDATE admin_users 
SET password_hash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjKAgw5Rj.yN8UvP9bXvZJQfmLQHaWC'
WHERE username = 'admin';