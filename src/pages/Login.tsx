import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/64953dd9-0671-4262-8b63-ebef8dcb5c54', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_username', data.username);
        toast({
          title: 'Вход выполнен',
          description: `Добро пожаловать, ${data.username}!`,
          duration: 2000,
        });
        navigate('/admin');
      } else {
        toast({
          title: 'Ошибка входа',
          description: 'Неверный логин или пароль',
          variant: 'destructive',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-oswald font-bold text-3xl">Гранит Мастер</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="font-oswald text-2xl">Вход в админ-панель</CardTitle>
            <CardDescription>
              Введите логин и пароль для доступа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Логин</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full font-oswald"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Вход...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" size={20} className="mr-2" />
                    Войти
                  </>
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                <Icon name="ArrowLeft" size={16} className="inline mr-1" />
                Вернуться на главную
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <Icon name="Info" size={16} className="inline mr-1" />
            Данные для входа: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
