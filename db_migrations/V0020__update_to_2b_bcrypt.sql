-- Обновляем пароль с $2b$ префиксом bcrypt (новая версия)
-- Пароль: admin123
UPDATE admin_users 
SET password_hash = '$2b$10$dtC8AH7xOO2GJHF.RlRXbu1JDXmlw61gdyvU617UFl9zcfFfa/0nG'
WHERE username = 'admin';