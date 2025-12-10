CREATE TABLE IF NOT EXISTS crosses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 999,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crosses_active ON crosses(is_active, display_order);

INSERT INTO crosses (name, image_url, display_order) VALUES
('Классический', 'https://cdn.poehali.dev/files/d84cc9c9-aa3d-41ad-bc4c-ecf91a1ffa36.png', 1);