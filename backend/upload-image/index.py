'''
Business: Загрузка изображений на CDN сервер
Args: event - dict с httpMethod, body (base64 encoded image)
      context - object с request_id
Returns: HTTP response с URL загруженного изображения
'''

import json
import base64
import uuid
import os
from typing import Dict, Any
import boto3
from botocore.client import Config

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        image_base64 = body_data.get('image')
        file_extension = body_data.get('extension', 'jpg')
        
        print(f"Received upload request with extension: {file_extension}")
        
        if not image_base64:
            print("Error: No image provided in request")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No image provided'})
            }
        
        original_image = image_base64
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        s3_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
        s3_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
        
        print(f"S3 keys available: {bool(s3_access_key and s3_secret_key)}")
        
        if s3_access_key and s3_secret_key:
            image_data = base64.b64decode(image_base64)
            
            file_id = str(uuid.uuid4())
            file_name = f"{file_id}.{file_extension}"
            
            s3_client = boto3.client(
                's3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=s3_access_key,
                aws_secret_access_key=s3_secret_key
            )
            
            bucket_name = 'files'
            
            content_type_map = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'webp': 'image/webp'
            }
            
            s3_client.put_object(
                Bucket=bucket_name,
                Key=file_name,
                Body=image_data,
                ContentType=content_type_map.get(file_extension, 'image/jpeg')
            )
            
            image_url = f'https://cdn.poehali.dev/projects/{s3_access_key}/bucket/{file_name}'
        else:
            file_id = str(uuid.uuid4())
            content_type_map = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'webp': 'image/webp',
                'heic': 'image/heic'
            }
            mime_type = content_type_map.get(file_extension, 'image/jpeg')
            image_url = f'data:{mime_type};base64,{image_base64}'
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'url': image_url,
                'file_id': file_id
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }