import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { CartSheet } from '@/components/CartSheet';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  old_price?: string;
  image_url?: string;
  in_stock: boolean;
  is_featured: boolean;
  material?: string;
  size?: string;
  category_name: string;
}

export default function Catalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d?type=categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      let url = 'https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d';
      if (selectedCategory) {
        url += `?category_slug=${selectedCategory}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-oswald font-bold text-2xl">Гранит Мастер</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium">Главная</Link>
            <Link to="/catalog" className="text-sm font-medium text-primary">Каталог</Link>
            <Link to="/admin" className="text-sm font-medium">Админ</Link>
            <CartSheet />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <h1 className="font-oswald font-bold text-4xl md:text-6xl text-center mb-4">
            Каталог памятников
          </h1>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto">
            Широкий выбор памятников из гранита и мрамора. Качественная работа, доступные цены
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
              className="font-oswald"
            >
              Все категории
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.slug)}
                className="font-oswald"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-xl transition-shadow overflow-hidden">
                  <Link to={`/product/${product.slug}`}>
                    <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="Image" size={64} className="text-muted-foreground" />
                        </div>
                      )}
                      {product.is_featured && (
                        <Badge className="absolute top-3 right-3 bg-primary">
                          Хит продаж
                        </Badge>
                      )}
                      {!product.in_stock && (
                        <Badge className="absolute top-3 left-3 bg-destructive">
                          Нет в наличии
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        {product.category_name}
                      </Badge>
                    </div>
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="font-oswald font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                      {product.material && (
                        <div className="flex items-center gap-1">
                          <Icon name="Box" size={16} />
                          <span>{product.material}</span>
                        </div>
                      )}
                      {product.size && (
                        <div className="flex items-center gap-1">
                          <Icon name="Ruler" size={16} />
                          <span>{product.size}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-oswald font-bold text-2xl text-primary">
                        {parseFloat(product.price).toLocaleString('ru-RU')} ₽
                      </span>
                      {product.old_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {parseFloat(product.old_price).toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="font-oswald"
                        onClick={() => {
                          addToCart({
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            price: product.price,
                            image_url: product.image_url,
                          });
                          toast({
                            title: 'Добавлено в корзину',
                            description: product.name,
                          });
                        }}
                        disabled={!product.in_stock}
                      >
                        <Icon name="ShoppingCart" size={16} className="mr-1" />
                        В корзину
                      </Button>
                      <Link to={`/product/${product.slug}`}>
                        <Button className="w-full font-oswald">
                          Подробнее
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-20">
              <Icon name="PackageSearch" size={64} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="font-oswald font-bold text-2xl mb-2">Товары не найдены</h3>
              <p className="text-muted-foreground">
                Попробуйте выбрать другую категорию
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Гранит Мастер. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}