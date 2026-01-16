import json
import os
import psycopg2
from datetime import datetime

ADMIN_ID = 332684498

def handler(event: dict, context) -> dict:
    '''CRM-бот для управления заявками клиентов через папки со статусами'''
    
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
        
        if telegram_id == ADMIN_ID:
            reply_text = handle_admin_command(message_text, cur, conn)
            if reply_text:
                send_telegram_message(telegram_id, reply_text)
        else:
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
                    "INSERT INTO crm_clients (telegram_id, telegram_username, full_name, status) VALUES (%s, %s, %s, 'new') RETURNING id",
                    (telegram_id, telegram_username, full_name)
                )
                client_id = cur.fetchone()[0]
            
            cur.execute(
                "INSERT INTO crm_messages (client_id, telegram_id, message_text) VALUES (%s, %s, %s)",
                (client_id, telegram_id, message_text)
            )
            
            conn.commit()
            
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
        
        cur.close()
        conn.close()
        
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


def handle_admin_command(text: str, cur, conn):
    '''Обработка команд администратора для управления воркфло'''
    
    text_lower = text.lower().strip()
    
    if text_lower == '/start':
        return "📁 Папки заявок:\n🟢 Новые — /list_new\n🟡 В работе — /list_work\n🔵 Оплата — /list_pay\n🟣 Готово — /list_done"
    
    if text_lower.startswith('/work'):
        parts = text.split()
        if len(parts) < 2:
            return "Укажите ID клиента: /work 123456789"
        telegram_id = int(parts[1])
        cur.execute(
            "UPDATE crm_clients SET status = 'work' WHERE telegram_id = %s",
            (telegram_id,)
        )
        conn.commit()
        return "Перенесено в 🟡 В РАБОТЕ"
    
    if text_lower.startswith('/pay'):
        parts = text.split()
        if len(parts) < 2:
            return "Укажите ID клиента: /pay 123456789"
        telegram_id = int(parts[1])
        cur.execute(
            "UPDATE crm_clients SET status = 'pay' WHERE telegram_id = %s",
            (telegram_id,)
        )
        conn.commit()
        return "Перенесено в 🔵 НА ОПЛАТЕ"
    
    if text_lower.startswith('/done'):
        parts = text.split()
        if len(parts) < 2:
            return "Укажите ID клиента: /done 123456789"
        telegram_id = int(parts[1])
        cur.execute(
            "UPDATE crm_clients SET status = 'done' WHERE telegram_id = %s",
            (telegram_id,)
        )
        conn.commit()
        return "Перенесено в 🟣 ГОТОВО"
    
    if text_lower == '/list_new' or text_lower == '🟢 новые':
        cur.execute(
            "SELECT full_name, telegram_id, telegram_username FROM crm_clients WHERE status = 'new' ORDER BY last_contact DESC"
        )
        clients = cur.fetchall()
        if not clients:
            return "🟢 НОВЫЕ заявки: пусто"
        result = "🟢 НОВЫЕ заявки:\n\n"
        for name, tid, username in clients:
            result += f"🔹 {name} — @{username or 'нет'} (ID: {tid})\n"
        return result
    
    if text_lower == '/list_work' or text_lower == '🟡 в работе':
        cur.execute(
            "SELECT full_name, telegram_id, telegram_username FROM crm_clients WHERE status = 'work' ORDER BY last_contact DESC"
        )
        clients = cur.fetchall()
        if not clients:
            return "🟡 В РАБОТЕ: пусто"
        result = "🟡 В РАБОТЕ:\n\n"
        for name, tid, username in clients:
            result += f"🟡 {name} — @{username or 'нет'} (ID: {tid})\n"
        return result
    
    if text_lower == '/list_pay' or text_lower == '🔵 на оплате':
        cur.execute(
            "SELECT full_name, telegram_id, telegram_username FROM crm_clients WHERE status = 'pay' ORDER BY last_contact DESC"
        )
        clients = cur.fetchall()
        if not clients:
            return "🔵 НА ОПЛАТЕ: пусто"
        result = "🔵 НА ОПЛАТЕ:\n\n"
        for name, tid, username in clients:
            result += f"🔵 {name} — @{username or 'нет'} (ID: {tid})\n"
        return result
    
    if text_lower == '/list_done' or text_lower == '🟣 готово':
        cur.execute(
            "SELECT full_name, telegram_id, telegram_username FROM crm_clients WHERE status = 'done' ORDER BY last_contact DESC"
        )
        clients = cur.fetchall()
        if not clients:
            return "🟣 ГОТОВО: пусто"
        result = "🟣 ГОТОВО:\n\n"
        for name, tid, username in clients:
            result += f"🟣 {name} — @{username or 'нет'} (ID: {tid})\n"
        return result
    
    return None


def send_telegram_message(telegram_id: int, text: str):
    '''Отправка сообщения в Telegram'''
    bot_token = os.environ.get('TELEGRAM_NEW_BOT_TOKEN')
    
    import urllib.request
    import urllib.parse
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = urllib.parse.urlencode({
        'chat_id': telegram_id,
        'text': text
    }).encode()
    
    req = urllib.request.Request(url, data=data)
    urllib.request.urlopen(req)
