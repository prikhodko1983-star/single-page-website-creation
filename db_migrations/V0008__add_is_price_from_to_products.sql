-- Добавление поля is_price_from для отображения "от" перед ценой
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_price_from BOOLEAN DEFAULT false;