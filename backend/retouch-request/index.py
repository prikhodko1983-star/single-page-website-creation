"""
Обработка заявок на ретушь фотографий.
Принимает multipart/form-data с файлом фото и данными клиента.
Отправляет заявку в Telegram бот.
"""
import json
import base64
import os
import urllib.request
import urllib.parse
from typing import Dict, Any

def parse_multipart(body: str, content_type: str) -> Dict[str, Any]:
    """
    Парсит multipart/form-data.
    
    Args:
        body: тело запроса
        content_type: заголовок Content-Type
        
    Returns:
        словарь с полями формы и файлом
    """
    boundary = content_type.split('boundary=')[-1].strip()
    parts = body.split(f'--{boundary}')
    
    result = {'fields': {}, 'file': None}
    
    for part in parts:
        if not part.strip() or part.strip() == '--':
            continue
            
        lines = part.split('\r\n')
        
        # Ищем Content-Disposition
        disposition_line = None
        for line in lines:
            if 'Content-Disposition' in line:
                disposition_line = line
                break
        
        if not disposition_line:
            continue
        
        # Извлекаем имя поля
        name_start = disposition_line.find('name="')
        if name_start == -1:
            continue
        name_start += 6
        name_end = disposition_line.find('"', name_start)
        field_name = disposition_line[name_start:name_end]
        
        # Проверяем, это файл или обычное поле
        if 'filename=' in disposition_line:
            # Это файл
            filename_start = disposition_line.find('filename="') + 10
            filename_end = disposition_line.find('"', filename_start)
            filename = disposition_line[filename_start:filename_end]
            
            # Находим пустую строку (разделитель заголовков и данных)
            data_start = part.find('\r\n\r\n') + 4
            data = part[data_start:].rstrip('\r\n')
            
            result['file'] = {
                'name': field_name,
                'filename': filename,
                'data': data
            }
        else:
            # Обычное поле
            data_start = part.find('\r\n\r\n') + 4
            value = part[data_start:].strip()
            result['fields'][field_name] = value
    
    return result

def send_to_telegram(token: str, chat_id: str, name: str, phone: str, comment: str, photo_data: bytes, filename: str) -> bool:
    """
    Отправляет заявку в Telegram.
    
    Args:
        token: токен Telegram бота
        chat_id: ID чата
        name: имя клиента
        phone: телефон клиента
        comment: комментарий
        photo_data: данные фото
        filename: имя файла
        
    Returns:
        True если успешно отправлено
    """
    # Формируем текст сообщения
    message = f"🔔 Новая заявка на ретушь!\n\n"
    message += f"👤 Имя: {name}\n"
    message += f"📞 Телефон: {phone}\n"
    if comment:
        message += f"💬 Комментарий: {comment}\n"
    
    # Отправляем фото с подписью
    url = f"https://api.telegram.org/bot{token}/sendPhoto"
    
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = []
    
    # Добавляем chat_id
    body.append(f'--{boundary}'.encode())
    body.append(b'Content-Disposition: form-data; name="chat_id"\r\n\r\n')
    body.append(chat_id.encode())
    body.append(b'\r\n')
    
    # Добавляем caption
    body.append(f'--{boundary}'.encode())
    body.append(b'Content-Disposition: form-data; name="caption"\r\n\r\n')
    body.append(message.encode('utf-8'))
    body.append(b'\r\n')
    
    # Добавляем фото
    body.append(f'--{boundary}'.encode())
    body.append(f'Content-Disposition: form-data; name="photo"; filename="{filename}"\r\n'.encode())
    body.append(b'Content-Type: image/jpeg\r\n\r\n')
    body.append(photo_data)
    body.append(b'\r\n')
    
    body.append(f'--{boundary}--'.encode())
    
    body_bytes = b'\r\n'.join(body)
    
    headers = {
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Content-Length': str(len(body_bytes))
    }
    
    req = urllib.request.Request(url, data=body_bytes, headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode())
            return result.get('ok', False)
    except Exception as e:
        print(f"Telegram error: {e}")
        return False

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обрабатывает заявку на ретушь фото.
    
    Args:
        event: HTTP событие с multipart/form-data
        context: контекст выполнения
        
    Returns:
        JSON ответ с результатом обработки
    """
    method = event.get('httpMethod', 'POST')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
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
        # Получаем токен и chat_id из переменных окружения
        telegram_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        telegram_chat_id = os.environ.get('TELEGRAM_CHAT_ID')
        
        if not telegram_token or not telegram_chat_id:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Telegram не настроен'
                }),
                'isBase64Encoded': False
            }
        
        # Получаем Content-Type
        headers = event.get('headers', {})
        content_type = headers.get('content-type') or headers.get('Content-Type', '')
        
        # Парсим multipart/form-data
        body = event.get('body', '')
        is_base64 = event.get('isBase64Encoded', False)
        
        if is_base64:
            body = base64.b64decode(body).decode('utf-8')
        
        parsed = parse_multipart(body, content_type)
        
        # Извлекаем данные
        name = parsed['fields'].get('name', '')
        phone = parsed['fields'].get('phone', '')
        comment = parsed['fields'].get('comment', '')
        
        if not name or not phone:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Не указаны обязательные поля'
                }),
                'isBase64Encoded': False
            }
        
        if not parsed['file']:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Не загружен файл'
                }),
                'isBase64Encoded': False
            }
        
        # Отправляем в Telegram
        photo_data = parsed['file']['data'].encode('latin-1')
        filename = parsed['file']['filename']
        
        success = send_to_telegram(
            telegram_token,
            telegram_chat_id,
            name,
            phone,
            comment,
            photo_data,
            filename
        )
        
        if success:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Заявка успешно отправлена'
                }),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Ошибка отправки в Telegram'
                }),
                'isBase64Encoded': False
            }
        
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': f'Ошибка сервера: {str(e)}'
            }),
            'isBase64Encoded': False
        }
