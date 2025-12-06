-- Создание таблицы категорий товаров
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы товаров
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON UPDATE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    old_price DECIMAL(10, 2),
    image_url TEXT,
    gallery_urls TEXT[], -- массив URL дополнительных изображений
    in_stock BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    material VARCHAR(255),
    size VARCHAR(255),
    weight VARCHAR(255),
    color VARCHAR(255),
    metadata JSONB, -- дополнительные характеристики
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации поиска
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Вставка начальных категорий
INSERT INTO categories (name, slug, description, display_order) VALUES
('Одиночные памятники', 'single', 'Классические памятники для одного человека', 1),
('Двойные памятники', 'double', 'Памятники для двух человек', 2),
('Элитные памятники', 'elite', 'Эксклюзивные памятники премиум класса', 3),
('Детские памятники', 'children', 'Памятники для детей', 4);

-- Вставка примеров товаров
INSERT INTO products (category_id, name, slug, description, price, old_price, in_stock, is_featured, material, size, display_order) VALUES
(1, 'Памятник №1 "Классика"', 'classic-1', 'Классический вертикальный памятник из карельского гранита с полированной поверхностью', 45000.00, 55000.00, true, true, 'Карельский гранит', '100x50x8 см', 1),
(1, 'Памятник №2 "Элегант"', 'elegant-2', 'Элегантный памятник с округлым верхом из габбро-диабаза', 52000.00, NULL, true, true, 'Габбро-диабаз', '110x55x8 см', 2),
(2, 'Памятник №3 "Вдвоем"', 'together-3', 'Двойной памятник с гравировкой портретов', 85000.00, 95000.00, true, true, 'Карельский гранит', '120x60x10 см', 3),
(3, 'Памятник №4 "Элит"', 'elite-4', 'Эксклюзивный памятник с художественной резьбой и позолотой', 150000.00, NULL, true, true, 'Мрамор', '150x70x12 см', 4),
(1, 'Памятник №5 "Простота"', 'simple-5', 'Лаконичный памятник с минималистичным дизайном', 38000.00, NULL, true, false, 'Габбро', '95x45x8 см', 5),
(4, 'Памятник №6 "Ангел"', 'angel-6', 'Детский памятник с фигурой ангела', 42000.00, NULL, true, false, 'Белый мрамор', '80x40x8 см', 6);