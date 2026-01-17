import json
import os
import psycopg2
import urllib.request
import urllib.parse

def handler(event: dict, context) -> dict:
    '''API для роботи з CRM повідомленнями: перегляд клієнтів та відправка відповідей'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        schema = 't_p78642605_single_page_website_'
        
        if method == 'GET':
            # Отримати список клієнтів з останніми повідомленнями
            cur.execute(f"""
                SELECT 
                    c.id,
                    c.telegram_id,
                    c.telegram_username,
                    c.full_name,
                    c.first_contact,
                    c.last_contact,
                    COUNT(m.id) as message_count,
                    MAX(m.created_at) as last_message_time,
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', m2.id,
                                'message_text', m2.message_text,
                                'created_at', m2.created_at
                            ) ORDER BY m2.created_at DESC
                        )
                        FROM {schema}.crm_messages m2 
                        WHERE m2.client_id = c.id
                    ) as messages
                FROM {schema}.crm_clients c
                LEFT JOIN {schema}.crm_messages m ON c.id = m.client_id
                GROUP BY c.id
                ORDER BY c.last_contact DESC
            """)
            
            clients = []
            for row in cur.fetchall():
                clients.append({
                    'id': row[0],
                    'telegram_id': row[1],
                    'telegram_username': row[2],
                    'full_name': row[3],
                    'first_contact': row[4].isoformat() if row[4] else None,
                    'last_contact': row[5].isoformat() if row[5] else None,
                    'message_count': row[6],
                    'last_message_time': row[7].isoformat() if row[7] else None,
                    'messages': row[8] or []
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'clients': clients}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Відправити відповідь клієнту в Telegram
            body = json.loads(event.get('body', '{}'))
            telegram_id = body.get('telegram_id')
            message_text = body.get('message')
            
            if not telegram_id or not message_text:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'telegram_id та message обов\'язкові'}),
                    'isBase64Encoded': False
                }
            
            bot_token = os.environ.get('TELEGRAM_NEW_BOT_TOKEN')
            
            if not bot_token:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Telegram бот не налаштований'}),
                    'isBase64Encoded': False
                }
            
            # Відправити повідомлення клієнту
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            data = urllib.parse.urlencode({
                'chat_id': telegram_id,
                'text': message_text
            }).encode()
            
            try:
                req = urllib.request.Request(url, data=data)
                response = urllib.request.urlopen(req)
                result = json.loads(response.read().decode('utf-8'))
                
                cur.close()
                conn.close()
                
                if result.get('ok'):
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'message': 'Повідомлення відправлено'}),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': result.get('description', 'Помилка Telegram API')}),
                        'isBase64Encoded': False
                    }
            except Exception as e:
                cur.close()
                conn.close()
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Помилка відправки: {str(e)}'}),
                    'isBase64Encoded': False
                }
        
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
