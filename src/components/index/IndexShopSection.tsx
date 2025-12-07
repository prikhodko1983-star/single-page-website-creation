import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
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
  is_price_from?: boolean;
  material?: string;
  size?: string;
  category_name: string;
}

export default function IndexShopSection() {
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
    <section id="shop" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
            Интернет-магазин памятников
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Закажите онлайн с доставкой. Добавляйте товары в корзину и оформляйте заказ
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 6).map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-shadow overflow-hidden">
                <Link to={`/product/${product.slug}`}>
                  <div className="aspect-square bg-secondary relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-oswald font-bold text-2xl text-primary">
                      {product.is_price_from && 'от '}{parseFloat(product.price).toLocaleString('ru-RU')} ₽
                    </span>
                    {product.old_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {parseFloat(product.old_price).toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </div>
                  <Link to={`/product/${product.slug}`}>
                    <Button className="w-full font-oswald">
                      Подробнее
                    </Button>
                  </Link>
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

        {!loading && products.length > 6 && (
          <div className="text-center mt-12">
            <Link to="/catalog">
              <Button size="lg" className="font-oswald text-lg px-8">
                <Icon name="ShoppingBag" size={20} className="mr-2" />
                Посмотреть все товары ({products.length})
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}