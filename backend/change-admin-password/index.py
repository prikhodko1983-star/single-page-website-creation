"""
Функция смены пароля администратора
"""
import json
import os
import bcrypt
import psycopg2
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Смена пароля администратора
    Args: event - dict с httpMethod, body (current_password, new_password, new_username)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с результатом
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
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
    
    body_str = event.get('body', '{}')
    if not body_str or body_str.strip() == '':
        body_str = '{}'
    body_data = json.loads(body_str)
    
    current_username: str = body_data.get('current_username', '')
    current_password: str = body_data.get('current_password', '')
    new_password: str = body_data.get('new_password', '')
    new_username: str = body_data.get('new_username', '')
    
    if not current_username or not current_password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Current username and password required'}),
            'isBase64Encoded': False
        }
    
    if not new_password and not new_username:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Provide new_password or new_username'}),
            'isBase64Encoded': False
        }
    
    if new_password and len(new_password) < 8:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'New password must be at least 8 characters'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "SELECT id, username, password_hash FROM admin_users WHERE username = %s",
            (current_username,)
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
        
        user_id, username, password_hash = result
        
        if isinstance(password_hash, str):
            stored_hash = password_hash.encode('utf-8')
        else:
            stored_hash = password_hash
        
        password_check = bcrypt.checkpw(current_password.encode('utf-8'), stored_hash)
        
        if not password_check:
            cursor.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid credentials'}),
                'isBase64Encoded': False
            }
        
        update_username = new_username if new_username else username
        
        if new_password:
            new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt(rounds=10))
            new_hash_str = new_hash.decode('utf-8')
            
            cursor.execute(
                "UPDATE admin_users SET username = %s, password_hash = %s WHERE id = %s",
                (update_username, new_hash_str, user_id)
            )
        else:
            cursor.execute(
                "UPDATE admin_users SET username = %s WHERE id = %s",
                (update_username, user_id)
            )
        
        conn.commit()
        
        changes = []
        if new_username:
            changes.append(f'username changed to {new_username}')
        if new_password:
            changes.append('password updated')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': ', '.join(changes),
                'new_username': update_username
            }),
            'isBase64Encoded': False
        }
        
    finally:
        cursor.close()
        conn.close()
