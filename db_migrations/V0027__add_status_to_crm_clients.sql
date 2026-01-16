-- Добавляем статус заявки в таблицу клиентов CRM
ALTER TABLE t_p78642605_single_page_website_.crm_clients 
ADD COLUMN status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'work', 'pay', 'done'));

-- Проставляем всем существующим клиентам статус 'new'
UPDATE t_p78642605_single_page_website_.crm_clients SET status = 'new' WHERE status IS NULL;

-- Создаём индекс для быстрого поиска по статусу
CREATE INDEX idx_crm_clients_status ON t_p78642605_single_page_website_.crm_clients(status);