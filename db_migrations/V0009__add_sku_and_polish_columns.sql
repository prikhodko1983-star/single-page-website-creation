-- Добавление столбцов sku и polish в таблицу products
ALTER TABLE products 
ADD COLUMN sku VARCHAR(100),
ADD COLUMN polish VARCHAR(50);