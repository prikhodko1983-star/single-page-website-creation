-- Обновление пароля админа на хеш для пароля 'admin123'
-- Хеш сгенерирован через bcrypt с rounds=10
UPDATE admin_users 
SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'admin';