"""
API для работы с заявками из Telegram.
Получение списка заявок и отправка ответов клиентам.
"""
import json
import os

import psycopg2
import requests


def send_telegram_message(chat_id: int, text: str) -> bool:
    """Отправка сообщения в Telegram"""
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        return False
    
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
    response = requests.post(
        f"https://api.telegram.org/bot{bot_token}/sendMessage",
        json=payload,
        timeout=10
    )
    
    return response.status_code == 200


def handler(event: dict, context) -> dict:
    """
    API для управления заявками из Telegram.
    GET - получить список заявок
    POST - отправить ответ клиенту
    """
    method = event.get("httpMethod", "GET")
    
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": ""
        }
    
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cursor = conn.cursor()
    
    # Получение списка заявок
    if method == "GET":
        params = event.get("queryStringParameters") or {}
        status = params.get("status", "all")
        
        if status == "all":
            cursor.execute("""
                SELECT id, telegram_chat_id, telegram_username, 
                       telegram_first_name, telegram_last_name,
                       message, photo_urls, status, admin_response,
                       created_at, updated_at
                FROM telegram_orders
                ORDER BY created_at DESC
                LIMIT 100
            """)
        else:
            cursor.execute("""
                SELECT id, telegram_chat_id, telegram_username,
                       telegram_first_name, telegram_last_name,
                       message, photo_urls, status, admin_response,
                       created_at, updated_at
                FROM telegram_orders
                WHERE status = %s
                ORDER BY created_at DESC
                LIMIT 100
            """, (status,))
        
        rows = cursor.fetchall()
        orders = []
        
        for row in rows:
            orders.append({
                "id": row[0],
                "telegram_chat_id": row[1],
                "telegram_username": row[2],
                "telegram_first_name": row[3],
                "telegram_last_name": row[4],
                "message": row[5],
                "photo_urls": row[6] or [],
                "status": row[7],
                "admin_response": row[8],
                "created_at": row[9].isoformat() if row[9] else None,
                "updated_at": row[10].isoformat() if row[10] else None
            })
        
        conn.close()
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"orders": orders})
        }
    
    # Отправка ответа клиенту
    if method == "POST":
        body = json.loads(event.get("body", "{}"))
        order_id = body.get("order_id")
        response_text = body.get("response")
        new_status = body.get("status", "replied")
        
        if not order_id or not response_text:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": "order_id и response обязательны"})
            }
        
        # Получаем chat_id из заявки
        cursor.execute(
            "SELECT telegram_chat_id FROM telegram_orders WHERE id = %s",
            (order_id,)
        )
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return {
                "statusCode": 404,
                "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": "Заявка не найдена"})
            }
        
        chat_id = row[0]
        
        # Отправляем сообщение клиенту
        message_sent = send_telegram_message(
            chat_id,
            f"<b>Ответ на вашу заявку #{order_id}:</b>\n\n{response_text}"
        )
        
        if not message_sent:
            conn.close()
            return {
                "statusCode": 500,
                "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": "Не удалось отправить сообщение"})
            }
        
        # Обновляем статус заявки
        cursor.execute("""
            UPDATE telegram_orders
            SET status = %s, admin_response = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (new_status, response_text, order_id))
        
        conn.commit()
        conn.close()
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"success": True, "message": "Ответ отправлен"})
        }
    
    return {
        "statusCode": 405,
        "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"error": "Method not allowed"})
    }
