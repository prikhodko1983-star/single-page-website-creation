import json
import os

def handler(event: dict, context) -> dict:
    '''Генерирует HTML с Open Graph метатегами для ботов соцсетей'''
    
    # Проверяем User-Agent - это бот соцсети или обычный пользователь
    headers = event.get('headers', {})
    user_agent = headers.get('user-agent', '').lower()
    
    # Список ботов соцсетей
    social_bots = [
        'twitterbot', 'facebookexternalhit', 'whatsapp', 
        'telegrambot', 'vkshare', 'pinterest', 'linkedinbot',
        'slackbot', 'discordbot'
    ]
    
    is_bot = any(bot in user_agent for bot in social_bots)
    
    # Получаем slug товара из query параметров
    query_params = event.get('queryStringParameters', {})
    slug = query_params.get('slug', '')
    
    # Если это не бот или нет slug - редирект на фронт
    if not is_bot or not slug:
        return {
            'statusCode': 302,
            'headers': {
                'Location': f'https://мастер-гранит.рф/product/{slug}' if slug else 'https://мастер-гранит.рф/',
                'Access-Control-Allow-Origin': '*'
            },
            'body': ''
        }
    
    # Загружаем данные товара из основного API
    import urllib.request
    
    try:
        api_url = f'https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d?slug={slug}'
        with urllib.request.urlopen(api_url) as response:
            product = json.loads(response.read().decode())
    except Exception as e:
        # Если товар не найден - редирект
        return {
            'statusCode': 302,
            'headers': {
                'Location': 'https://мастер-гранит.рф/catalog',
                'Access-Control-Allow-Origin': '*'
            },
            'body': ''
        }
    
    # Формируем данные для OG
    image_url = product.get('image_url') or 'https://cdn.poehali.dev/files/7c3f7bb6-620d-4495-bf82-0abd8136ff4b.png'
    price = float(product.get('price', 0))
    price_text = f"{'от ' if product.get('is_price_from') else ''}{price:,.0f}".replace(',', ' ') + ' ₽'
    title = f"{product.get('name')} — {price_text} | Гранитные памятники"
    description = product.get('description') or f"{product.get('name')}. {product.get('material', 'Гранит')}. {product.get('size', '')}. Цена: {price_text}"
    product_url = f"https://мастер-гранит.рф/product/{slug}"
    
    # Генерируем HTML с метатегами
    html = f'''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{description}">
    
    <!-- Open Graph -->
    <meta property="og:type" content="product">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="{image_url}">
    <meta property="og:image:secure_url" content="{image_url}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{product.get('name')}">
    <meta property="og:url" content="{product_url}">
    <meta property="og:site_name" content="Гранит Мастер">
    <meta property="og:locale" content="ru_RU">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{image_url}">
    <meta name="twitter:image:alt" content="{product.get('name')}">
    
    <!-- Product Schema -->
    <meta property="product:price:amount" content="{price}">
    <meta property="product:price:currency" content="RUB">
    
    <!-- Редирект на основной сайт -->
    <meta http-equiv="refresh" content="0;url={product_url}">
    <script>window.location.href = "{product_url}";</script>
</head>
<body>
    <h1>{product.get('name')}</h1>
    <p>Цена: {price_text}</p>
    <p>{description}</p>
    <img src="{image_url}" alt="{product.get('name')}">
    <p>Загрузка...</p>
    <a href="{product_url}">Перейти на страницу товара</a>
</body>
</html>'''
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600'
        },
        'body': html,
        'isBase64Encoded': False
    }