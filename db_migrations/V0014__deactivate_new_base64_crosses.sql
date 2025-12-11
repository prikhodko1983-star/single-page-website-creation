-- Деактивация новых записей крестов с base64 изображениями
UPDATE t_p78642605_single_page_website_.crosses 
SET is_active = false
WHERE id IN (11, 12);