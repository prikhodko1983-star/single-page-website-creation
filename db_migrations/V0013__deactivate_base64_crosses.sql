-- Деактивация записей крестов с base64 изображениями
UPDATE t_p78642605_single_page_website_.crosses 
SET is_active = false, 
    image_url = ''
WHERE LENGTH(image_url) > 1000;