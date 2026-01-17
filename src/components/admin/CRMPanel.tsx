import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const CRM_API = 'https://functions.poehali.dev/fa967a7c-ac4f-4800-be1f-d9222edbcf80';

interface Message {
  id: number;
  message_text: string;
  created_at: string;
}

interface Client {
  id: number;
  telegram_id: number;
  telegram_username: string;
  full_name: string;
  first_contact: string;
  last_contact: string;
  message_count: number;
  last_message_time: string;
  messages: Message[];
}

export function CRMPanel() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await fetch(CRM_API);
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      toast({
        title: '❌ Помилка',
        description: 'Не вдалось завантажити клієнтів',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selectedClient || !replyText.trim()) return;

    setSending(true);
    try {
      const response = await fetch(CRM_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: selectedClient.telegram_id,
          message: replyText
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: '✅ Відправлено',
          description: 'Повідомлення надіслано клієнту'
        });
        setReplyText('');
        setSelectedClient(null);
      } else {
        throw new Error(data.error || 'Помилка відправки');
      }
    } catch (error) {
      toast({
        title: '❌ Помилка',
        description: error instanceof Error ? error.message : 'Не вдалось відправити',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'тільки що';
    if (minutes < 60) return `${minutes} хв тому`;
    if (hours < 24) return `${hours} год тому`;
    if (days < 7) return `${days} дн тому`;
    return date.toLocaleDateString('uk-UA');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-oswald">CRM - Клієнти з Telegram</h2>
          <p className="text-sm text-muted-foreground">Перегляд повідомлень та відповіді клієнтам</p>
        </div>
        <Button onClick={loadClients} variant="outline" disabled={loading}>
          <Icon name="RefreshCw" size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Оновити
        </Button>
      </div>

      {loading && clients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Завантаження...
          </CardContent>
        </Card>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Icon name="Users" size={48} className="mx-auto mb-4 opacity-20" />
            <p>Поки що немає звернень від клієнтів</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{client.full_name}</h3>
                      <Badge variant="secondary">
                        @{client.telegram_username}
                      </Badge>
                      <Badge>
                        {client.message_count} {client.message_count === 1 ? 'повідомлення' : 'повідомлень'}
                      </Badge>
                    </div>
                    {client.messages && client.messages.length > 0 && (
                      <div className="space-y-2 mb-3">
                        <div className="text-sm bg-secondary/30 p-3 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Icon name="MessageCircle" size={16} className="mt-0.5 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="font-medium">{client.messages[0].message_text}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(client.messages[0].created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Перший контакт: {formatDate(client.first_contact)} • 
                      Останній: {formatDate(client.last_contact)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedClient(client)}
                      size="sm"
                      variant="outline"
                    >
                      <Icon name="Eye" size={14} className="mr-2" />
                      Історія
                    </Button>
                    <Button
                      size="sm"
                      asChild
                    >
                      <a href={`https://t.me/${client.telegram_username}`} target="_blank" rel="noopener noreferrer">
                        <Icon name="MessageCircle" size={14} className="mr-2" />
                        Написать
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={selectedClient !== null} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedClient && (
            <>
              <SheetHeader>
                <SheetTitle className="font-oswald">
                  {selectedClient.full_name}
                </SheetTitle>
                <SheetDescription>
                  @{selectedClient.telegram_username} • {selectedClient.message_count} повідомлень
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon name="MessageSquare" size={18} />
                    Історія повідомлень
                  </h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto border rounded-lg p-4 bg-secondary/10">
                    {selectedClient.messages && selectedClient.messages.length > 0 ? (
                      [...selectedClient.messages].reverse().map((msg) => (
                        <div key={msg.id} className="bg-background p-3 rounded border">
                          <p className="text-sm">{msg.message_text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(msg.created_at).toLocaleString('uk-UA')}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Немає повідомлень
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    asChild
                  >
                    <a href={`https://t.me/${selectedClient.telegram_username}`} target="_blank" rel="noopener noreferrer">
                      <Icon name="MessageCircle" size={16} className="mr-2" />
                      Написать в Telegram
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedClient(null)}
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}