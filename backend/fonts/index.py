import json
import os
import base64
import psycopg2
from typing import Any, Dict

def get_db_connection():
    '''Подключение к PostgreSQL через DATABASE_URL'''
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise Exception('DATABASE_URL not set')
    return psycopg2.connect(dsn)

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
            
            body_str = event.get('body', '{}')
            body = json.loads(body_str)
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
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute(
                "INSERT INTO fonts (filename, display_name, font_data) VALUES (%s, %s, %s) RETURNING id",
                (filename, display_name, file_data)
            )
            font_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'id': font_id,
                    'filename': filename,
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
            
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("DELETE FROM fonts WHERE filename = %s", (filename,))
            conn.commit()
            cur.close()
            conn.close()
            
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
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()
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
    '''Получить список всех шрифтов из БД'''
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, filename, display_name, font_data FROM fonts ORDER BY id")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        fonts = []
        for row in rows:
            font_id, filename, display_name, font_data = row
            fonts.append({
                'id': font_id,
                'filename': filename,
                'name': display_name,
                'url': f'data:font/ttf;base64,{font_data}'
            })
        
        return fonts
    except Exception as e:
        print(f'Error listing fonts: {e}')
        import traceback
        traceback.print_exc()
        return []
