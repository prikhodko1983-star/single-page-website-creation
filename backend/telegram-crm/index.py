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
        chat = message.get('chat', {})
        chat_id_from_msg = chat.get('id')
        
        bot_token = os.environ.get('TELEGRAM_NEW_BOT_TOKEN')
        manager_chat_id = os.environ.get('TELEGRAM_NEW_CHAT_ID')
        
        # Проверяем: это сообщение из группы менеджеров?
        if str(chat_id_from_msg) == str(manager_chat_id):
            # Это ответ от менеджера
            reply_to = message.get('reply_to_message')
            if reply_to:
                reply_text = reply_to.get('text', '')
                # Ищем @username в исходном сообщении
                import re
                match = re.search(r'@(\w+)', reply_text)
                if match:
                    username = match.group(1)
                    
                    # Находим telegram_id клиента по username
                    db_url = os.environ.get('DATABASE_URL')
                    conn = psycopg2.connect(db_url)
                    cur = conn.cursor()
                    schema = 't_p78642605_single_page_website_'
                    
                    cur.execute(
                        f"SELECT telegram_id FROM {schema}.crm_clients WHERE telegram_username = %s",
                        (username,)
                    )
                    result = cur.fetchone()
                    cur.close()
                    conn.close()
                    
                    if result:
                        client_telegram_id = result[0]
                        manager_reply = message.get('text', '')
                        
                        # Отправляем ответ клиенту
                        import urllib.request
                        import urllib.parse
                        
                        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                        data = urllib.parse.urlencode({
                            'chat_id': client_telegram_id,
                            'text': manager_reply
                        }).encode()
                        
                        req = urllib.request.Request(url, data=data)
                        urllib.request.urlopen(req)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }
        
        # Это сообщение от клиента
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
        
        import urllib.request
        import urllib.parse
        
        text = f"📩 Новое сообщение\n\n👤 {full_name}\n🆔 @{telegram_username}\n💬 {message_text}"
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = urllib.parse.urlencode({
            'chat_id': manager_chat_id,
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