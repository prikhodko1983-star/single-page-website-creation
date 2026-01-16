-- Таблица для хранения чатов с клиентами
CREATE TABLE IF NOT EXISTS telegram_chats (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    last_message_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица для хранения истории сообщений
CREATE TABLE IF NOT EXISTS telegram_messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL,
    user_id BIGINT NOT NULL,
    message_text TEXT,
    is_from_client BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_telegram_chats_user_id ON telegram_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_chat_id ON telegram_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_created_at ON telegram_messages(created_at DESC);