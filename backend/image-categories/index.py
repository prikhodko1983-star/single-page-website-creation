"""
Функция управления категориями изображений и изображениями для конструктора
"""
import json
import os
import psycopg2
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Управление категориями изображений и изображениями
    Args: event - dict с httpMethod, queryStringParameters, body
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с данными или ошибкой
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()
    
    try:
        params = event.get('queryStringParameters', {}) or {}
        query_type = params.get('type', 'categories')
        
        # GET - получение данных
        if method == 'GET':
            if query_type == 'categories':
                # Получить все категории
                cursor.execute("""
                    SELECT id, name, slug, description, sort_order, created_at
                    FROM image_categories
                    ORDER BY sort_order, name
                """)
                categories = []
                for row in cursor.fetchall():
                    categories.append({
                        'id': row[0],
                        'name': row[1],
                        'slug': row[2],
                        'description': row[3],
                        'sort_order': row[4],
                        'created_at': row[5].isoformat() if row[5] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(categories),
                    'isBase64Encoded': False
                }
            
            elif query_type == 'images':
                # Получить изображения (все или по категории)
                category_id = params.get('category_id')
                
                if category_id:
                    cursor.execute("""
                        SELECT ci.id, ci.category_id, ci.name, ci.image_url, ci.sort_order, ci.created_at,
                               ic.name as category_name
                        FROM category_images ci
                        JOIN image_categories ic ON ci.category_id = ic.id
                        WHERE ci.category_id = %s
                        ORDER BY ci.sort_order, ci.name
                    """, (category_id,))
                else:
                    cursor.execute("""
                        SELECT ci.id, ci.category_id, ci.name, ci.image_url, ci.sort_order, ci.created_at,
                               ic.name as category_name
                        FROM category_images ci
                        JOIN image_categories ic ON ci.category_id = ic.id
                        ORDER BY ic.sort_order, ci.sort_order, ci.name
                    """)
                
                images = []
                for row in cursor.fetchall():
                    images.append({
                        'id': row[0],
                        'category_id': row[1],
                        'name': row[2],
                        'image_url': row[3],
                        'sort_order': row[4],
                        'created_at': row[5].isoformat() if row[5] else None,
                        'category_name': row[6]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(images),
                    'isBase64Encoded': False
                }
        
        # POST - создание
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            if query_type == 'category':
                # Создать категорию
                name = body_data.get('name')
                slug = body_data.get('slug')
                description = body_data.get('description', '')
                sort_order = body_data.get('sort_order', 0)
                
                if not name or not slug:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Name and slug required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute("""
                    INSERT INTO image_categories (name, slug, description, sort_order)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                """, (name, slug, description, sort_order))
                
                category_id = cursor.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': category_id, 'message': 'Category created'}),
                    'isBase64Encoded': False
                }
            
            elif query_type == 'image':
                # Создать изображение
                category_id = body_data.get('category_id')
                name = body_data.get('name')
                image_url = body_data.get('image_url')
                sort_order = body_data.get('sort_order', 0)
                
                if not category_id or not name or not image_url:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Category ID, name and image URL required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute("""
                    INSERT INTO category_images (category_id, name, image_url, sort_order)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                """, (category_id, name, image_url, sort_order))
                
                image_id = cursor.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': image_id, 'message': 'Image created'}),
                    'isBase64Encoded': False
                }
        
        # PUT - обновление
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            if query_type == 'category':
                # Обновить категорию
                category_id = body_data.get('id')
                name = body_data.get('name')
                slug = body_data.get('slug')
                description = body_data.get('description')
                sort_order = body_data.get('sort_order')
                
                if not category_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Category ID required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute("""
                    UPDATE image_categories
                    SET name = %s, slug = %s, description = %s, sort_order = %s
                    WHERE id = %s
                """, (name, slug, description, sort_order, category_id))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Category updated'}),
                    'isBase64Encoded': False
                }
            
            elif query_type == 'image':
                # Обновить изображение
                image_id = body_data.get('id')
                category_id = body_data.get('category_id')
                name = body_data.get('name')
                image_url = body_data.get('image_url')
                sort_order = body_data.get('sort_order')
                
                if not image_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Image ID required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute("""
                    UPDATE category_images
                    SET category_id = %s, name = %s, image_url = %s, sort_order = %s
                    WHERE id = %s
                """, (category_id, name, image_url, sort_order, image_id))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Image updated'}),
                    'isBase64Encoded': False
                }
        
        # DELETE - удаление
        elif method == 'DELETE':
            if query_type == 'category':
                category_id = params.get('id')
                
                if not category_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Category ID required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute("DELETE FROM category_images WHERE category_id = %s", (category_id,))
                cursor.execute("DELETE FROM image_categories WHERE id = %s", (category_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Category deleted'}),
                    'isBase64Encoded': False
                }
            
            elif query_type == 'image':
                image_id = params.get('id')
                
                if not image_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Image ID required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute("DELETE FROM category_images WHERE id = %s", (image_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Image deleted'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    finally:
        cursor.close()
        conn.close()
