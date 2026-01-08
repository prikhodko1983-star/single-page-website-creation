"""
Обработка заявок на ретушь фотографий.
Принимает multipart/form-data с файлом фото и данными клиента.
Отправляет заявку в Telegram бот.
"""
import json
import base64
import os
import urllib.request
from typing import Dict, Any, Tuple

def parse_multipart_bytes(body_bytes: bytes, boundary: str) -> Tuple[Dict[str, str], bytes, str]:
    """
    Парсит multipart/form-data из bytes.
    
    Args:
        body_bytes: тело запроса в bytes
        boundary: граница между частями
        
    Returns:
        кортеж (поля формы, данные файла, имя файла)
    """
    boundary_bytes = f'--{boundary}'.encode()
    parts = body_bytes.split(boundary_bytes)
    
    fields = {}
    photo_data = None
    filename = ''
    
    for part in parts:
        if not part.strip() or part.strip() == b'--':
            continue
        
        # Ищем разделитель заголовков и данных
        header_end = part.find(b'\r\n\r\n')
        if header_end == -1:
            continue
        
        headers = part[:header_end].decode('utf-8', errors='ignore')
        data = part[header_end + 4:]
        
        # Убираем trailing \r\n
        if data.endswith(b'\r\n'):
            data = data[:-2]
        
        # Проверяем Content-Disposition
        if 'Content-Disposition' not in headers:
            continue
        
        # Извлекаем имя поля
        name_start = headers.find('name="')
        if name_start == -1:
            continue
        name_start += 6
        name_end = headers.find('"', name_start)
        field_name = headers[name_start:name_end]
        
        # Проверяем, это файл или обычное поле
        if 'filename=' in headers:
            # Это файл
            filename_start = headers.find('filename="') + 10
            filename_end = headers.find('"', filename_start)
            filename = headers[filename_start:filename_end]
            photo_data = data
        else:
            # Обычное текстовое поле
            fields[field_name] = data.decode('utf-8', errors='ignore')
    
    return fields, photo_data, filename

def send_to_telegram(token: str, chat_id: str, name: str, phone: str, comment: str, photo_data: bytes, filename: str, topic_id: str = None) -> bool:
    """
    Отправляет заявку в Telegram.
    
    Args:
        token: токен Telegram бота
        chat_id: ID чата
        name: имя клиента
        phone: телефон клиента
        comment: комментарий
        photo_data: данные фото в bytes
        filename: имя файла
        topic_id: ID темы (топика) для отправки сообщения
        
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
    body.append(f'--{boundary}\r\n'.encode())
    body.append(b'Content-Disposition: form-data; name="chat_id"\r\n\r\n')
    body.append(chat_id.encode())
    body.append(b'\r\n')
    
    # Добавляем message_thread_id если указан topic_id
    if topic_id:
        body.append(f'--{boundary}\r\n'.encode())
        body.append(b'Content-Disposition: form-data; name="message_thread_id"\r\n\r\n')
        body.append(topic_id.encode())
        body.append(b'\r\n')
    
    # Добавляем caption
    body.append(f'--{boundary}\r\n'.encode())
    body.append(b'Content-Disposition: form-data; name="caption"\r\n\r\n')
    body.append(message.encode('utf-8'))
    body.append(b'\r\n')
    
    # Добавляем фото
    body.append(f'--{boundary}\r\n'.encode())
    body.append(f'Content-Disposition: form-data; name="photo"; filename="{filename}"\r\n'.encode())
    body.append(b'Content-Type: image/jpeg\r\n\r\n')
    body.append(photo_data)
    body.append(b'\r\n')
    
    body.append(f'--{boundary}--\r\n'.encode())
    
    body_bytes = b''.join(body)
    
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
        # Получаем токен, chat_id и topic_id из переменных окружения
        telegram_token = os.environ.get('TELEGRAM_BOT_TOKEN', '8230420684:AAEL95wk4Np-dLdEtCqJEJA8wGZATeiUsEI')
        telegram_chat_id = os.environ.get('TELEGRAM_CHAT_ID', '8230420684')
        telegram_chat_id_2 = os.environ.get('TELEGRAM_CHAT_ID_2', '')
        telegram_topic_id = os.environ.get('TELEGRAM_TOPIC_ID', '')
        
        # Получаем Content-Type
        headers = event.get('headers', {})
        content_type = headers.get('content-type') or headers.get('Content-Type', '')
        
        # Извлекаем boundary
        if 'boundary=' not in content_type:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Invalid Content-Type'
                }),
                'isBase64Encoded': False
            }
        
        boundary = content_type.split('boundary=')[-1].strip()
        
        # Получаем body как bytes
        body = event.get('body', '')
        is_base64 = event.get('isBase64Encoded', False)
        
        if is_base64:
            body_bytes = base64.b64decode(body)
        else:
            body_bytes = body.encode('latin-1')
        
        # Парсим multipart/form-data
        fields, photo_data, filename = parse_multipart_bytes(body_bytes, boundary)
        
        # Извлекаем данные
        name = fields.get('name', '').strip()
        phone = fields.get('phone', '').strip()
        comment = fields.get('comment', '').strip()
        
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
        
        if not photo_data:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Не загружен файл'
                }),
                'isBase64Encoded': False
            }
        
        # Отправляем в первую группу
        success1 = send_to_telegram(
            telegram_token,
            telegram_chat_id,
            name,
            phone,
            comment,
            photo_data,
            filename,
            telegram_topic_id if telegram_topic_id else None
        )
        
        # Отправляем во вторую группу (если указана)
        success2 = True
        if telegram_chat_id_2:
            success2 = send_to_telegram(
                telegram_token,
                telegram_chat_id_2,
                name,
                phone,
                comment,
                photo_data,
                filename,
                None  # Во второй группе топики не используем
            )
        
        if success1:
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
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': f'Ошибка сервера: {str(e)}'
            }),
            'isBase64Encoded': False
        }