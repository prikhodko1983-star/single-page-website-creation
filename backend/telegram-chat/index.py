import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request
import urllib.parse

def get_db_connection():
    '''Создание подключения к базе данных'''
    return psycopg2.connect(os.environ['DATABASE_URL'])

def send_telegram_message(chat_id: int, text: str, reply_to_message_id: int = None):
    '''Отправка текстового сообщения через Telegram Bot API'''
    bot_token = os.environ.get('TELEGRAM_NEW_BOT_TOKEN')
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    
    if reply_to_message_id:
        data['reply_to_message_id'] = reply_to_message_id
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f"Message sent successfully to {chat_id}")
            return result
    except Exception as e:
        print(f"Error sending message to {chat_id}: {e}")
        return None

def send_telegram_photo(chat_id: int, photo_url: str, caption: str = None, reply_to_message_id: int = None):
    '''Отправка фото через Telegram Bot API'''
    bot_token = os.environ.get('TELEGRAM_NEW_BOT_TOKEN')
    
    url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
    data = {
        'chat_id': chat_id,
        'photo': photo_url,
        'parse_mode': 'HTML'
    }
    
    if caption:
        data['caption'] = caption
    
    if reply_to_message_id:
        data['reply_to_message_id'] = reply_to_message_id
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error sending photo: {e}")
        return None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Webhook для обработки сообщений Telegram-бота.
    
    Логика:
    1. Клиент пишет боту → сохраняем в БД + пересылаем в группу менеджеров
    2. Менеджер отвечает Reply в группе → бот отправляет ответ клиенту
    '''
    method = event.get('httpMethod', 'POST')
    
    # CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
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
    
    try:
        # Парсим обновление от Telegram
        update = json.loads(event.get('body', '{}'))
        
        if 'message' not in update:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        message = update['message']
        chat_type = message['chat']['type']
        
        conn = get_db_connection()
        
        # Сообщение от клиента (личное сообщение боту)
        if chat_type == 'private':
            return handle_client_message(conn, message)
        
        # Ответ менеджера из группы
        elif chat_type in ['group', 'supergroup']:
            return handle_manager_reply(conn, message)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f"Error processing webhook: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'conn' in locals():
            conn.close()

def handle_client_message(conn, message: Dict[str, Any]) -> Dict[str, Any]:
    '''Обработка сообщения от клиента (текст или фото)'''
    user = message['from']
    user_id = user['id']
    username = user.get('username', '')
    first_name = user.get('first_name', '')
    last_name = user.get('last_name', '')
    text = message.get('text', message.get('caption', ''))
    has_photo = 'photo' in message
    
    print(f"Handling client message from user_id={user_id}, text='{text}', has_photo={has_photo}")
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Проверяем, есть ли уже чат с этим пользователем
    cursor.execute(
        f"SELECT id FROM telegram_chats WHERE user_id = {user_id}"
    )
    chat = cursor.fetchone()
    
    if chat:
        # Обновляем информацию о пользователе
        chat_id = chat['id']
        cursor.execute(f"""
            UPDATE telegram_chats 
            SET username = '{username.replace("'", "''")}',
                first_name = '{first_name.replace("'", "''")}',
                last_name = '{last_name.replace("'", "''")}',
                last_message_at = NOW()
            WHERE id = {chat_id}
        """)
    else:
        # Создаём новый чат
        cursor.execute(f"""
            INSERT INTO telegram_chats (user_id, username, first_name, last_name)
            VALUES ({user_id}, '{username.replace("'", "''")}', 
                    '{first_name.replace("'", "''")}', '{last_name.replace("'", "''")}')
            RETURNING id
        """)
        chat_id = cursor.fetchone()['id']
    
    # Сохраняем сообщение в историю
    cursor.execute(f"""
        INSERT INTO telegram_messages (chat_id, user_id, message_text, is_from_client)
        VALUES ({chat_id}, {user_id}, '{text.replace("'", "''")}', true)
    """)
    conn.commit()
    
    # Если это первое сообщение от клиента, отправляем приветствие
    if not chat:
        welcome_text = f"""
Привет, {first_name}! 👋

Благодарим за обращение. Наш менеджер скоро ответит на ваш вопрос.

Вы можете отправлять текст и фото - мы всё получим!
        """.strip()
        send_telegram_message(user_id, welcome_text)
    
    # Пересылаем сообщение в группу менеджеров
    group_id = os.environ.get('TELEGRAM_NEW_CHAT_ID')
    full_name = f"{first_name} {last_name}".strip()
    username_str = f"@{username}" if username else "нет username"
    
    # Формируем текст с информацией о клиенте
    message_part = f"\n\n💬 <b>Сообщение:</b>\n{text}" if text else ""
    
    forward_text = f"""
📩 <b>Новое сообщение от клиента</b>

👤 <b>Имя:</b> {full_name}
🆔 <b>ID:</b> <code>{user_id}</code>
📱 <b>Username:</b> {username_str}{message_part}

<i>Чтобы ответить клиенту, используйте Reply на это сообщение</i>
    """.strip()
    
    # Отправляем в группу
    if has_photo:
        # Если есть фото, отправляем с текстом в caption (макс 1024 символа)
        photo = message['photo'][-1]
        file_id = photo['file_id']
        # Если текст слишком длинный, сначала отправим текст, потом фото
        if len(forward_text) > 1000:
            send_telegram_message(int(group_id), forward_text)
            send_telegram_photo(int(group_id), file_id, "📸 Фото от клиента")
        else:
            send_telegram_photo(int(group_id), file_id, forward_text)
    else:
        send_telegram_message(int(group_id), forward_text)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True, 'message': 'Сообщение получено'}),
        'isBase64Encoded': False
    }

def handle_manager_reply(conn, message: Dict[str, Any]) -> Dict[str, Any]:
    '''Обработка ответа менеджера из группы (текст или фото)'''
    
    # Проверяем, является ли это ответом на сообщение
    if 'reply_to_message' not in message:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'message': 'Not a reply'}),
            'isBase64Encoded': False
        }
    
    reply_to = message['reply_to_message']
    reply_text = reply_to.get('text', '')
    
    # Извлекаем user_id клиента из исходного сообщения
    # Формат: 🆔 ID: 123456789
    try:
        if '🆔' in reply_text and 'ID:' in reply_text:
            user_id_str = reply_text.split('ID:')[1].split('\n')[0].strip()
            # Убираем HTML теги <code>
            user_id_str = user_id_str.replace('<code>', '').replace('</code>', '').strip()
            client_user_id = int(user_id_str)
        else:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True, 'message': 'Cannot extract user_id'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        print(f"Error extracting user_id: {e}")
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'message': f'Error: {e}'}),
            'isBase64Encoded': False
        }
    
    # Получаем текст или фото от менеджера
    manager_text = message.get('text', '')
    has_photo = 'photo' in message
    
    if not manager_text and not has_photo:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'message': 'Empty message'}),
            'isBase64Encoded': False
        }
    
    # Сохраняем ответ в базу
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(f"""
        SELECT id FROM telegram_chats WHERE user_id = {client_user_id}
    """)
    chat = cursor.fetchone()
    
    if chat:
        message_to_save = message.get('caption', '') if has_photo else manager_text
        cursor.execute(f"""
            INSERT INTO telegram_messages (chat_id, user_id, message_text, is_from_client)
            VALUES ({chat['id']}, {message['from']['id']}, 
                    '{message_to_save.replace("'", "''")}', false)
        """)
        cursor.execute(f"""
            UPDATE telegram_chats 
            SET last_message_at = NOW()
            WHERE id = {chat['id']}
        """)
        conn.commit()
    
    # Отправляем ответ клиенту (текст или фото)
    if has_photo:
        photo = message['photo'][-1]
        file_id = photo['file_id']
        caption = message.get('caption', '') if message.get('caption') else None
        send_telegram_photo(client_user_id, file_id, caption)
    elif manager_text:
        send_telegram_message(client_user_id, manager_text)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True, 'message': 'Reply sent to client'}),
        'isBase64Encoded': False
    }