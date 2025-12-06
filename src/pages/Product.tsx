import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { CartSheet } from '@/components/CartSheet';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  old_price?: string;
  image_url?: string;
  gallery_urls?: string[];
  in_stock: boolean;
  is_featured: boolean;
  is_price_from?: boolean;
  material?: string;
  size?: string;
  weight?: string;
  color?: string;
  category_name: string;
  category_slug: string;
}

export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d?slug=${slug}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        navigate('/catalog');
      }
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
      navigate('/catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.gallery_urls && product.gallery_urls.length > 0 
    ? product.gallery_urls 
    : product.image_url 
    ? [product.image_url] 
    : [];

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
            <Link to="/catalog" className="text-sm font-medium">Каталог</Link>
            <Link to="/admin" className="text-sm font-medium">Админ</Link>
            <CartSheet />
          </nav>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Главная</Link>
          <Icon name="ChevronRight" size={16} />
          <Link to="/catalog" className="hover:text-foreground">Каталог</Link>
          <Icon name="ChevronRight" size={16} />
          <Link to={`/catalog?category=${product.category_slug}`} className="hover:text-foreground">
            {product.category_name}
          </Link>
          <Icon name="ChevronRight" size={16} />
          <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      {/* Product Details */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Gallery */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-secondary relative">
                    {images.length > 0 ? (
                      <img
                        src={images[selectedImage]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="Image" size={96} className="text-muted-foreground" />
                      </div>
                    )}
                    {product.is_featured && (
                      <Badge className="absolute top-4 right-4 bg-primary text-lg px-4 py-2">
                        Хит продаж
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`${product.name} - ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-3">
                  {product.category_name}
                </Badge>
                <h1 className="font-oswald font-bold text-4xl mb-4">
                  {product.name}
                </h1>
                {!product.in_stock && (
                  <Badge className="bg-destructive mb-4">
                    Нет в наличии
                  </Badge>
                )}
              </div>

              <div className="flex items-baseline gap-3">
                <span className="font-oswald font-bold text-5xl text-primary">
                  {product.is_price_from && 'от '}{parseFloat(product.price).toLocaleString('ru-RU')} ₽
                </span>
                {product.old_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {parseFloat(product.old_price).toLocaleString('ru-RU')} ₽
                  </span>
                )}
              </div>

              <div className="prose prose-slate max-w-none">
                <p className="text-muted-foreground text-lg">{product.description}</p>
              </div>

              {/* Characteristics */}
              <Card className="bg-secondary">
                <CardContent className="p-6">
                  <h3 className="font-oswald font-bold text-xl mb-4">Характеристики</h3>
                  <div className="space-y-3">
                    {product.material && (
                      <div className="flex justify-between items-center border-b border-border pb-2">
                        <span className="text-muted-foreground">Материал:</span>
                        <span className="font-medium">{product.material}</span>
                      </div>
                    )}
                    {product.size && (
                      <div className="flex justify-between items-center border-b border-border pb-2">
                        <span className="text-muted-foreground">Размер:</span>
                        <span className="font-medium">{product.size}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between items-center border-b border-border pb-2">
                        <span className="text-muted-foreground">Вес:</span>
                        <span className="font-medium">{product.weight}</span>
                      </div>
                    )}
                    {product.color && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Цвет:</span>
                        <span className="font-medium">{product.color}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full font-oswald text-lg h-14"
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
                  <Icon name="ShoppingCart" size={20} className="mr-2" />
                  {product.in_stock ? 'Добавить в корзину' : 'Товар недоступен'}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full font-oswald text-lg h-14"
                  onClick={handleOrderClick}
                >
                  <Icon name="Phone" size={20} className="mr-2" />
                  Получить консультацию
                </Button>
              </div>

              <div className="bg-secondary p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Бесплатная консультация дизайнера</span>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Гарантия качества 10 лет</span>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Доставка и установка</span>
                </div>
              </div>
            </div>
          </div>
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