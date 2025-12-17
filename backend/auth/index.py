"""
Функция авторизации администраторов с выдачей JWT токена
"""
import json
import os
import jwt
import bcrypt
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Авторизация администратора и выдача JWT токена
    Args: event - dict с httpMethod, body (username, password)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с JWT токеном или ошибкой
    """
    method: str = event.get('httpMethod', 'GET')
    
    # CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    # Парсинг тела запроса
    body_str = event.get('body', '{}')
    if not body_str or body_str.strip() == '':
        body_str = '{}'
    body_data = json.loads(body_str)
    username: str = body_data.get('username', '')
    password: str = body_data.get('password', '')
    
    if not username or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Username and password required'}),
            'isBase64Encoded': False
        }
    
    # Подключение к БД
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()
    
    try:
        # Поиск пользователя
        cursor.execute(
            "SELECT id, password_hash FROM admin_users WHERE username = %s",
            (username,)
        )
        result = cursor.fetchone()
        
        if not result:
            cursor.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid credentials'}),
                'isBase64Encoded': False
            }
        
        user_id, password_hash = result
        
        # Проверка пароля - password_hash может быть строкой или bytes из БД
        if isinstance(password_hash, str):
            stored_hash = password_hash.encode('utf-8')
        else:
            stored_hash = password_hash
        
        password_check = bcrypt.checkpw(password.encode('utf-8'), stored_hash)
        
        if not password_check:
            cursor.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid credentials'}),
                'isBase64Encoded': False
            }
        
        # Генерация JWT токена
        jwt_secret = os.environ.get('JWT_SECRET', 'fallback_secret_change_me')
        payload = {
            'user_id': user_id,
            'username': username,
            'exp': datetime.utcnow() + timedelta(days=7)  # Токен на 7 дней
        }
        token = jwt.encode(payload, jwt_secret, algorithm='HS256')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'token': token, 'username': username}),
            'isBase64Encoded': False
        }
        
    finally:
        cursor.close()
        conn.close()