import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Сохранение и загрузка дизайнов памятников в базу данных
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с request_id и другими атрибутами
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # CORS
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    # Подключение к БД
    dsn = os.environ['DATABASE_URL']
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        if method == 'GET':
            # Получить все дизайны
            cursor.execute('''
                SELECT id, monument_image, elements, created_at 
                FROM monument_designs 
                ORDER BY created_at DESC
            ''')
            rows = cursor.fetchall()
            
            designs = []
            for row in rows:
                designs.append({
                    'id': row[0],
                    'monumentImage': row[1],
                    'elements': row[2],
                    'timestamp': int(row[3].timestamp() * 1000)
                })
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(designs),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Сохранить новый дизайн
            body_data = json.loads(event.get('body', '{}'))
            monument_image = body_data.get('monumentImage')
            elements = body_data.get('elements', [])
            
            if not monument_image or not elements:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Отсутствуют данные дизайна'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                INSERT INTO monument_designs (monument_image, elements)
                VALUES (%s, %s)
                RETURNING id, created_at
            ''', (monument_image, json.dumps(elements)))
            
            row = cursor.fetchone()
            conn.commit()
            
            result = {
                'id': row[0],
                'timestamp': int(row[1].timestamp() * 1000),
                'success': True
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Удалить дизайн
            params = event.get('queryStringParameters', {})
            design_id = params.get('id')
            
            if not design_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'ID не указан'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM monument_designs WHERE id = %s', (design_id,))
            conn.commit()
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            cursor.close()
            conn.close()
            return {
                'statusCode': 405,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Метод не поддерживается'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
