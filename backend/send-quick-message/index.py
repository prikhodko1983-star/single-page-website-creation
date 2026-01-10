import json
import os
import requests
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Быстрая отправка сообщения в Telegram-группу'''
    # Updated: 2026-01-10 - новый токен бота
    method = event.get('httpMethod', 'POST')
    
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_str = event.get('body', '{}')
        if not body_str:
            body_str = '{}'
        body = json.loads(body_str)
        
        name = body.get('name', '').strip()
        email = body.get('email', '').strip()
        phone = body.get('phone', '').strip()
        message = body.get('message', '').strip()
        source = body.get('source', 'Сайт').strip()
        date = datetime.now().strftime('%d.%m.%Y %H:%M:%S')
        
        if not phone:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Телефон обязателен'}),
                'isBase64Encoded': False
            }
        
        # Используем новые секреты
        bot_token = os.environ.get('TELEGRAM_NEW_BOT_TOKEN') or os.environ.get('TELEGRAM_ORDERS_BOT_TOKEN')
        chat_id_str = os.environ.get('TELEGRAM_NEW_CHAT_ID') or os.environ.get('TELEGRAM_ORDERS_CHAT_ID')
        
        print(f'DEBUG: bot_token = "{bot_token[:20] if bot_token else None}..." (exists={bool(bot_token)})')
        print(f'DEBUG: chat_id_str = "{chat_id_str}" (type={type(chat_id_str)})')
        
        if not bot_token or not chat_id_str:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Telegram не настроен'}),
                'isBase64Encoded': False
            }
        
        # Формируем сообщение по вашему шаблону
        message_lines = ['🔔 <b>Новое сообщение с сайта:</b>', '']
        
        if name:
            message_lines.append(f'<b>Имя:</b> {name}')
        
        if email:
            message_lines.append(f'<b>E-mail:</b> {email}')
        
        if phone:
            message_lines.append(f'<b>Телефон:</b> {phone}')
        
        if message:
            message_lines.append(f'<b>Сообщение:</b> {message}')
        
        message_lines.append(f'<b>Источник:</b> {source}')
        message_lines.append(f'<b>Время:</b> {date}')
        
        telegram_message = '\n'.join(message_lines)
        
        # Отправляем в Telegram (группа менеджеров)
        telegram_url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        chat_id = int(chat_id_str)  # Используем chat_id из секретов
        print(f'DEBUG: Sending to {telegram_url[:50]}...')
        print(f'DEBUG: chat_id = {chat_id}')
        
        data = {
            'chat_id': chat_id,
            'text': telegram_message,
            'parse_mode': 'HTML'
        }
        
        try:
            response = requests.post(
                telegram_url,
                json=data,
                timeout=10
            )
            result = response.json()
            print(f'DEBUG: Telegram response: {result}')
            
            if result.get('ok'):
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Сообщение отправлено'}),
                    'isBase64Encoded': False
                }
            else:
                error_msg = result.get('description', 'Неизвестная ошибка')
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Telegram API: {error_msg}'}),
                    'isBase64Encoded': False
                }
        except requests.exceptions.RequestException as e:
            print(f'DEBUG: Request exception: {str(e)}')
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Ошибка соединения: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка: {str(e)}'}),
            'isBase64Encoded': False
        }