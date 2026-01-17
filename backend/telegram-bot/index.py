import json
import os
import urllib.request
import urllib.parse
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """Обработка webhook от Telegram бота для двусторонней связи с клиентами"""
    
    method = event.get('httpMethod', 'POST')
    
    # CORS для OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # Получаем update от Telegram
        body = event.get('body', '{}')
        update = json.loads(body) if isinstance(body, str) else body
        
        print(f"DEBUG: Received update: {json.dumps(update, ensure_ascii=False)}")
        
        bot_token = os.environ.get('TELEGRAM_NEW_BOT_TOKEN')
        manager_chat_id = os.environ.get('TELEGRAM_NEW_CHAT_ID')
        dsn = os.environ.get('DATABASE_URL')
        
        if not bot_token or not manager_chat_id or not dsn:
            print("ERROR: Missing environment variables")
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Configuration error'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Обработка сообщения от клиента в бот
        if 'message' in update:
            message = update['message']
            
            # Проверяем, что это НЕ сообщение из группы менеджеров
            chat_id = message['chat']['id']
            if str(chat_id) == str(manager_chat_id):
                # Это сообщение из группы менеджеров - обрабатываем как ответ
                if 'reply_to_message' in message:
                    handle_manager_reply(message, bot_token, cur, conn)
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'ok': True}),
                    'isBase64Encoded': False
                }
            
            # Это сообщение от клиента
            user_id = message['from']['id']
            username = message['from'].get('username', '')
            first_name = message['from'].get('first_name', '')
            last_name = message['from'].get('last_name', '')
            text = message.get('text', '')
            
            print(f"DEBUG: Client message from user_id={user_id}, username={username}, text={text}")
            
            # Сохраняем пользователя в БД
            cur.execute("""
                INSERT INTO telegram_chats (user_id, username, first_name, last_name, last_message_at)
                VALUES (%s, %s, %s, %s, now())
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    username = EXCLUDED.username,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    last_message_at = now()
                RETURNING id
            """, (user_id, username, first_name, last_name))
            
            chat_db_id = cur.fetchone()[0]
            
            # Сохраняем сообщение в БД
            cur.execute("""
                INSERT INTO telegram_messages (chat_id, user_id, message_text, is_from_client, created_at)
                VALUES (%s, %s, %s, true, now())
            """, (chat_db_id, user_id, text))
            
            conn.commit()
            
            # Пересылаем в группу менеджеров
            display_name = f"{first_name} {last_name}".strip() or username or f"User {user_id}"
            forward_text = f"💬 Сообщение от клиента:\n\n👤 {display_name}"
            if username:
                forward_text += f" (@{username})"
            forward_text += f"\n\n{text}"
            
            send_telegram_message(bot_token, manager_chat_id, forward_text)
            
            print(f"DEBUG: Message forwarded to managers")
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def handle_manager_reply(message: dict, bot_token: str, cur, conn):
    """Обрабатывает ответ менеджера клиенту (Reply в группе)"""
    
    reply_to = message.get('reply_to_message', {})
    reply_text = reply_to.get('text', '')
    manager_text = message.get('text', '')
    
    print(f"DEBUG: Manager reply detected. Reply to: {reply_text[:100]}")
    
    # Извлекаем username или user_id из исходного сообщения
    # Формат: "💬 Сообщение от клиента:\n\n👤 Имя (@username)\n\nТекст"
    import re
    username_match = re.search(r'@(\w+)', reply_text)
    
    if username_match:
        username = username_match.group(1)
        print(f"DEBUG: Found username: {username}")
        
        # Находим user_id по username
        cur.execute("""
            SELECT user_id FROM telegram_chats 
            WHERE username = %s 
            ORDER BY last_message_at DESC 
            LIMIT 1
        """, (username,))
        
        result = cur.fetchone()
        if result:
            client_user_id = result[0]
            
            # Сохраняем ответ в БД
            cur.execute("""
                INSERT INTO telegram_messages (chat_id, user_id, message_text, is_from_client, created_at)
                SELECT id, %s, %s, false, now()
                FROM telegram_chats WHERE user_id = %s
            """, (client_user_id, manager_text, client_user_id))
            conn.commit()
            
            # Отправляем клиенту
            response_text = f"📩 Ответ от менеджера:\n\n{manager_text}"
            send_telegram_message(bot_token, client_user_id, response_text)
            
            print(f"DEBUG: Reply sent to client {client_user_id}")
        else:
            print(f"ERROR: User with username @{username} not found in DB")
    else:
        print("ERROR: Could not extract username from reply")


def send_telegram_message(bot_token: str, chat_id, text: str):
    """Отправляет сообщение через Telegram Bot API"""
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    data = {
        'chat_id': str(chat_id),
        'text': text,
        'parse_mode': 'HTML'
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f"DEBUG: Telegram API response: {result}")
            return result
    except Exception as e:
        print(f"ERROR sending message: {str(e)}")
        raise
