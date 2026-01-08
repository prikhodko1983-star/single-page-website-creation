import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function CartSheet() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { toast } = useToast();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitOrder = async () => {
    if (!name.trim() || !phone.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните имя и телефон',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/ea9959d5-aa7f-4172-aebd-486fef3e3ae4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total_price: getTotalPrice()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: 'Заказ отправлен!',
          description: 'Мы свяжемся с вами в ближайшее время'
        });
        clearCart();
        setName('');
        setPhone('');
        setShowOrderForm(false);
      } else {
        throw new Error(result.error || 'Ошибка отправки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить заказ',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Icon name="Heart" size={20} />
          {getTotalItems() > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {getTotalItems()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-oswald">Избранное</SheetTitle>
          <SheetDescription>
            {items.length === 0 ? 'Избранное пусто' : `Памятников в избранном: ${getTotalItems()}`}
          </SheetDescription>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Icon name="Heart" size={64} className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Избранное пусто</p>
            <Link to="/catalog">
              <Button>Перейти в каталог</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border rounded-lg p-3">
                  <div className="w-20 h-20 bg-secondary rounded flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="Image" size={32} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.slug}`}>
                      <h3 className="font-semibold text-sm mb-1 hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-primary font-bold mb-2">
                      {parseFloat(item.price).toLocaleString('ru-RU')} ₽
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Icon name="Minus" size={14} />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Icon name="Plus" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-4 flex-shrink-0 bg-background">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="font-oswald">Итого:</span>
                <span className="text-primary">
                  {getTotalPrice().toLocaleString('ru-RU')} ₽
                </span>
              </div>
              
              {!showOrderForm ? (
                <>
                  <Button
                    className="w-full font-oswald"
                    size="lg"
                    onClick={() => setShowOrderForm(true)}
                  >
                    Оформить заказ
                  </Button>
                  <Link to="/catalog">
                    <Button variant="outline" className="w-full" size="lg">
                      Продолжить покупки
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="order-name">Ваше имя</Label>
                    <Input
                      id="order-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Иван Иванов"
                    />
                  </div>
                  <div>
                    <Label htmlFor="order-phone">Телефон</Label>
                    <Input
                      id="order-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  <div className="flex gap-2 pb-2">
                    <Button
                      className="flex-1 font-oswald"
                      onClick={handleSubmitOrder}
                      disabled={loading}
                    >
                      {loading ? 'Отправка...' : 'Отправить заказ'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowOrderForm(false)}
                      disabled={loading}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}