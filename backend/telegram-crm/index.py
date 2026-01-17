import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''CRM-бот для сохранения обращений клиентов в базу данных'''
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        print(f"DEBUG: FULL BODY = {json.dumps(body)[:500]}")
        
        if 'message' not in body:
            print("DEBUG: No 'message' in body, ignoring")
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }
        
        message = body['message']
        chat = message.get('chat', {})
        chat_id_from_message = str(chat.get('id', ''))
        
        bot_token = os.environ.get('TELEGRAM_NEW_BOT_TOKEN')
        manager_group_id = os.environ.get('TELEGRAM_NEW_CHAT_ID')
        
        print(f"DEBUG: chat_id={chat_id_from_message}, manager_group_id={manager_group_id}")
        
        import urllib.request
        import urllib.parse
        
        # Проверяем, это сообщение из группы менеджеров?
        if chat_id_from_message == manager_group_id:
            print(f"DEBUG: Это сообщение из группы менеджеров!")
            
            # Получаем message_thread_id - это ID первого сообщения в треде
            thread_id = message.get('message_thread_id')
            print(f"DEBUG: thread_id={thread_id}")
            
            if not thread_id:
                # Нет треда - игнорируем
                print("DEBUG: Нет thread_id, игнорируем")
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'ok': True})
                }
            
            # Ищем клиента по message_id первого сообщения в БД
            # Для этого нужно сохранять message_id при отправке в группу
            # Но у нас есть проще способ - искать по времени последнего сообщения
            
            # Пока сделаем так: найдем username из любого сообщения в треде
            reply_to = message.get('reply_to_message')
            if reply_to:
                original_text = reply_to.get('text', '')
            else:
                # Если нет reply - ищем в самом сообщении thread
                original_text = ''
            
            print(f"DEBUG: original_text={original_text}")
            import re
            username_match = re.search(r'@([a-zA-Z0-9_]+)', original_text)
            
            # Находим telegram_id клиента
            db_url = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(db_url)
            cur = conn.cursor()
            schema = 't_p78642605_single_page_website_'
            
            if not username_match:
                print("DEBUG: Не нашли username, отправляем последнему клиенту")
                # Найдем последнего клиента, который писал
                cur.execute(
                    f"SELECT telegram_id, telegram_username FROM {schema}.crm_clients ORDER BY last_contact DESC LIMIT 1"
                )
                result = cur.fetchone()
                
                if not result:
                    print("DEBUG: Нет клиентов в БД")
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json'},
                        'body': json.dumps({'ok': True})
                    }
                
                client_telegram_id = result[0]
                client_username = result[1]
                print(f"DEBUG: Используем последнего клиента: {client_username} (id={client_telegram_id})")
            else:
                client_username = username_match.group(1)
                print(f"DEBUG: client_username из текста={client_username}")
                
                cur.execute(
                    f"SELECT telegram_id FROM {schema}.crm_clients WHERE telegram_username = %s",
                    (client_username,)
                )
                result = cur.fetchone()
                print(f"DEBUG: DB result={result}")
                
                if not result:
                    print("DEBUG: Клиент не найден в БД")
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json'},
                        'body': json.dumps({'ok': True})
                    }
                
                client_telegram_id = result[0]
            
            cur.close()
            conn.close()
            manager_reply = message.get('text', '')
            
            print(f"DEBUG: Отправляем клиенту {client_telegram_id}: {manager_reply}")
            
            # Отправляем ответ менеджера клиенту
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            data = urllib.parse.urlencode({
                'chat_id': client_telegram_id,
                'text': manager_reply
            }).encode()
            
            req = urllib.request.Request(url, data=data)
            response = urllib.request.urlopen(req)
            result_text = response.read().decode('utf-8')
            print(f"DEBUG: Telegram API response={result_text}")
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True, 'action': 'manager_reply_sent'})
            }
        
        # Это сообщение от клиента - сохраняем и отправляем в группу
        telegram_id = message['from']['id']
        telegram_username = message['from'].get('username', '')
        full_name = message['from'].get('first_name', '') + ' ' + message['from'].get('last_name', '')
        full_name = full_name.strip()
        message_text = message.get('text', '')
        
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        schema = 't_p78642605_single_page_website_'
        
        cur.execute(
            f"SELECT id FROM {schema}.crm_clients WHERE telegram_id = %s",
            (telegram_id,)
        )
        result = cur.fetchone()
        
        if result:
            client_id = result[0]
            cur.execute(
                f"UPDATE {schema}.crm_clients SET last_contact = NOW(), telegram_username = %s, full_name = %s WHERE id = %s",
                (telegram_username, full_name, client_id)
            )
        else:
            cur.execute(
                f"INSERT INTO {schema}.crm_clients (telegram_id, telegram_username, full_name) VALUES (%s, %s, %s) RETURNING id",
                (telegram_id, telegram_username, full_name)
            )
            client_id = cur.fetchone()[0]
        
        cur.execute(
            f"INSERT INTO {schema}.crm_messages (client_id, telegram_id, message_text) VALUES (%s, %s, %s)",
            (client_id, telegram_id, message_text)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        text = f"📩 Новое сообщение\n\n👤 {full_name}\n🆔 @{telegram_username}\n💬 {message_text}"
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = urllib.parse.urlencode({
            'chat_id': manager_group_id,
            'text': text
        }).encode()
        
        req = urllib.request.Request(url, data=data)
        urllib.request.urlopen(req)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }