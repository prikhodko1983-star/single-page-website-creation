-- Создаем таблицу для хранения элементов галереи
CREATE TABLE IF NOT EXISTS gallery_items (
    id SERIAL PRIMARY KEY,
    item_id VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем текущие дефолтные элементы галереи
INSERT INTO gallery_items (item_id, type, url, title, description, display_order) VALUES
('1', 'image', 'https://cdn.poehali.dev/files/bbcac88c-6deb-429e-b227-40488c7c5273.jpg', 'Комплексное благоустройство', 'Установка памятников и уход за территорией', 1),
('2', 'image', 'https://cdn.poehali.dev/files/58ba923f-a428-4ebd-a17d-2cd8e5b523a8.jpg', 'Художественная гравировка', 'Индивидуальный дизайн и качественное исполнение', 2),
('3', 'image', 'https://cdn.poehali.dev/files/c80c1bd4-c413-425a-a1fc-91dbb36a8de4.jpg', 'Горизонтальные памятники', 'Классический дизайн из чёрного гранита', 3),
('4', 'image', 'https://cdn.poehali.dev/files/692de6e1-c8ae-42f8-ac61-0d8770aeb8ec.png', 'Вертикальные памятники', 'Традиционная форма, проверенная временем', 4),
('5', 'image', 'https://cdn.poehali.dev/files/a6e29eb2-0f18-47ca-917e-adac360db4c3.jpeg', 'Эксклюзивные проекты', 'Уникальный дизайн по индивидуальному заказу', 5),
('6', 'image', 'https://cdn.poehali.dev/files/e1b733d5-8a5c-4f60-9df4-9e05bb711cf9.jpeg', 'Комплексы на могилу', 'Полное обустройство с оградой и цветником', 6)
ON CONFLICT (item_id) DO NOTHING;

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery_items(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_item_id ON gallery_items(item_id);