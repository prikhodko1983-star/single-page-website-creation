import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { CartSheet } from '@/components/CartSheet';
import SearchBar from '@/components/SearchBar';
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

  useEffect(() => {
    const title = 'Каталог памятников из гранита — Цены и фото | Гранит Мастер';
    const description = 'Широкий выбор гранитных памятников. Вертикальные, горизонтальные, эксклюзивные. Цены от 15 000₽. Собственное производство в Великом Новгороде.';
    const imageUrl = 'https://cdn.poehali.dev/files/7c3f7bb6-620d-4495-bf82-0abd8136ff4b.png';
    
    document.title = title;
    
    const metaTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: imageUrl },
      { property: 'og:url', content: 'https://мастер-гранит.рф/catalog' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
      { name: 'description', content: description }
    ];

    metaTags.forEach(({ property, name, content }) => {
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (property) meta.setAttribute('property', property);
        if (name) meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // Добавляем JSON-LD микроразметку для каталога
    let scriptTag = document.querySelector('script[data-catalog-schema]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('data-catalog-schema', 'true');
      document.head.appendChild(scriptTag);
    }

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Главная",
          "item": "https://мастер-гранит.рф/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Каталог",
          "item": "https://мастер-гранит.рф/catalog"
        }
      ]
    };

    scriptTag.textContent = JSON.stringify(breadcrumbSchema);

    // Добавляем микроразметку для страницы каталога
    let catalogScriptTag = document.querySelector('script[data-catalog-page-schema]');
    if (!catalogScriptTag) {
      catalogScriptTag = document.createElement('script');
      catalogScriptTag.setAttribute('type', 'application/ld+json');
      catalogScriptTag.setAttribute('data-catalog-page-schema', 'true');
      document.head.appendChild(catalogScriptTag);
    }

    const catalogPageSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": description,
      "url": "https://мастер-гранит.рф/catalog",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Гранит Мастер",
        "url": "https://мастер-гранит.рф"
      }
    };

    catalogScriptTag.textContent = JSON.stringify(catalogPageSchema);
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d?type=categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const url = selectedCategory
        ? `https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d?category_slug=${selectedCategory}`
        : 'https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
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
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium hidden sm:block">Главная</Link>
            <Link to="/catalog" className="text-sm font-medium text-primary hidden sm:block">Каталог</Link>
            <SearchBar />
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
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
                          Хит
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
                    <div className="flex gap-2">
                      <Link to={`/product/${product.slug}`} className="flex-1">
                        <Button className="w-full font-oswald">
                          Подробнее
                        </Button>
                      </Link>
                      {product.image_url && (
                        <Link to={`/constructor?monument=${encodeURIComponent(product.image_url)}`}>
                          <Button variant="outline" size="icon" title="Редактировать в конструкторе">
                            <Icon name="Pencil" size={18} />
                          </Button>
                        </Link>
                      )}
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
          <div className="mt-3">
            <Link 
              to="/legal" 
              className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
            >
              <Icon name="FileText" size={14} />
              Правовая информация и условия оказания услуг
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}