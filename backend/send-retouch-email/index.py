"""
Отправка заявки на ретушь фото на email.
Принимает JSON с base64-фото, именем, email клиента и комментарием.
Защита от спама через honeypot-поле.
Проверяет тип файла — принимает только изображения.
"""
import json
import base64
import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from typing import Dict, Any

ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'
}

ALLOWED_SIGNATURES = {
    b'\xff\xd8\xff': 'image/jpeg',
    b'\x89PNG': 'image/png',
    b'GIF8': 'image/gif',
    b'RIFF': 'image/webp',
}

def detect_image_type(data: bytes) -> str | None:
    for sig, mime in ALLOWED_SIGNATURES.items():
        if data[:len(sig)] == sig:
            return mime
    return None


def send_email(name: str, client_email: str, comment: str, photo_data: bytes, filename: str) -> bool:
    smtp_host = os.environ.get('SMTP_HOST', '')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    email_to = os.environ.get('EMAIL_TO', smtp_user)

    msg = MIMEMultipart('mixed')
    msg['Subject'] = f'Новая заявка на ретушь от {name}'
    msg['From'] = smtp_user
    msg['To'] = email_to
    msg['Reply-To'] = client_email if client_email else smtp_user

    body = f"""Новая заявка на ретушь фото

Имя: {name}
Email: {client_email}
Комментарий: {comment if comment else '—'}

Фото прикреплено к письму.
"""
    msg.attach(MIMEText(body, 'plain', 'utf-8'))

    img_part = MIMEImage(photo_data)
    img_part.add_header('Content-Disposition', 'attachment', filename=filename or 'photo.jpg')
    msg.attach(img_part)

    context = ssl.create_default_context()
    if smtp_port == 465:
        with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context, timeout=25) as server:
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, email_to, msg.as_bytes())
    else:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=25) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, email_to, msg.as_bytes())

    return True


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Принимает заявку на ретушь и отправляет письмо с фото на почту владельца."""

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**cors_headers, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': {'Content-Type': 'application/json', **cors_headers},
                'body': json.dumps({'error': 'Method not allowed'})}

    body_str = event.get('body', '{}')
    data = json.loads(body_str) if body_str else {}

    # Honeypot: если поле заполнено — это бот
    if data.get('website', ''):
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', **cors_headers},
                'body': json.dumps({'success': True})}

    name = (data.get('name') or '').strip()
    client_email = (data.get('email') or '').strip()
    comment = (data.get('comment') or '').strip()
    photo_b64 = data.get('photo', '')
    filename = (data.get('filename') or 'photo.jpg').strip()
    declared_type = (data.get('fileType') or '').lower().strip()

    if not name or not client_email:
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', **cors_headers},
                'body': json.dumps({'success': False, 'error': 'Заполните обязательные поля'})}

    if '@' not in client_email or '.' not in client_email.split('@')[-1]:
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', **cors_headers},
                'body': json.dumps({'success': False, 'error': 'Некорректный email'})}

    if not photo_b64:
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', **cors_headers},
                'body': json.dumps({'success': False, 'error': 'Прикрепите фотографию'})}

    # Проверка типа файла по declared MIME
    if declared_type and declared_type not in ALLOWED_MIME_TYPES:
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', **cors_headers},
                'body': json.dumps({'success': False, 'error': 'Можно загружать только изображения (JPEG, PNG, WEBP, GIF)'})}

    # Декодируем фото
    photo_bytes = base64.b64decode(photo_b64)

    # Проверка по сигнатуре файла (magic bytes)
    detected = detect_image_type(photo_bytes)
    if not detected:
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', **cors_headers},
                'body': json.dumps({'success': False, 'error': 'Файл не является изображением'})}

    # Ограничение размера: 10 МБ
    if len(photo_bytes) > 10 * 1024 * 1024:
        return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', **cors_headers},
                'body': json.dumps({'success': False, 'error': 'Размер файла превышает 10 МБ'})}

    send_email(name, client_email, comment, photo_bytes, filename)

    return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', **cors_headers},
            'body': json.dumps({'success': True, 'message': 'Заявка отправлена'})}
