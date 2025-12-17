import json
import base64
from io import BytesIO
from PIL import Image
import requests
import numpy as np

def handler(event, context):
    '''
    Обрабатывает изображение в режиме "Экран" - убирает чёрный фон
    Args: event - dict с httpMethod, body (JSON с image_url)
          context - объект с request_id
    Returns: HTTP response с обработанным изображением в base64
    '''
    method = event.get('httpMethod', 'GET')
    
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
        body_data = json.loads(event.get('body', '{}'))
        image_url = body_data.get('image_url')
        
        if not image_url:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'image_url is required'}),
                'isBase64Encoded': False
            }
        
        # Скачиваем изображение
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        
        # Открываем изображение
        img = Image.open(BytesIO(response.content))
        
        # Уменьшаем размер для ускорения обработки
        max_size = 1200
        if img.width > max_size or img.height > max_size:
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        
        # Конвертируем в RGBA если нужно
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Конвертируем в numpy array для быстрой обработки
        img_array = np.array(img, dtype=np.float32) / 255.0
        
        # Разделяем каналы
        r, g, b, a = img_array[:, :, 0], img_array[:, :, 1], img_array[:, :, 2], img_array[:, :, 3]
        
        # Вычисляем яркость
        luminance = 0.299 * r + 0.587 * g + 0.114 * b
        
        # Применяем screen blend mode (векторная операция)
        screen_r = 1 - (1 - r) * 0.5
        screen_g = 1 - (1 - g) * 0.5
        screen_b = 1 - (1 - b) * 0.5
        
        # Новый альфа-канал на основе яркости
        new_a = np.power(luminance, 0.7)
        
        # Собираем обратно
        result = np.stack([screen_r, screen_g, screen_b, new_a], axis=2)
        result = (result * 255).astype(np.uint8)
        
        # Создаем новое изображение
        img = Image.fromarray(result, 'RGBA')
        
        # Сохраняем в буфер
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Конвертируем в base64
        img_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        data_url = f'data:image/png;base64,{img_base64}'
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'processed_image': data_url}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }