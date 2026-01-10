import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface TelegramQuickMessageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TelegramQuickMessage({ open, onOpenChange }: TelegramQuickMessageProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!phone.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Укажите ваш телефон',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/9b801ab4-aedb-4a08-beb4-326ff93721f2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          source: 'Сайт (кнопка Telegram)'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: 'Сообщение отправлено!',
          description: 'Мы свяжемся с вами в ближайшее время'
        });
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        onOpenChange(false);
      } else {
        throw new Error(result.error || 'Ошибка отправки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить сообщение',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-oswald">Написать нам</DialogTitle>
          <DialogDescription>
            Оставьте ваши контакты и мы свяжемся с вами
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="quick-name">Ваше имя (необязательно)</Label>
            <Input
              id="quick-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
            />
          </div>
          <div>
            <Label htmlFor="quick-email">E-mail (необязательно)</Label>
            <Input
              id="quick-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <Label htmlFor="quick-phone">Телефон *</Label>
            <Input
              id="quick-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
            />
          </div>
          <div>
            <Label htmlFor="quick-message">Сообщение (необязательно)</Label>
            <Textarea
              id="quick-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ваш вопрос или комментарий..."
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 font-oswald"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Отправить'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}