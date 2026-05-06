"""
Управление сотрудниками: смена пароля, создание/удаление менеджеров, список пользователей
"""
import json
import os
import bcrypt
import psycopg2
from typing import Dict, Any

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400'
}


def verify_admin(headers: dict) -> bool:
    import jwt
    token = None
    for k, v in headers.items():
        if k.lower() == 'x-auth-token':
            token = v
            break
    if not token:
        return False
    jwt_secret = os.environ.get('JWT_SECRET')
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        role = payload.get('role', 'admin')
        if role == 'admin':
            return True
        # Если role нет в токене или не совпадает — проверяем по username в БД
        username = payload.get('username', '')
        if not username:
            return False
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT role FROM admin_users WHERE username = %s", (username,))
            row = cursor.fetchone()
            return bool(row and row[0] == 'admin')
        finally:
            cursor.close()
            conn.close()
    except Exception:
        return False


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Управление сотрудниками (только для администратора).
    GET / — список всех пользователей
    POST / action=change_password — смена своего пароля
    POST / action=create_manager — создать менеджера
    DELETE / — удалить пользователя по id
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = event.get('headers', {})

    # GET — список пользователей (только для admin)
    if method == 'GET':
        if not verify_admin(headers):
            return {'statusCode': 403, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Forbidden'})}
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id, username, role FROM admin_users ORDER BY id")
            rows = cursor.fetchall()
            users = [{'id': r[0], 'username': r[1], 'role': r[2]} for r in rows]
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps(users)}
        finally:
            cursor.close()
            conn.close()

    # DELETE — удалить менеджера (только admin, нельзя удалить себя)
    if method == 'DELETE':
        if not verify_admin(headers):
            return {'statusCode': 403, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Forbidden'})}
        body = json.loads(event.get('body') or '{}')
        user_id = body.get('id')
        if not user_id:
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'id обязателен'})}
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT role FROM admin_users WHERE id = %s", (user_id,))
            row = cursor.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Пользователь не найден'})}
            if row[0] == 'admin':
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Нельзя удалить администратора'})}
            cursor.execute("DELETE FROM admin_users WHERE id = %s", (user_id,))
            conn.commit()
            return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': True})}
        finally:
            cursor.close()
            conn.close()

    if method != 'POST':
        return {'statusCode': 405, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}

    body_str = event.get('body', '{}') or '{}'
    body_data = json.loads(body_str)
    action = body_data.get('action', 'change_password')

    # POST action=create_manager — создать менеджера (только admin)
    if action == 'create_manager':
        if not verify_admin(headers):
            return {'statusCode': 403, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Forbidden'})}
        username = body_data.get('username', '').strip()
        password = body_data.get('password', '')
        if not username or not password:
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'username и password обязательны'})}
        if len(password) < 6:
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id FROM admin_users WHERE username = %s", (username,))
            if cursor.fetchone():
                return {'statusCode': 409, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Логин уже занят'})}
            pw_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=10)).decode('utf-8')
            cursor.execute("INSERT INTO admin_users (username, password_hash, role) VALUES (%s, %s, 'manager') RETURNING id", (username, pw_hash))
            new_id = cursor.fetchone()[0]
            conn.commit()
            return {'statusCode': 201, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': True, 'id': new_id})}
        finally:
            cursor.close()
            conn.close()

    # POST action=change_password — смена пароля (любой авторизованный пользователь)
    current_username = body_data.get('current_username', '')
    current_password = body_data.get('current_password', '')
    new_password = body_data.get('new_password', '')
    new_username = body_data.get('new_username', '')

    if not current_username or not current_password:
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Current username and password required'})}
    if not new_password and not new_username:
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Provide new_password or new_username'})}
    if new_password and len(new_password) < 8:
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'New password must be at least 8 characters'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, username, password_hash FROM admin_users WHERE username = %s", (current_username,))
        result = cursor.fetchone()
        if not result:
            return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Invalid credentials'})}
        user_id, username, password_hash = result
        stored_hash = password_hash.encode('utf-8') if isinstance(password_hash, str) else password_hash
        if not bcrypt.checkpw(current_password.encode('utf-8'), stored_hash):
            return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Invalid credentials'})}

        update_username = new_username if new_username else username
        if new_password:
            new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt(rounds=10)).decode('utf-8')
            cursor.execute("UPDATE admin_users SET username = %s, password_hash = %s WHERE id = %s", (update_username, new_hash, user_id))
        else:
            cursor.execute("UPDATE admin_users SET username = %s WHERE id = %s", (update_username, user_id))
        conn.commit()
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'new_username': update_username})}
    finally:
        cursor.close()
        conn.close()