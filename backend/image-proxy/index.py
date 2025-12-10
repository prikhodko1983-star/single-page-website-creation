import json
import urllib.request
import base64
from typing import Dict, Any
from urllib.parse import unquote

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Проксирует изображения с внешних источников, добавляя CORS-заголовки.
    Позволяет загружать изображения в canvas без ограничений CORS.
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {}) or {}
    image_url = params.get('url', '')
    
    if not image_url:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing url parameter'}),
            'isBase64Encoded': False
        }
    
    image_url = unquote(image_url)
    
    if not (image_url.startswith('https://storage.yandexcloud.net/') or 
            image_url.startswith('https://cdn.poehali.dev/')):
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'URL not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
        
        with urllib.request.urlopen(req, timeout=10) as response:
            image_data = response.read()
            content_type = response.headers.get('Content-Type', 'image/jpeg')
            
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': content_type,
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=86400'
                },
                'body': image_base64,
                'isBase64Encoded': True
            }
    
    except urllib.error.HTTPError as e:
        return {
            'statusCode': e.code,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'HTTP error: {e.code}'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
