import json
import os
import base64
import boto3
from typing import Any, Dict

s3 = boto3.client('s3',
    endpoint_url='https://bucket.poehali.dev',
    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
)

BUCKET = 'files'
FONTS_PREFIX = 'fonts/'

def handler(event: dict, context: Any) -> Dict[str, Any]:
    '''API для управления шрифтами в конструкторе'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token', '')
    
    try:
        if method == 'GET':
            fonts = list_fonts()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(fonts),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            filename = body.get('filename', '')
            file_data = body.get('data', '')
            display_name = body.get('name', filename)
            
            if not filename or not file_data:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing filename or data'}),
                    'isBase64Encoded': False
                }
            
            file_bytes = base64.b64decode(file_data)
            
            s3_key = f'{FONTS_PREFIX}{filename}'
            s3.put_object(
                Bucket=BUCKET,
                Key=s3_key,
                Body=file_bytes,
                ContentType='font/ttf',
                Metadata={'display_name': display_name}
            )
            
            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{s3_key}"
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'filename': filename,
                    'url': cdn_url,
                    'name': display_name
                }),
                'isBase64Encoded': False
            }
        
        if method == 'DELETE':
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            query_params = event.get('queryStringParameters', {}) or {}
            filename = query_params.get('filename', '')
            
            if not filename:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing filename'}),
                    'isBase64Encoded': False
                }
            
            s3_key = f'{FONTS_PREFIX}{filename}'
            s3.delete_object(Bucket=BUCKET, Key=s3_key)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Font deleted'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def list_fonts():
    '''Получить список всех шрифтов из S3'''
    fonts = []
    
    try:
        response = s3.list_objects_v2(Bucket=BUCKET, Prefix=FONTS_PREFIX)
        
        if 'Contents' in response:
            for obj in response['Contents']:
                key = obj['Key']
                if key == FONTS_PREFIX:
                    continue
                    
                filename = key.replace(FONTS_PREFIX, '')
                
                head = s3.head_object(Bucket=BUCKET, Key=key)
                metadata = head.get('Metadata', {})
                display_name = metadata.get('display_name', filename.replace('.ttf', '').replace('.otf', ''))
                
                cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
                
                fonts.append({
                    'filename': filename,
                    'name': display_name,
                    'url': cdn_url
                })
    
    except Exception as e:
        print(f'Error listing fonts: {e}')
    
    return fonts
