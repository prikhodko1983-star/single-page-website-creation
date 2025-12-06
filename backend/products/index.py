import json
import os
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    '''Создание подключения к базе данных'''
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с товарами и категориями интернет-магазина
    
    GET /products - получить все товары (с фильтрами)
    GET /products?id=1 - получить товар по ID
    POST /products - создать товар
    PUT /products?id=1 - обновить товар
    DELETE /products?id=1 - удалить товар
    
    GET /categories - получить все категории
    POST /categories - создать категорию
    PUT /categories?id=1 - обновить категорию
    DELETE /categories?id=1 - удалить категорию
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    path = event.get('path', '/')
    params = event.get('queryStringParameters') or {}
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])
    
    conn = get_db_connection()
    
    try:
        is_category = 'categories' in path or params.get('type') == 'categories'
        
        if method == 'GET':
            if is_category:
                return get_categories(conn, params)
            else:
                return get_products(conn, params)
        
        elif method == 'POST':
            if is_category:
                return create_category(conn, body)
            else:
                return create_product(conn, body)
        
        elif method == 'PUT':
            if is_category:
                return update_category(conn, params.get('id'), body)
            else:
                return update_product(conn, params.get('id'), body)
        
        elif method == 'DELETE':
            if is_category:
                return delete_category(conn, params.get('id'))
            else:
                return delete_product(conn, params.get('id'))
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()

def get_categories(conn, params: Dict[str, Any]) -> Dict[str, Any]:
    '''Получение категорий'''
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    if params.get('id'):
        query = f"SELECT * FROM categories WHERE id = {params['id']} AND is_active = true"
        cursor.execute(query)
        category = cursor.fetchone()
        
        if not category:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Category not found'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(category), default=str),
            'isBase64Encoded': False
        }
    
    # Все категории
    cursor.execute(
        "SELECT * FROM categories WHERE is_active = true ORDER BY display_order, name"
    )
    categories = [dict(row) for row in cursor.fetchall()]
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(categories, default=str),
        'isBase64Encoded': False
    }

def get_products(conn, params: Dict[str, Any]) -> Dict[str, Any]:
    '''Получение товаров'''
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получение одного товара по ID
    if params.get('id'):
        query = f"""
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = {params['id']}
        """
        cursor.execute(query)
        product = cursor.fetchone()
        
        if not product:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Product not found'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(product), default=str),
            'isBase64Encoded': False
        }
    
    # Получение одного товара по slug
    if params.get('slug'):
        slug_escaped = params['slug'].replace("'", "''")
        query = f"""
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.slug = '{slug_escaped}'
        """
        cursor.execute(query)
        product = cursor.fetchone()
        
        if not product:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Product not found'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(product), default=str),
            'isBase64Encoded': False
        }
    
    # Построение запроса с фильтрами
    query = """
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    """
    
    # Фильтр по категории
    if params.get('category_id'):
        query += f" AND p.category_id = {params['category_id']}"
    
    if params.get('category_slug'):
        slug_escaped = params['category_slug'].replace("'", "''")
        query += f" AND c.slug = '{slug_escaped}'"
    
    # Фильтр по наличию
    if params.get('in_stock') == 'true':
        query += " AND p.in_stock = true"
    
    # Фильтр по избранным
    if params.get('featured') == 'true':
        query += " AND p.is_featured = true"
    
    # Сортировка
    query += " ORDER BY p.display_order, p.created_at DESC"
    
    # Лимит
    limit = params.get('limit', '100')
    query += f" LIMIT {limit}"
    
    cursor.execute(query)
    products = [dict(row) for row in cursor.fetchall()]
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(products, default=str),
        'isBase64Encoded': False
    }

def create_category(conn, data: Dict[str, Any]) -> Dict[str, Any]:
    '''Создание категории'''
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    name = data.get('name', '').replace("'", "''")
    slug = data.get('slug', '').replace("'", "''")
    description = data.get('description', '').replace("'", "''")
    
    if not name or not slug:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Name and slug are required'}),
            'isBase64Encoded': False
        }
    
    query = f"""
        INSERT INTO categories (name, slug, description, is_active, display_order)
        VALUES ('{name}', '{slug}', '{description}', true, 999)
        RETURNING *
    """
    cursor.execute(query)
    conn.commit()
    category = cursor.fetchone()
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(dict(category), default=str),
        'isBase64Encoded': False
    }

