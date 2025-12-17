"""
Функция проверки JWT токена администратора
"""
import json
import os
import jwt
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Проверка валидности JWT токена
    Args: event - dict с httpMethod, headers (X-Auth-Token)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с данными пользователя или ошибкой
    """
    method: str = event.get('httpMethod', 'GET')
    
    # CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    # Получение токена из заголовка
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Token required'}),
            'isBase64Encoded': False
        }
    
    try:
        # Проверка токена
        jwt_secret = os.environ.get('JWT_SECRET', 'fallback_secret_change_me')
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'valid': True,
                'user_id': payload.get('user_id'),
                'username': payload.get('username')
            }),
            'isBase64Encoded': False
        }
        
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Token expired'}),
            'isBase64Encoded': False
        }
    except jwt.InvalidTokenError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
