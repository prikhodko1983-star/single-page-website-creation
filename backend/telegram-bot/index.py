"""
Telegram бот для приёма заявок от клиентов.
Сохраняет сообщения и фото в базу данных.
"""
import json
import os
from datetime import datetime, timezone

import psycopg2
import requests


def send_message(chat_id: int, text: str) -> None:
    """Отправка сообщения в Telegram"""
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        return
    
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
    requests.post(
        f"https://api.telegram.org/bot{bot_token}/sendMessage",
        json=payload,
        timeout=10
    )


def save_order(chat_id: int, user: dict, message_text: str = None, photo_urls: list = None) -> int:
    """Сохранение заявки в базу данных"""
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO telegram_orders
        (telegram_chat_id, telegram_username, telegram_first_name, 
         telegram_last_name, message, photo_urls, status)
        VALUES (%s, %s, %s, %s, %s, %s, 'new')
        RETURNING id
    """, (
        chat_id,
        user.get("username"),
        user.get("first_name"),
        user.get("last_name"),
        message_text,
        photo_urls
    ))
    
    order_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()
    
    return order_id


def get_file_url(file_id: str) -> str:
    """Получение URL файла из Telegram"""
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    
    # Получаем информацию о файле
    response = requests.get(
        f"https://api.telegram.org/bot{bot_token}/getFile?file_id={file_id}",
        timeout=10
    )
    file_path = response.json()["result"]["file_path"]
    
    # Формируем URL для скачивания
    return f"https://api.telegram.org/file/bot{bot_token}/{file_path}"


def handler(event: dict, context) -> dict:
    """Обработчик webhook от Telegram"""
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": ""
        }
    
    body_str = event.get("body") or "{}"
    if not body_str.strip():
        body_str = "{}"
    
    body = json.loads(body_str)
    message = body.get("message")
    
    if not message:
        return {"statusCode": 200, "body": ""}
    
    chat_id = message.get("chat", {}).get("id")
    user = message.get("from", {})
    text = message.get("text", "")
    
    # Обработка команды /start
    if text.startswith("/start"):
        welcome_text = """
<b>Добро пожаловать!</b>

Вы можете:
• Написать ваш вопрос о памятниках
• Прислать фото для консультации
• Описать желаемый заказ

Мы ответим вам в ближайшее время!
        """
        send_message(chat_id, welcome_text)
        return {"statusCode": 200, "body": ""}
    
    # Обработка фото
    photo_urls = []
    if "photo" in message:
        # Берём фото наибольшего размера
        largest_photo = message["photo"][-1]
        file_id = largest_photo["file_id"]
        photo_url = get_file_url(file_id)
        photo_urls.append(photo_url)
    
    # Сохранение заявки
    if text or photo_urls:
        order_id = save_order(chat_id, user, text, photo_urls)
        
        response_text = f"""
✅ <b>Заявка #{order_id} принята!</b>

Мы получили ваше сообщение и свяжемся с вами в ближайшее время.

Вы можете продолжить отправлять фото или дополнительную информацию.
        """
        send_message(chat_id, response_text)
    
    return {"statusCode": 200, "body": ""}