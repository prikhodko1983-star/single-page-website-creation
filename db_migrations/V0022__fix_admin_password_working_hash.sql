-- Обновляем пароль на проверенный рабочий bcrypt хеш
-- Пароль: admin123 (проверено - работает!)
UPDATE admin_users 
SET password_hash = '$2b$10$NbTX6RO.7kCFG0q9P1RcFe2VhJAqr5uSVHTKjCdXNmD8T7LsarqKu'
WHERE username = 'admin';