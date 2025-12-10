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

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handle_crosses(conn, cursor, method: str, event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Обработка запросов для крестов'''
    params = event.get('queryStringParameters', {})
    
    if method == 'GET':
        cross_id = params.get('id')
        if cross_id:
            safe_id = cross_id.replace("'", "''")
            cursor.execute(f"SELECT * FROM crosses WHERE id = '{safe_id}'")
            cross = cursor.fetchone()
            
            if not cross:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Cross not found'})
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps(dict(cross), default=str)
            }
        else:
            cursor.execute("SELECT * FROM crosses WHERE is_active = true ORDER BY display_order, name")
            crosses = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps([dict(c) for c in crosses], default=str)
            }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        name = body_data.get('name', '').replace("'", "''")
        image_url = body_data.get('image_url', '').replace("'", "''")
        display_order = body_data.get('display_order', 999)
        
        if not name or not image_url:
            return {
                'statusCode': 400,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Name and image_url are required'})
            }
        
        cursor.execute(
            f"""
            INSERT INTO crosses (name, image_url, display_order, is_active)
            VALUES ('{name}', '{image_url}', {display_order}, true)
            RETURNING *
            """
        )
        new_cross = cursor.fetchone()
        conn.commit()
        
        return {
            'statusCode': 201,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps(dict(new_cross), default=str)
        }
    
    elif method == 'PUT':
        cross_id = params.get('id')
        if not cross_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Cross ID required'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        safe_id = cross_id.replace("'", "''")
        name = body_data.get('name', '').replace("'", "''")
        image_url = body_data.get('image_url', '').replace("'", "''")
        display_order = body_data.get('display_order', 999)
        
        cursor.execute(
            f"""
            UPDATE crosses 
            SET name = '{name}', image_url = '{image_url}', display_order = {display_order}, updated_at = NOW()
            WHERE id = '{safe_id}'
            RETURNING *
            """
        )
        updated_cross = cursor.fetchone()
        conn.commit()
        
        if not updated_cross:
            return {
                'statusCode': 404,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Cross not found'})
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps(dict(updated_cross), default=str)
        }
    
    elif method == 'DELETE':
        cross_id = params.get('id')
        if not cross_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Cross ID required'})
            }
        
        safe_id = cross_id.replace("'", "''")
        cursor.execute(f"DELETE FROM crosses WHERE id = '{safe_id}' RETURNING id")
        deleted = cursor.fetchone()
        conn.commit()
        
        if not deleted:
            return {
                'statusCode': 404,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Cross not found'})
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'message': 'Cross deleted successfully'})
        }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }

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
        params = event.get('queryStringParameters', {})
        
        if params.get('type') == 'crosses':
            return handle_crosses(conn, cursor, method, event, headers)
        
        if method == 'GET':
            monument_id = params.get('id')
            
            if monument_id:
                safe_id = monument_id.replace("'", "''")
                cursor.execute(
                    f"SELECT * FROM t_p78642605_single_page_website_.monuments WHERE id = '{safe_id}'"
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
                    "SELECT id, title, image_url, price, size, category, created_at, updated_at FROM t_p78642605_single_page_website_.monuments ORDER BY created_at DESC"
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
                INSERT INTO t_p78642605_single_page_website_.monuments (title, image_url, price, size, category)
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
                UPDATE t_p78642605_single_page_website_.monuments 
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
                f"DELETE FROM t_p78642605_single_page_website_.monuments WHERE id = '{safe_id}' RETURNING id"
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