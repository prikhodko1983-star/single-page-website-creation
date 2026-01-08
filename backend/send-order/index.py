import json
import os
import urllib.request
import urllib.parse

def handler(event: dict, context) -> dict:
    '''Отправка заказа в Telegram-группу'''
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
        phone = body.get('phone', '').strip()
        items = body.get('items', [])
        total_price = body.get('total_price', 0)
        
        if not name or not phone:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Имя и телефон обязательны'}),
                'isBase64Encoded': False
            }
        
        if not items:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Корзина пуста'}),
                'isBase64Encoded': False
            }
        
        bot_token = os.environ.get('TELEGRAM_ORDERS_BOT_TOKEN')
        chat_id = os.environ.get('TELEGRAM_ORDERS_CHAT_ID')
        
        if not bot_token or not chat_id:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Telegram не настроен'}),
                'isBase64Encoded': False
            }
        
        # Формируем сообщение
        message_lines = [
            '🛒 <b>Новый заказ с сайта</b>',
            '',
            f'👤 <b>Имя:</b> {name}',
            f'📱 <b>Телефон:</b> {phone}',
            '',
            '<b>📦 Заказанные товары:</b>'
        ]
        
        for item in items:
            item_name = item.get('name', 'Без названия')
            item_quantity = item.get('quantity', 1)
            item_price = item.get('price', 0)
            message_lines.append(f'• {item_name} x{item_quantity} — {float(item_price) * item_quantity:,.0f} ₽')
        
        message_lines.append('')
        message_lines.append(f'💰 <b>Итого:</b> {float(total_price):,.0f} ₽')
        
        message = '\n'.join(message_lines)
        
        # Отправляем в Telegram
        telegram_url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        data = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }
        
        req = urllib.request.Request(
            telegram_url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            if result.get('ok'):
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Заказ отправлен'}),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Ошибка отправки в Telegram'}),
                    'isBase64Encoded': False
                }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }