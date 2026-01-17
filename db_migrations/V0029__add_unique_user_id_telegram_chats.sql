-- Добавляем уникальный индекс на user_id в telegram_chats
CREATE UNIQUE INDEX IF NOT EXISTS telegram_chats_user_id_unique 
ON telegram_chats (user_id);
