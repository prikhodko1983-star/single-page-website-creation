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
    GET /products?slug=classic-1 - получить товар по slug
    GET /products?category_id=1 - товары категории
    GET /products?featured=true - избранные товары
    
    GET /categories - получить все категории
    GET /categories?id=1 - получить категорию по ID
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
    
    conn = get_db_connection()
    
    try:
        if method == 'GET':
            # Получение категорий
            if 'categories' in path or params.get('type') == 'categories':
                return get_categories(conn, params)
            # Получение товаров
            else:
                return get_products(conn, params)
        
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