def update_category(conn, category_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    '''Обновление категории'''
    if not category_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Category ID is required'}),
            'isBase64Encoded': False
        }
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    name = data.get('name', '').replace("'", "''")
    slug = data.get('slug', '').replace("'", "''")
    description = data.get('description', '').replace("'", "''")
    
    query = f"""
        UPDATE categories 
        SET name = '{name}', slug = '{slug}', description = '{description}', updated_at = NOW()
        WHERE id = {category_id}
        RETURNING *
    """
    cursor.execute(query)
    conn.commit()
    category = cursor.fetchone()
    
    if not category:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Category not found'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(dict(category), default=str),
        'isBase64Encoded': False
    }

def delete_category(conn, category_id: str) -> Dict[str, Any]:
    '''Удаление категории (soft delete)'''
    if not category_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Category ID is required'}),
            'isBase64Encoded': False
        }
    
    cursor = conn.cursor()
    query = f"UPDATE categories SET is_active = false WHERE id = {category_id}"
    cursor.execute(query)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def create_product(conn, data: Dict[str, Any]) -> Dict[str, Any]:
    '''Создание товара'''
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    name = data.get('name', '').replace("'", "''")
    slug = data.get('slug', '').replace("'", "''")
    description = data.get('description', '').replace("'", "''")
    price = data.get('price', 0)
    old_price = data.get('old_price')
    image_url = data.get('image_url', '').replace("'", "''")
    material = data.get('material', '').replace("'", "''")
    size = data.get('size', '').replace("'", "''")
    category_id = data.get('category_id')
    in_stock = data.get('in_stock', True)
    is_featured = data.get('is_featured', False)
    
    if not name or not slug:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Name and slug are required'}),
            'isBase64Encoded': False
        }
    
    old_price_str = f"'{old_price}'" if old_price and old_price != '' else 'NULL'
    image_url_str = f"'{image_url}'" if image_url and image_url != '' else 'NULL'
    material_str = f"'{material}'" if material and material != '' else 'NULL'
    size_str = f"'{size}'" if size and size != '' else 'NULL'
    category_id_str = str(category_id) if category_id and category_id != '' else 'NULL'
    
    query = f"""
        INSERT INTO products 
        (name, slug, description, price, old_price, image_url, material, size, 
         category_id, in_stock, is_featured, display_order)
        VALUES 
        ('{name}', '{slug}', '{description}', '{price}', {old_price_str}, {image_url_str}, 
         {material_str}, {size_str}, {category_id_str}, {in_stock}, {is_featured}, 999)
        RETURNING *
    """
    cursor.execute(query)
    conn.commit()
    product = cursor.fetchone()
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(dict(product), default=str),
        'isBase64Encoded': False
    }

def update_product(conn, product_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    '''Обновление товара'''
    if not product_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Product ID is required'}),
            'isBase64Encoded': False
        }
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    name = data.get('name', '').replace("'", "''")
    slug = data.get('slug', '').replace("'", "''")
    description = data.get('description', '').replace("'", "''")
    price = data.get('price', 0)
    old_price = data.get('old_price')
    image_url = data.get('image_url', '').replace("'", "''")
    material = data.get('material', '').replace("'", "''")
    size = data.get('size', '').replace("'", "''")
    category_id = data.get('category_id')
    in_stock = data.get('in_stock', True)
    is_featured = data.get('is_featured', False)
    
    old_price_str = f"'{old_price}'" if old_price else 'NULL'
    image_url_str = f"'{image_url}'" if image_url else 'NULL'
    material_str = f"'{material}'" if material else 'NULL'
    size_str = f"'{size}'" if size else 'NULL'
    category_id_str = str(category_id) if category_id else 'NULL'
    
    query = f"""
        UPDATE products 
        SET name = '{name}', slug = '{slug}', description = '{description}',
            price = '{price}', old_price = {old_price_str}, image_url = {image_url_str},
            material = {material_str}, size = {size_str}, category_id = {category_id_str},
            in_stock = {in_stock}, is_featured = {is_featured}, updated_at = NOW()
        WHERE id = {product_id}
        RETURNING *
    """
    cursor.execute(query)
    conn.commit()
    product = cursor.fetchone()
    
    if not product:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Product not found'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(dict(product), default=str),
        'isBase64Encoded': False
    }

def delete_product(conn, product_id: str) -> Dict[str, Any]:
    '''Удаление товара'''
    if not product_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Product ID is required'}),
            'isBase64Encoded': False
        }
    
    cursor = conn.cursor()
    query = f"DELETE FROM products WHERE id = {product_id}"
    cursor.execute(query)
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }