import json
import base64
from io import BytesIO
from PIL import Image
import requests

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
        
        # Конвертируем в RGBA если нужно
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Получаем данные пикселей
        pixels = img.load()
        width, height = img.size
        
        # Обрабатываем каждый пиксель
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                
                # Нормализуем
                r_norm = r / 255.0
                g_norm = g / 255.0
                b_norm = b / 255.0
                
                # Вычисляем яркость
                luminance = 0.299 * r_norm + 0.587 * g_norm + 0.114 * b_norm
                
                # Применяем screen blend mode
                screen_r = 1 - (1 - r_norm) * (1 - 0.5)
                screen_g = 1 - (1 - g_norm) * (1 - 0.5)
                screen_b = 1 - (1 - b_norm) * (1 - 0.5)
                
                # Устанавливаем новые значения
                new_r = int(screen_r * 255)
                new_g = int(screen_g * 255)
                new_b = int(screen_b * 255)
                new_a = int(pow(luminance, 0.7) * 255)
                
                pixels[x, y] = (new_r, new_g, new_b, new_a)
        
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
