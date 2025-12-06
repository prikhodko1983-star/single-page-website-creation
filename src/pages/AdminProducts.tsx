import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  category_id?: number;
  category_name: string;
}

export default function AdminProducts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const { toast } = useToast();

  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    old_price: '',
    image_url: '',
    material: '',
    size: '',
    category_id: '',
    in_stock: true,
    is_featured: false,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetch('https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d?type=categories'),
        fetch('https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d'),
      ]);
      const categoriesData = await categoriesRes.json();
      const productsData = await productsRes.json();
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://functions.poehali.dev/0dcf69f8-40b3-4bcf-9d48-59e0c5584e34', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки изображения');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить изображение',
        variant: 'destructive',
      });
      return null;
    }
  };

  const generateSlug = (text: string) => {
    const translitMap: { [key: string]: string } = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
      'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    };

    return text
      .toLowerCase()
      .split('')
      .map(char => translitMap[char] || char)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const saveProductToDb = async (productData: any) => {
    toast({
      title: 'Информация',
      description: 'Функция добавления товаров находится в разработке. Товары создаются через SQL.',
    });
  };

  const saveCategoryToDb = async (categoryData: any) => {
    toast({
      title: 'Информация',
      description: 'Функция добавления категорий находится в разработке. Категории создаются через SQL.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-oswald font-bold text-2xl">Гранит Мастер - Админ</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium">Главная</Link>
            <Link to="/catalog" className="text-sm font-medium">Каталог</Link>
            <Link to="/admin" className="text-sm font-medium">Админ</Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="font-oswald font-bold text-4xl mb-8">Управление товарами</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
              <Icon name="Package" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Категорий</CardTitle>
              <Icon name="FolderOpen" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">В наличии</CardTitle>
              <Icon name="CheckCircle" className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter(p => p.in_stock).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-oswald">
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить товар
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Добавить новый товар</DialogTitle>
                <DialogDescription>
                  Заполните информацию о товаре. SQL запрос будет показан в консоли.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => {
                      setProductForm({ ...productForm, name: e.target.value });
                      if (!productForm.slug) {
                        setProductForm({ ...productForm, name: e.target.value, slug: generateSlug(e.target.value) });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL (slug)</Label>
                  <Input
                    id="slug"
                    value={productForm.slug}
                    onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Цена</Label>
                    <Input
                      id="price"
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="old_price">Старая цена</Label>
                    <Input
                      id="old_price"
                      type="number"
                      value={productForm.old_price}
                      onChange={(e) => setProductForm({ ...productForm, old_price: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    value={productForm.category_id}
                    onValueChange={(value) => setProductForm({ ...productForm, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="material">Материал</Label>
                    <Input
                      id="material"
                      value={productForm.material}
                      onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="size">Размер</Label>
                    <Input
                      id="size"
                      value={productForm.size}
                      onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="image">Изображение</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleImageUpload(file);
                        if (url) {
                          setProductForm({ ...productForm, image_url: url });
                        }
                      }
                    }}
                  />
                  {productForm.image_url && (
                    <img src={productForm.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                </div>
                <Button onClick={() => saveProductToDb(productForm)} className="w-full">
                  Сохранить товар
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="font-oswald">
                <Icon name="FolderPlus" size={20} className="mr-2" />
                Добавить категорию
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить категорию</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cat_name">Название</Label>
                  <Input
                    id="cat_name"
                    value={categoryForm.name}
                    onChange={(e) => {
                      setCategoryForm({ ...categoryForm, name: e.target.value });
                      if (!categoryForm.slug) {
                        setCategoryForm({ ...categoryForm, name: e.target.value, slug: generateSlug(e.target.value) });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="cat_slug">URL (slug)</Label>
                  <Input
                    id="cat_slug"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cat_desc">Описание</Label>
                  <Textarea
                    id="cat_desc"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  />
                </div>
                <Button onClick={() => saveCategoryToDb(categoryForm)} className="w-full">
                  Сохранить категорию
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={loadData}>
            <Icon name="RefreshCw" size={20} className="mr-2" />
            Обновить
          </Button>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Список товаров</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-20 h-20 bg-secondary rounded flex-shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="Image" size={32} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={product.in_stock ? 'default' : 'destructive'}>
                          {product.in_stock ? 'В наличии' : 'Нет в наличии'}
                        </Badge>
                        {product.is_featured && (
                          <Badge>Хит продаж</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{parseFloat(product.price).toLocaleString('ru-RU')} ₽</div>
                      {product.old_price && (
                        <div className="text-sm text-muted-foreground line-through">
                          {parseFloat(product.old_price).toLocaleString('ru-RU')} ₽
                        </div>
                      )}
                    </div>
                    <Link to={`/product/${product.slug}`}>
                      <Button variant="ghost" size="icon">
                        <Icon name="ExternalLink" size={20} />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
