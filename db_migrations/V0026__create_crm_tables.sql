-- Таблица клиентов
CREATE TABLE IF NOT EXISTS crm_clients (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    telegram_username TEXT,
    full_name TEXT NOT NULL,
    phone TEXT,
    first_contact TIMESTAMP DEFAULT NOW(),
    last_contact TIMESTAMP DEFAULT NOW()
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS crm_messages (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES crm_clients(id),
    telegram_id BIGINT NOT NULL,
    message_text TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_crm_clients_telegram_id ON crm_clients(telegram_id);
CREATE INDEX IF NOT EXISTS idx_crm_messages_client_id ON crm_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_crm_messages_created_at ON crm_messages(created_at DESC);