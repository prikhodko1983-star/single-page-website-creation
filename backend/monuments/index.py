'''
Business: CRUD API для управления каталогом памятников
Args: event - dict с httpMethod, body, queryStringParameters, pathParams
      context - object с request_id
Returns: HTTP response с данными памятников или результатом операции
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p78642605_single_page_website_'

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
    return conn

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
                'Access-Control-Max-Age': '86400'
            },
            'isBase64Encoded': False,
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if method == 'GET':
            monument_id = event.get('queryStringParameters', {}).get('id')
            
            if monument_id:
                safe_id = monument_id.replace("'", "''")
                cursor.execute(
                    f"SELECT * FROM {SCHEMA}.monuments WHERE id = '{safe_id}'"
                )
                monument = cursor.fetchone()
                
                if not monument:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Monument not found'})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps(dict(monument))
                }
            else:
                cursor.execute(
                    f"SELECT id, title, image_url, price, size, category, created_at, updated_at FROM {SCHEMA}.monuments ORDER BY created_at DESC"
                )
                monuments = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps([dict(m) for m in monuments], default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            title = body_data.get('title', '').replace("'", "''")
            image_url = body_data.get('image_url', '').replace("'", "''")
            price = body_data.get('price', '').replace("'", "''")
            size = body_data.get('size', '').replace("'", "''")
            category = body_data.get('category', 'Вертикальные').replace("'", "''")
            
            if not all([title, image_url, price, size]):
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Missing required fields'})
                }
            
            cursor.execute(
                f"""
                INSERT INTO {SCHEMA}.monuments (title, image_url, price, size, category)
                VALUES ('{title}', '{image_url}', '{price}', '{size}', '{category}')
                RETURNING *
                """
            )
            
            new_monument = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps(dict(new_monument), default=str)
            }
        
        elif method == 'PUT':
            monument_id = event.get('queryStringParameters', {}).get('id')
            
            if not monument_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Monument ID required'})
                }
            
            body_data = json.loads(event.get('body', '{}'))
            
            safe_id = monument_id.replace("'", "''")
            title = body_data.get('title', '').replace("'", "''")
            image_url = body_data.get('image_url', '').replace("'", "''")
            price = body_data.get('price', '').replace("'", "''")
            size = body_data.get('size', '').replace("'", "''")
            category = body_data.get('category', 'Вертикальные').replace("'", "''")
            
            cursor.execute(
                f"""
                UPDATE {SCHEMA}.monuments 
                SET title = '{title}', image_url = '{image_url}', price = '{price}', size = '{size}', category = '{category}',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = '{safe_id}'
                RETURNING *
                """
            )
            
            updated_monument = cursor.fetchone()
            conn.commit()
            
            if not updated_monument:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Monument not found'})
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps(dict(updated_monument), default=str)
            }
        
        elif method == 'DELETE':
            monument_id = event.get('queryStringParameters', {}).get('id')
            
            print(f"DELETE request for monument ID: {monument_id}")
            
            if not monument_id:
                print("Error: No monument ID provided")
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Monument ID required'})
                }
            
            safe_id = monument_id.replace("'", "''")
            print(f"Executing DELETE query for ID: {safe_id}")
            cursor.execute(
                f"DELETE FROM {SCHEMA}.monuments WHERE id = '{safe_id}' RETURNING id"
            )
            
            deleted = cursor.fetchone()
            conn.commit()
            
            print(f"Delete result: {deleted}")
            
            if not deleted:
                print(f"Monument with ID {monument_id} not found")
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Monument not found'})
                }
            
            print(f"Monument {monument_id} successfully deleted")
            return {
                'statusCode': 200,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({'message': 'Monument deleted successfully'})
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()