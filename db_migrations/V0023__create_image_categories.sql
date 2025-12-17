-- Таблица категорий изображений для конструктора
CREATE TABLE image_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица изображений по категориям
CREATE TABLE category_images (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES image_categories(id),
    name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_category_images_category_id ON category_images(category_id);
CREATE INDEX idx_image_categories_slug ON image_categories(slug);

-- Начальные категории
INSERT INTO image_categories (name, slug, description, sort_order) VALUES
('Цветы', 'flowers', 'Цветы и букеты для оформления памятника', 1),
('Ангелы', 'angels', 'Ангелы и херувимы', 2),
('Деревья', 'trees', 'Деревья и растения', 3),
('Свечи', 'candles', 'Свечи и лампады', 4),
('Механика', 'mechanics', 'Инструменты и механизмы', 5),
('Религия', 'religion', 'Религиозные символы', 6),
('Декор', 'decor', 'Декоративные элементы', 7);