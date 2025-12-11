-- Создание таблицы для цветов (аналогично крестам)
CREATE TABLE IF NOT EXISTS t_p78642605_single_page_website_.flowers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 999,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_flowers_display_order ON t_p78642605_single_page_website_.flowers(display_order);
CREATE INDEX IF NOT EXISTS idx_flowers_is_active ON t_p78642605_single_page_website_.flowers(is_active);

-- Добавление примеров цветов
INSERT INTO t_p78642605_single_page_website_.flowers (name, image_url, display_order) VALUES
('Роза красная', 'https://cdn.poehali.dev/files/flower-icon.png', 1),
('Гвоздика', 'https://cdn.poehali.dev/files/flower-icon.png', 2),
('Лилия', 'https://cdn.poehali.dev/files/flower-icon.png', 3)
ON CONFLICT DO NOTHING;