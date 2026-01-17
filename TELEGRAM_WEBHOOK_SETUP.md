# Настройка Telegram Webhook

## URL функции
`https://functions.poehali.dev/f7736d84-f59f-426b-8140-a5825c4ef688`

## Шаг 1: Установить webhook

Открой в браузере эту ссылку (замени `YOUR_BOT_TOKEN` на токен бота `8336197688:AAEG9PjUfdwef-fwaTuV5mnb7UbDry4hm_w`):

```
https://api.telegram.org/bot8336197688:AAEG9PjUfdwef-fwaTuV5mnb7UbDry4hm_w/setWebhook?url=https://functions.poehali.dev/f7736d84-f59f-426b-8140-a5825c4ef688
```

Должен прийти ответ:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

## Шаг 2: Проверить webhook

Открой:
```
https://api.telegram.org/bot8336197688:AAEG9PjUfdwef-fwaTuV5mnb7UbDry4hm_w/getWebhookInfo
```

Должен показать:
```json
{
  "ok": true,
  "result": {
    "url": "https://functions.poehali.dev/f7736d84-f59f-426b-8140-a5825c4ef688",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

## Как работает система:

1. **Клиент пишет боту** → Сообщение сохраняется в БД → Пересылается в группу менеджеров
2. **Менеджер нажимает "Ответить" (Reply)** на сообщение в группе → Ответ отправляется клиенту

## Важно!

- Бот **ДОЛЖЕН быть администратором** в группе `-1003548321738`
- Менеджер должен использовать **Reply** (не просто написать текст)
- Username клиента должен быть в базе (сохраняется автоматически при первом сообщении)
