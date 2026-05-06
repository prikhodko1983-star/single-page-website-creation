"""
Управление заказами менеджера: создание, просмотр, обновление статуса
"""
import json
import os
import jwt
import psycopg2
from datetime import datetime
from typing import Dict, Any

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400'
}

STATUS_LABELS = {
    'new': 'Новый',
    'in_progress': 'В работе',
    'done': 'Выполнен',
    'cancelled': 'Отменён'
}


def verify_token(headers: dict) -> dict | None:
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    if not token:
        return None
    jwt_secret = os.environ.get('JWT_SECRET')
    try:
        return jwt.decode(token, jwt_secret, algorithms=['HS256'])
    except Exception:
        return None


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    CRUD для заказов менеджера.
    GET / — список заказов
    POST / — создать заказ
    PUT / — обновить статус заказа (body: {id, status})
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = event.get('headers', {})
    user = verify_token(headers)
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()

    try:
        if method == 'GET':
            cursor.execute("""
                SELECT id, client_name, client_phone, client_email,
                       product_name, amount, comment, status, created_by, created_at
                FROM orders
                ORDER BY created_at DESC
                LIMIT 200
            """)
            rows = cursor.fetchall()
            orders = [
                {
                    'id': r[0],
                    'client_name': r[1],
                    'client_phone': r[2],
                    'client_email': r[3],
                    'product_name': r[4],
                    'amount': float(r[5]) if r[5] else 0,
                    'comment': r[6],
                    'status': r[7],
                    'status_label': STATUS_LABELS.get(r[7], r[7]),
                    'created_by': r[8],
                    'created_at': r[9].isoformat() if r[9] else None
                }
                for r in rows
            ]
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(orders)
            }

        elif method == 'POST':
            body = json.loads(event.get('body') or '{}')
            client_name = body.get('client_name', '').strip()
            product_name = body.get('product_name', '').strip()
            if not client_name or not product_name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'client_name и product_name обязательны'})
                }
            cursor.execute("""
                INSERT INTO orders (client_name, client_phone, client_email, product_name, amount, comment, status, created_by)
                VALUES (%s, %s, %s, %s, %s, %s, 'new', %s)
                RETURNING id, created_at
            """, (
                client_name,
                body.get('client_phone', ''),
                body.get('client_email', ''),
                product_name,
                body.get('amount', 0),
                body.get('comment', ''),
                user.get('username')
            ))
            row = cursor.fetchone()
            conn.commit()
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': row[0], 'created_at': row[1].isoformat()})
            }

        elif method == 'PUT':
            body = json.loads(event.get('body') or '{}')
            order_id = body.get('id')
            new_status = body.get('status')
            if not order_id or not new_status:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'id и status обязательны'})
                }
            cursor.execute("""
                UPDATE orders SET status = %s, updated_at = NOW() WHERE id = %s
            """, (new_status, order_id))
            conn.commit()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True})
            }

        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    finally:
        cursor.close()
        conn.close()
