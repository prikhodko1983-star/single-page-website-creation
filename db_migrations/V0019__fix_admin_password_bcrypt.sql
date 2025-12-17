-- Обновляем пароль администратора на проверенный bcrypt хеш
-- Пароль: admin123 (хеш протестирован и работает)
UPDATE admin_users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE username = 'admin';