import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const VERIFY_URL = 'https://functions.poehali.dev/8ac57caf-53fd-4068-b6ca-7c89b2e92e0c';
const ORDERS_URL = 'https://functions.poehali.dev/b5924719-d843-42a9-a1ad-1fbea82a8035';

interface Order {
  id: number;
  client_name: string;
  client_phone: string;
  client_email: string;
  product_name: string;
  amount: number;
  comment: string;
  status: string;
  status_label: string;
  created_by: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Manager() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    product_name: '',
    amount: '',
    comment: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { navigate('/login'); return; }

    fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    })
      .then(r => r.json())
      .then(data => {
        if (!data.valid) { navigate('/login'); return; }
        setUsername(data.username);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    const token = localStorage.getItem('auth_token') || '';
    try {
      const res = await fetch(ORDERS_URL, {
        headers: { 'X-Auth-Token': token },
      });
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'orders') loadOrders();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('auth_token') || '';
    try {
      const res = await fetch(ORDERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) || 0 }),
      });
      if (res.ok) {
        toast({ title: 'Заказ создан', description: `Клиент: ${form.client_name}`, duration: 3000 });
        setForm({ client_name: '', client_phone: '', client_email: '', product_name: '', amount: '', comment: '' });
      } else {
        const err = await res.json();
        toast({ title: 'Ошибка', description: err.error || 'Не удалось создать заказ', variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const token = localStorage.getItem('auth_token') || '';
    const res = await fetch(ORDERS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify({ id: orderId, status: newStatus }),
    });
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === orderId
        ? { ...o, status: newStatus, status_label: { new: 'Новый', in_progress: 'В работе', done: 'Выполнен', cancelled: 'Отменён' }[newStatus] || newStatus }
        : o
      ));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_username');
    navigate('/login');
  };

  const formatAmount = (amount: number) =>
    amount > 0 ? `${amount.toLocaleString('ru-RU')} ₽` : '—';

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Шапка */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Briefcase" size={20} />
            <span className="font-semibold text-lg">Панель менеджера</span>
            {username && <span className="text-muted-foreground text-sm">— {username}</span>}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Tabs defaultValue="new-order" onValueChange={handleTabChange}>
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <TabsList>
              <TabsTrigger value="new-order">
                <Icon name="Plus" size={16} className="mr-2" />
                Оформить заказ
              </TabsTrigger>
              <TabsTrigger value="orders">
                <Icon name="ClipboardList" size={16} className="mr-2" />
                История заказов
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={() => navigate('/constructor')}>
              <Icon name="Wrench" size={16} className="mr-2" />
              Открыть конструктор
            </Button>
          </div>

          {/* Вкладка: Новый заказ */}
          <TabsContent value="new-order">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Новый заказ</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client_name">Имя клиента *</Label>
                      <Input
                        id="client_name"
                        placeholder="Иванов Иван"
                        value={form.client_name}
                        onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client_phone">Телефон</Label>
                      <Input
                        id="client_phone"
                        placeholder="+7 900 000 00 00"
                        value={form.client_phone}
                        onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client_email">Email</Label>
                      <Input
                        id="client_email"
                        type="email"
                        placeholder="client@example.com"
                        value={form.client_email}
                        onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Сумма, ₽</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={form.amount}
                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_name">Товар / Услуга *</Label>
                    <Input
                      id="product_name"
                      placeholder="Памятник из гранита, размер 80x40"
                      value={form.product_name}
                      onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Комментарий</Label>
                    <Textarea
                      id="comment"
                      placeholder="Дополнительные пожелания, детали заказа..."
                      value={form.comment}
                      onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? (
                      <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Сохраняю...</>
                    ) : (
                      <><Icon name="Check" size={16} className="mr-2" />Создать заказ</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка: История заказов */}
          <TabsContent value="orders">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Все заказы ({orders.length})</h2>
              <Button variant="outline" size="sm" onClick={loadOrders} disabled={loadingOrders}>
                <Icon name={loadingOrders ? 'Loader2' : 'RefreshCw'} size={16} className={`mr-2 ${loadingOrders ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
            </div>

            {loadingOrders && orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Загружаю заказы...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="ClipboardList" size={48} className="mx-auto mb-3 opacity-30" />
                <p>Заказов пока нет</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold">{order.client_name}</span>
                            <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}>
                              {order.status_label}
                            </Badge>
                            <span className="text-muted-foreground text-xs">#{order.id}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{order.product_name}</p>
                          <div className="flex flex-wrap gap-3 text-sm">
                            {order.client_phone && (
                              <span className="flex items-center gap-1">
                                <Icon name="Phone" size={13} />
                                {order.client_phone}
                              </span>
                            )}
                            {order.amount > 0 && (
                              <span className="flex items-center gap-1 font-medium text-primary">
                                <Icon name="Banknote" size={13} />
                                {formatAmount(order.amount)}
                              </span>
                            )}
                            {order.created_by && (
                              <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <Icon name="User" size={12} />
                                {order.created_by}
                              </span>
                            )}
                          </div>
                          {order.comment && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{order.comment}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="shrink-0">
                          <Select value={order.status} onValueChange={val => handleStatusChange(order.id, val)}>
                            <SelectTrigger className="w-36 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Новый</SelectItem>
                              <SelectItem value="in_progress">В работе</SelectItem>
                              <SelectItem value="done">Выполнен</SelectItem>
                              <SelectItem value="cancelled">Отменён</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}