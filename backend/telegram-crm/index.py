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
        
        if 'message' not in body:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }
        
        message = body['message']
        chat_id_msg = message.get('chat', {}).get('id')
        telegram_id = message['from']['id']
        telegram_username = message['from'].get('username', '')
        full_name = message['from'].get('first_name', '') + ' ' + message['from'].get('last_name', '')
        full_name = full_name.strip()
        message_text = message.get('text', '')
        
        # Проверяем: это сообщение из группы менеджеров?
        manager_chat_id = os.environ.get('TELEGRAM_NEW_CHAT_ID')
        if manager_chat_id and str(chat_id_msg) == str(manager_chat_id):
            # Это сообщение из группы менеджеров
            # Проверяем есть ли reply_to_message
            if 'reply_to_message' in message:
                # Менеджер ответил на сообщение - нужно переслать клиенту
                original_text = message['reply_to_message'].get('text', '')
                
                # Ищем username клиента в оригинальном сообщении
                import re
                username_match = re.search(r'@(\w+)', original_text)
                
                if username_match:
                    client_username = username_match.group(1)
                    
                    # Находим telegram_id клиента по username
                    db_url = os.environ.get('DATABASE_URL')
                    conn = psycopg2.connect(db_url)
                    cur = conn.cursor()
                    schema = 't_p78642605_single_page_website_'
                    
                    cur.execute(
                        f"SELECT telegram_id FROM {schema}.crm_clients WHERE telegram_username = %s",
                        (client_username,)
                    )
                    client_result = cur.fetchone()
                    cur.close()
                    conn.close()
                    
                    if client_result:
                        client_telegram_id = client_result[0]
                        
                        # Отправляем ответ клиенту
                        bot_token = os.environ.get('TELEGRAM_NEW_BOT_TOKEN')
                        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                        data = urllib.parse.urlencode({
                            'chat_id': client_telegram_id,
                            'text': f"💬 Ответ менеджера:\n\n{message_text}"
                        }).encode()
                        
                        try:
                            import urllib.request
                            req = urllib.request.Request(url, data=data)
                            urllib.request.urlopen(req)
                            print(f"Ответ отправлен клиенту {client_username}")
                        except Exception as e:
                            print(f"Ошибка отправки клиенту: {str(e)}")
                        
                        return {
                            'statusCode': 200,
                            'headers': {'Content-Type': 'application/json'},
                            'body': json.dumps({'ok': True})
                        }
            
            # Если это просто сообщение в группе (не reply) - игнорируем
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }
        
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
        
        bot_token = os.environ.get('TELEGRAM_NEW_BOT_TOKEN')
        chat_id = os.environ.get('TELEGRAM_NEW_CHAT_ID')
        
        print(f"Отправка в группу: bot_token={bot_token[:20]}..., chat_id={chat_id}")
        
        import urllib.request
        import urllib.parse
        
        text = f"📩 Новое сообщение\n\n👤 {full_name}\n🆔 @{telegram_username}\n💬 {message_text}"
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = urllib.parse.urlencode({
            'chat_id': chat_id,
            'text': text
        }).encode()
        
        try:
            req = urllib.request.Request(url, data=data)
            response = urllib.request.urlopen(req)
            result = response.read().decode('utf-8')
            print(f"Telegram API ответ: {result}")
        except Exception as e:
            print(f"Ошибка отправки в Telegram: {str(e)}")
        
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