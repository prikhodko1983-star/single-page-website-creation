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
        telegram_id = message['from']['id']
        telegram_username = message['from'].get('username', '')
        full_name = message['from'].get('first_name', '') + ' ' + message['from'].get('last_name', '')
        full_name = full_name.strip()
        message_text = message.get('text', '')
        
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        cur.execute(
            "SELECT id FROM crm_clients WHERE telegram_id = %s",
            (telegram_id,)
        )
        result = cur.fetchone()
        
        if result:
            client_id = result[0]
            cur.execute(
                "UPDATE crm_clients SET last_contact = NOW(), telegram_username = %s, full_name = %s WHERE id = %s",
                (telegram_username, full_name, client_id)
            )
        else:
            cur.execute(
                "INSERT INTO crm_clients (telegram_id, telegram_username, full_name) VALUES (%s, %s, %s) RETURNING id",
                (telegram_id, telegram_username, full_name)
            )
            client_id = cur.fetchone()[0]
        
        cur.execute(
            "INSERT INTO crm_messages (client_id, telegram_id, message_text) VALUES (%s, %s, %s)",
            (client_id, telegram_id, message_text)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        bot_token = os.environ.get('TELEGRAM_NEW_BOT_TOKEN')
        chat_id = os.environ.get('TELEGRAM_NEW_CHAT_ID')
        
        import urllib.request
        import urllib.parse
        
        text = f"📩 Новое сообщение\n\n👤 {full_name}\n🆔 @{telegram_username}\n💬 {message_text}"
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = urllib.parse.urlencode({
            'chat_id': chat_id,
            'text': text,
            'parse_mode': 'HTML'
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
