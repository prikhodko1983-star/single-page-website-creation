"""API для управления галереей изображений на главной странице сайта"""

import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    # CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    
    # OPTIONS request
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    # Подключение к БД
    db_url = os.environ['DATABASE_URL']
    
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        if method == 'GET':
            # Получение всех элементов галереи
            cur.execute("""
                SELECT item_id, type, url, title, description, display_order
                FROM gallery_items
                ORDER BY display_order ASC
            """)
            rows = cur.fetchall()
            
            items = []
            for row in rows:
                items.append({
                    'id': row[0],
                    'type': row[1],
                    'url': row[2],
                    'title': row[3],
                    'desc': row[4] or '',
                    'display_order': row[5]
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(items)
            }
        
        elif method == 'POST':
            # Добавление нового элемента
            body = json.loads(event.get('body', '{}'))
            item_id = body.get('id')
            item_type = body.get('type', 'image')
            url = body.get('url')
            title = body.get('title', '')
            desc = body.get('desc', '')
            display_order = body.get('display_order', 0)
            
            if not item_id or not url:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Missing required fields: id, url'})
                }
            
            cur.execute("""
                INSERT INTO gallery_items (item_id, type, url, title, description, display_order)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (item_id) DO UPDATE SET
                    type = EXCLUDED.type,
                    url = EXCLUDED.url,
                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    display_order = EXCLUDED.display_order,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING item_id
            """, (item_id, item_type, url, title, desc, display_order))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({'success': True, 'id': item_id})
            }
        
        elif method == 'PUT':
            # Массовое обновление галереи
            body = json.loads(event.get('body', '{}'))
            items = body.get('items', [])
            
            if not items:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'No items provided'})
                }
            
            # Очищаем текущую галерею
            cur.execute("DELETE FROM gallery_items")
            
            # Вставляем новые элементы
            for item in items:
                cur.execute("""
                    INSERT INTO gallery_items (item_id, type, url, title, description, display_order)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    item.get('id'),
                    item.get('type', 'image'),
                    item.get('url'),
                    item.get('title', ''),
                    item.get('desc', ''),
                    item.get('display_order', 0)
                ))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'count': len(items)})
            }
        
        elif method == 'DELETE':
            # Удаление элемента по ID
            params = event.get('queryStringParameters', {})
            item_id = params.get('id')
            
            if not item_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Missing id parameter'})
                }
            
            cur.execute("DELETE FROM gallery_items WHERE item_id = %s", (item_id,))
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True})
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }