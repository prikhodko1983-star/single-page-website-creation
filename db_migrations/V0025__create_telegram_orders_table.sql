-- Таблица для хранения заявок из Telegram
CREATE TABLE IF NOT EXISTS telegram_orders (
    id SERIAL PRIMARY KEY,
    telegram_chat_id BIGINT NOT NULL,
    telegram_username VARCHAR(255),
    telegram_first_name VARCHAR(255),
    telegram_last_name VARCHAR(255),
    message TEXT,
    photo_urls TEXT[],
    status VARCHAR(50) DEFAULT 'new',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telegram_orders_chat_id ON telegram_orders(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_orders_status ON telegram_orders(status);
CREATE INDEX IF NOT EXISTS idx_telegram_orders_created_at ON telegram_orders(created_at DESC);