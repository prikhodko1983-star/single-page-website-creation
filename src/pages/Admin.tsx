import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import * as XLSX from 'xlsx';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Monument {
  id?: number;
  title: string;
  image_url: string;
  price: string;
  size: string;
  category?: string;
  description?: string;
}

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
  sku?: string;
  polish?: string;
  category_id?: number;
  category_name: string;
}

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  desc: string;
}

const SortableGalleryItem = ({ item, index, onEdit, onDelete }: {
  item: GalleryItem;
  index: number;
  onEdit: (idx: number) => void;
  onDelete: (idx: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div 
              {...attributes} 
              {...listeners}
              className="cursor-grab active:cursor-grabbing flex items-center justify-center w-10 flex-shrink-0"
            >
              <Icon name="GripVertical" size={20} className="text-muted-foreground" />
            </div>
            <div className="w-24 h-24 bg-secondary rounded overflow-hidden flex-shrink-0">
              {item.type === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                  {item.type === 'video' ? '🎥 Видео' : '📷 Фото'}
                </span>
              </div>
              <h4 className="font-semibold mb-1 truncate">{item.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.desc}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => onEdit(index)}>
                  <Icon name="Edit" size={14} className="mr-1" />
                  Изменить
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(index)}>
                  <Icon name="Trash2" size={14} className="mr-1" />
                  Удалить
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([
    { id: '1', type: 'image', url: 'https://cdn.poehali.dev/files/bbcac88c-6deb-429e-b227-40488c7c5273.jpg', title: 'Комплексное благоустройство', desc: 'Установка памятников и уход за территорией' },
    { id: '2', type: 'image', url: 'https://cdn.poehali.dev/files/58ba923f-a428-4ebd-a17d-2cd8e5b523a8.jpg', title: 'Художественная гравировка', desc: 'Индивидуальный дизайн и качественное исполнение' },
    { id: '3', type: 'image', url: 'https://cdn.poehali.dev/files/c80c1bd4-c413-425a-a1fc-91dbb36a8de4.jpg', title: 'Горизонтальные памятники', desc: 'Классический дизайн из чёрного гранита' },
    { id: '4', type: 'image', url: 'https://cdn.poehali.dev/files/6f5b52e2-08d6-473f-838f-e3ffd77bc1cf.jpg', title: 'Вертикальные стелы', desc: 'С профессиональной гравировкой портрета' },
    { id: '5', type: 'image', url: 'https://cdn.poehali.dev/files/a92e8f49-5be4-4b4b-939f-e97e69b14d55.jpg', title: 'Мемориальные комплексы', desc: 'С благоустройством и цветником' },
    { id: '6', type: 'image', url: 'https://cdn.poehali.dev/files/e4f88cd9-b74c-4b96-bf11-ab78a26bc19a.jpg', title: 'Элитные памятники', desc: 'Эксклюзивный дизайн по индивидуальному проекту' }
  ]);

  const [editingMonument, setEditingMonument] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("Все");

  const [monumentForm, setMonumentForm] = useState<Monument>({
    title: "",
    image_url: "",
    price: "",
    size: "",
    category: "Вертикальные",
    description: ""
  });

  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    old_price: '',
    image_url: '',
    material: '',
    size: '',
    sku: '',
    polish: '',
    category_id: '',
    in_stock: true,
    is_featured: false,
    is_price_from: false,
  });

  const [galleryForm, setGalleryForm] = useState<Omit<GalleryItem, 'id'>>({
    type: 'image',
    url: '',
    title: '',
    desc: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingGalleryId, setEditingGalleryId] = useState<number | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState(0);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [productsViewMode, setProductsViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [customSize, setCustomSize] = useState<string>('');

  const categories_list = ["Вертикальные", "Горизонтальные", "Эксклюзивные", "С крестом"];
  const filterCategories = ["Все", ...categories_list];

  const API_URL = "https://functions.poehali.dev/92a4ea52-a3a0-4502-9181-ceeb714f2ad6";
  const UPLOAD_URL = "https://functions.poehali.dev/96dcc1e1-90f9-4b11-b0c7-2d66559ddcbb";
  const PRODUCTS_API = "https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d";

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchMonuments();
    loadProducts();
    loadCategories();
    
    const savedGallery = localStorage.getItem('galleryItems');
    if (savedGallery) {
      try {
        setGalleryItems(JSON.parse(savedGallery));
      } catch (e) {
        console.error('Error loading gallery items:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
  }, [galleryItems]);

  const fetchMonuments = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        setMonuments(data);
      }
    } catch (error) {
      console.error("Error fetching monuments:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(PRODUCTS_API);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${PRODUCTS_API}?type=categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleMonumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!monumentForm.title.trim() || !monumentForm.image_url.trim() || !monumentForm.price.trim() || !monumentForm.size.trim()) {
      toast({
        title: '❌ Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    try {
      let response;
      if (editingMonument) {
        response = await fetch(`${API_URL}?id=${editingMonument}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(monumentForm)
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(monumentForm)
        });
      }

      if (response.ok) {
        toast({
          title: '✅ Успешно',
          description: editingMonument ? 'Памятник обновлён' : 'Памятник добавлен'
        });
        fetchMonuments();
        setMonumentForm({ title: "", image_url: "", price: "", size: "", category: "Вертикальные", description: "" });
        setEditingMonument(null);
      }
    } catch (error) {
      console.error("Error saving monument:", error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось сохранить памятник',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (monument: Monument) => {
    setMonumentForm(monument);
    setEditingMonument(monument.id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот памятник?')) return;

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast({
          title: '✅ Успешно',
          description: 'Памятник удалён'
        });
        fetchMonuments();
      }
    } catch (error) {
      console.error("Error deleting monument:", error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось удалить памятник',
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'monument' | 'gallery' | 'product') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'monument') setUploading(true);
    if (target === 'gallery') setUploadingGallery(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64String = reader.result as string;
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        
        const response = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64String,
            extension: extension
          }),
        });

        const data = await response.json();

        if (data.url) {
          if (target === 'monument') {
            setMonumentForm({ ...monumentForm, image_url: data.url });
          } else if (target === 'gallery') {
            setGalleryForm({ ...galleryForm, url: data.url });
          } else if (target === 'product') {
            setProductForm({ ...productForm, image_url: data.url });
          }
          
          toast({
            title: '✅ Успешно',
            description: 'Изображение загружено'
          });
        }
        
        if (target === 'monument') setUploading(false);
        if (target === 'gallery') setUploadingGallery(false);
      };
      
      reader.onerror = () => {
        toast({
          title: '❌ Ошибка',
          description: 'Не удалось прочитать файл',
          variant: 'destructive'
        });
        if (target === 'monument') setUploading(false);
        if (target === 'gallery') setUploadingGallery(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось загрузить изображение',
        variant: 'destructive'
      });
      if (target === 'monument') setUploading(false);
      if (target === 'gallery') setUploadingGallery(false);
    }
  };

  const handleGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!galleryForm.url || !galleryForm.title) {
      toast({
        title: '❌ Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    if (editingGalleryId !== null) {
      setGalleryItems(galleryItems.map((item, idx) =>
        idx === editingGalleryId ? { ...galleryForm, id: item.id } : item
      ));
      toast({
        title: '✅ Успешно',
        description: 'Элемент галереи обновлён'
      });
    } else {
      setGalleryItems([...galleryItems, { ...galleryForm, id: Date.now().toString() }]);
      toast({
        title: '✅ Успешно',
        description: 'Элемент добавлен в галерею'
      });
    }

    setGalleryForm({ type: 'image', url: '', title: '', desc: '' });
    setEditingGalleryId(null);
  };

  const handleGalleryEdit = (index: number) => {
    const item = galleryItems[index];
    setGalleryForm(item);
    setEditingGalleryId(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGalleryDelete = (index: number) => {
    if (!confirm('Удалить этот элемент из галереи?')) return;
    setGalleryItems(galleryItems.filter((_, idx) => idx !== index));
    toast({
      title: '✅ Успешно',
      description: 'Элемент удалён из галереи'
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setGalleryItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
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

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;
      const updatedCount = 0;
      const createdCount = 0;

      for (const row of jsonData as any[]) {
        try {
          const productData = {
            name: row['Название'] || row['name'] || '',
            slug: generateSlug(row['Название'] || row['name'] || ''),
            description: row['Описание'] || row['description'] || '',
            price: String(row['Цена'] || row['price'] || 0),
            old_price: row['Старая цена'] || row['old_price'] || '',
            image_url: row['URL изображения'] || row['image_url'] || '',
            material: row['Материал'] || row['material'] || '',
            size: row['Размер'] || row['size'] || '',
            sku: row['Артикул'] || row['sku'] || '',
            polish: row['Полировка'] || row['polish'] || '',
            category_id: row['ID категории'] || row['category_id'] || '',
            in_stock: row['В наличии'] !== undefined ? Boolean(row['В наличии']) : true,
            is_featured: row['Хит продаж'] !== undefined ? Boolean(row['Хит продаж']) : false,
            is_price_from: row['Цена от'] !== undefined ? Boolean(row['Цена от']) : false,
          };

          if (!productData.name || !productData.price) {
            errorCount++;
            continue;
          }

          const existingProduct = products.find(p => 
            p.sku && productData.sku && p.sku === productData.sku
          );

          const url = existingProduct 
            ? `${PRODUCTS_API}?id=${existingProduct.id}`
            : PRODUCTS_API;
          
          const method = existingProduct ? 'PUT' : 'POST';

          const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
          });

          if (response.ok) {
            successCount++;
            if (existingProduct) {
              updatedCount++;
            } else {
              createdCount++;
            }
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      toast({
        title: '✅ Импорт завершён',
        description: `Создано: ${createdCount}, Обновлено: ${updatedCount}, Ошибок: ${errorCount}`
      });

      loadProducts();
      e.target.value = '';
    } catch (error) {
      console.error('Excel import error:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось обработать файл Excel',
        variant: 'destructive'
      });
    }
  };

  const filteredMonuments = filterCategory === "Все" 
    ? monuments 
    : monuments.filter(m => m.category === filterCategory);

  const stats = {
    monuments: monuments.length,
    products: products.length,
    categories: categories.length,
    gallery: galleryItems.length,
    inStock: products.filter(p => p.in_stock).length
  };

  return (
    <div className="bg-background pb-20">
      <div className="w-full border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-oswald font-bold text-2xl">Панель администратора</h1>
              <p className="text-sm text-muted-foreground">Управление сайтом</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Icon name="Home" size={16} className="mr-2" />
              На сайт
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 sticky top-[73px] z-30 bg-background">
            <TabsTrigger value="overview" className="font-oswald">
              <Icon name="LayoutDashboard" size={16} className="mr-2" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="catalog" className="font-oswald">
              <Icon name="Image" size={16} className="mr-2" />
              Каталог примеров
            </TabsTrigger>
            <TabsTrigger value="shop" className="font-oswald">
              <Icon name="ShoppingBag" size={16} className="mr-2" />
              Магазин
            </TabsTrigger>
            <TabsTrigger value="gallery" className="font-oswald">
              <Icon name="Images" size={16} className="mr-2" />
              Галерея работ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Примеры памятников</CardTitle>
                  <Icon name="Image" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.monuments}</div>
                  <p className="text-xs text-muted-foreground">В каталоге примеров</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Товары в магазине</CardTitle>
                  <Icon name="ShoppingBag" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.products}</div>
                  <p className="text-xs text-muted-foreground">{stats.inStock} в наличии</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Категории</CardTitle>
                  <Icon name="FolderOpen" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.categories}</div>
                  <p className="text-xs text-muted-foreground">Для магазина</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Галерея</CardTitle>
                  <Icon name="Images" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.gallery}</div>
                  <p className="text-xs text-muted-foreground">Наши работы</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-oswald">Быстрый доступ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 justify-start" onClick={() => setActiveTab('catalog')}>
                    <div className="flex items-center gap-4">
                      <Icon name="Image" size={24} className="text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">Каталог примеров</div>
                        <div className="text-sm text-muted-foreground">Памятники для вдохновения</div>
                      </div>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-20 justify-start" onClick={() => setActiveTab('shop')}>
                    <div className="flex items-center gap-4">
                      <Icon name="ShoppingBag" size={24} className="text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">Интернет-магазин</div>
                        <div className="text-sm text-muted-foreground">Товары и категории</div>
                      </div>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-20 justify-start" onClick={() => setActiveTab('gallery')}>
                    <div className="flex items-center gap-4">
                      <Icon name="Images" size={24} className="text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">Галерея работ</div>
                        <div className="text-sm text-muted-foreground">Портфолио компании</div>
                      </div>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-20 justify-start" onClick={() => navigate('/')}>
                    <div className="flex items-center gap-4">
                      <Icon name="Eye" size={24} className="text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">Посмотреть сайт</div>
                        <div className="text-sm text-muted-foreground">Открыть главную страницу</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-oswald">
                  {editingMonument ? 'Редактировать памятник' : 'Добавить памятник в каталог примеров'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMonumentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Название *</Label>
                      <Input
                        id="title"
                        value={monumentForm.title}
                        onChange={(e) => setMonumentForm({ ...monumentForm, title: e.target.value })}
                        placeholder="Например: Вертикальный памятник №1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Категория</Label>
                      <Select
                        value={monumentForm.category}
                        onValueChange={(value) => setMonumentForm({ ...monumentForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories_list.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="price">Цена *</Label>
                      <Input
                        id="price"
                        value={monumentForm.price}
                        onChange={(e) => setMonumentForm({ ...monumentForm, price: e.target.value })}
                        placeholder="от 25 000 ₽"
                      />
                    </div>

                    <div>
                      <Label htmlFor="size">Размер *</Label>
                      <Input
                        id="size"
                        value={monumentForm.size}
                        onChange={(e) => setMonumentForm({ ...monumentForm, size: e.target.value })}
                        placeholder="120x60x8 см"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={monumentForm.description || ''}
                      onChange={(e) => setMonumentForm({ ...monumentForm, description: e.target.value })}
                      placeholder="Дополнительная информация о памятнике"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Изображение *</Label>
                    <div className="flex gap-4 items-start">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'monument')}
                        disabled={uploading}
                      />
                      {monumentForm.image_url && (
                        <img src={monumentForm.image_url} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                      )}
                    </div>
                    {uploading && <Progress value={uploadProgress} className="mt-2" />}
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={uploading}>
                      <Icon name={editingMonument ? "Save" : "Plus"} size={16} className="mr-2" />
                      {editingMonument ? 'Сохранить изменения' : 'Добавить памятник'}
                    </Button>
                    {editingMonument && (
                      <Button type="button" variant="outline" onClick={() => {
                        setEditingMonument(null);
                        setMonumentForm({ title: "", image_url: "", price: "", size: "", category: "Вертикальные", description: "" });
                      }}>
                        Отменить
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-oswald">Памятники в каталоге ({filteredMonuments.length})</CardTitle>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMonuments.map((monument) => (
                    <Card key={monument.id} className="overflow-hidden">
                      <div className="aspect-[3/4] bg-secondary relative">
                        <img src={monument.image_url} alt={monument.title} className="w-full h-full object-contain" />
                        {monument.category && (
                          <Badge className="absolute top-2 right-2">{monument.category}</Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-oswald font-semibold text-lg mb-1">{monument.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{monument.size}</p>
                        <p className="font-oswald text-xl text-primary mb-3">{monument.price}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(monument)} className="flex-1">
                            <Icon name="Edit" size={14} className="mr-1" />
                            Изменить
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => monument.id && handleDelete(monument.id)}>
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shop" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="text-2xl font-bold">{products.filter(p => p.in_stock).length}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-oswald">Управление магазином</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Товары и категории</p>
                    <div className="flex flex-wrap gap-2">
                  <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => {
                    setIsCategoryDialogOpen(open);
                    if (!open) {
                      setEditingCategory(null);
                      setCategoryForm({
                        name: '',
                        slug: '',
                        description: '',
                      });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="font-oswald">
                        <Icon name="FolderPlus" size={20} className="mr-2" />
                        Категории
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <DialogHeader className="flex-shrink-0">
                        <DialogTitle>{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</DialogTitle>
                        <DialogDescription>
                          Создайте новую категорию для товаров
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 overflow-y-auto flex-1 pr-2 -mr-2">
                        <div>
                          <Label htmlFor="category-name">Название категории</Label>
                          <Input
                            id="category-name"
                            value={categoryForm.name}
                            onChange={(e) => {
                              setCategoryForm({ ...categoryForm, name: e.target.value, slug: generateSlug(e.target.value) });
                            }}
                            placeholder="Вертикальные памятники"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category-slug">URL (slug)</Label>
                          <Input
                            id="category-slug"
                            value={categoryForm.slug}
                            onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                            placeholder="vertikalnye-pamyatniki"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category-description">Описание</Label>
                          <Textarea
                            id="category-description"
                            value={categoryForm.description}
                            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                            placeholder="Краткое описание категории"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={async () => {
                            if (!categoryForm.name || !categoryForm.slug) {
                              toast({
                                title: 'Ошибка',
                                description: 'Заполните название и slug',
                                variant: 'destructive'
                              });
                              return;
                            }

                            try {
                              const url = editingCategory 
                                ? `${PRODUCTS_API}?type=categories&id=${editingCategory.id}`
                                : `${PRODUCTS_API}?type=categories`;
                              
                              const response = await fetch(url, {
                                method: editingCategory ? 'PUT' : 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(categoryForm)
                              });

                              if (response.ok) {
                                toast({
                                  title: '✅ Успешно',
                                  description: editingCategory ? 'Категория обновлена' : 'Категория создана'
                                });
                                loadCategories();
                                setIsCategoryDialogOpen(false);
                                setEditingCategory(null);
                                setCategoryForm({ name: '', slug: '', description: '' });
                              } else {
                                throw new Error('Failed to save category');
                              }
                            } catch (error) {
                              toast({
                                title: '❌ Ошибка',
                                description: 'Не удалось сохранить категорию',
                                variant: 'destructive'
                              });
                            }
                          }}>
                            <Icon name={editingCategory ? "Save" : "Plus"} size={16} className="mr-2" />
                            {editingCategory ? 'Сохранить изменения' : 'Добавить категорию'}
                          </Button>
                          {editingCategory && (
                            <Button variant="outline" onClick={() => {
                              setEditingCategory(null);
                              setCategoryForm({
                                name: '',
                                slug: '',
                                description: '',
                              });
                            }}>
                              Отменить
                            </Button>
                          )}
                        </div>

                        <div className="border-t pt-4 mt-6">
                          <h3 className="font-oswald font-semibold text-lg mb-4">Существующие категории ({categories.length})</h3>
                          <div className="space-y-2">
                            {categories.map((category, index) => (
                              <Card key={category.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-1">
                                        <Badge variant="secondary" className="font-semibold text-sm px-2 py-1">#{index + 1}</Badge>
                                        <Badge variant="outline" className="font-mono text-sm px-2 py-0.5">ID: {category.id}</Badge>
                                        <h4 className="font-semibold">{category.name}</h4>
                                      </div>
                                      <p className="text-sm text-muted-foreground">/{category.slug}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                          setEditingCategory(category);
                                          setCategoryForm({
                                            name: category.name,
                                            slug: category.slug,
                                            description: category.description,
                                          });
                                        }}
                                      >
                                        <Icon name="Edit" size={14} className="mr-1" />
                                        Изменить
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={async () => {
                                          if (!confirm(`Удалить категорию "${category.name}"?`)) return;
                                          
                                          try {
                                            const response = await fetch(`${PRODUCTS_API}?type=categories&id=${category.id}`, {
                                              method: 'DELETE'
                                            });
                                            
                                            if (response.ok) {
                                              toast({
                                                title: '✅ Успешно',
                                                description: 'Категория удалена'
                                              });
                                              loadCategories();
                                            } else {
                                              throw new Error('Failed to delete');
                                            }
                                          } catch (error) {
                                            toast({
                                              title: '❌ Ошибка',
                                              description: 'Не удалось удалить категорию',
                                              variant: 'destructive'
                                            });
                                          }
                                        }}
                                      >
                                        <Icon name="Trash2" size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                  {category.description && (
                                    <p className="text-sm text-muted-foreground mt-2">{category.description}</p>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="relative">
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelImport}
                      className="hidden"
                      id="excel-import"
                    />
                    <Button 
                      variant="outline" 
                      className="font-oswald"
                      onClick={() => document.getElementById('excel-import')?.click()}
                    >
                      <Icon name="Upload" size={20} className="mr-2" />
                      Импорт из Excel
                    </Button>
                  </div>

                  <Button 
                    variant="outline" 
                    className="font-oswald"
                    onClick={() => {
                      if (products.length === 0) {
                        toast({
                          title: '⚠️ Нет товаров',
                          description: 'Добавьте товары перед экспортом',
                          variant: 'destructive'
                        });
                        return;
                      }

                      const exportData = products.map(product => ({
                        'Название': product.name,
                        'Артикул': product.sku || '',
                        'Описание': product.description,
                        'Цена': parseFloat(product.price),
                        'Старая цена': product.old_price ? parseFloat(product.old_price) : '',
                        'URL изображения': product.image_url || '',
                        'Материал': product.material || '',
                        'Размер': product.size || '',
                        'Полировка': product.polish || '',
                        'ID категории': product.category_id || '',
                        'Категория': product.category_name,
                        'В наличии': product.in_stock ? 1 : 0,
                        'Хит продаж': product.is_featured ? 1 : 0,
                        'Цена от': product.is_price_from ? 1 : 0
                      }));

                      const ws = XLSX.utils.json_to_sheet(exportData);
                      
                      const categoriesData = categories.map(cat => ({
                        'ID': cat.id,
                        'Название категории': cat.name,
                        'Описание': cat.description || ''
                      }));
                      const wsCat = XLSX.utils.json_to_sheet(categoriesData);
                      
                      const sizesData = [
                        { 'Размер': '60х40х5' },
                        { 'Размер': '60х40х8' },
                        { 'Размер': '80х40х5' },
                        { 'Размер': '80х40х8' },
                        { 'Размер': '90х45х8' },
                        { 'Размер': '100х50х5' },
                        { 'Размер': '100х50х8' },
                        { 'Размер': '100х60х5' },
                        { 'Размер': '100х60х8' },
                        { 'Размер': '120х60х8' },
                        { 'Размер': '110х70х8' }
                      ];
                      const wsSizes = XLSX.utils.json_to_sheet(sizesData);
                      
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Товары');
                      XLSX.utils.book_append_sheet(wb, wsCat, 'Категории (справочник)');
                      XLSX.utils.book_append_sheet(wb, wsSizes, 'Размеры (справочник)');
                      
                      const date = new Date().toISOString().split('T')[0];
                      XLSX.writeFile(wb, `товары_${date}.xlsx`);
                      
                      toast({
                        title: '✅ Товары экспортированы',
                        description: `Файл товары_${date}.xlsx успешно скачан`
                      });
                    }}
                  >
                    <Icon name="FileDown" size={20} className="mr-2" />
                    Экспорт товаров
                  </Button>

                  <Button 
                    variant="outline" 
                    className="font-oswald"
                    onClick={() => {
                      const template = [
                        {
                          'Название': 'Пример товара',
                          'Артикул': 'ART-001',
                          'Описание': 'Описание товара',
                          'Цена': 50000,
                          'Старая цена': 60000,
                          'URL изображения': 'https://example.com/image.jpg',
                          'Материал': 'Гранит',
                          'Размер': '100х50х8',
                          'Полировка': '3 стороны',
                          'ID категории': categories.length > 0 ? categories[0].id : 1,
                          'В наличии': 1,
                          'Хит продаж': 0,
                          'Цена от': 0
                        }
                      ];
                      const ws = XLSX.utils.json_to_sheet(template);
                      
                      const categoriesData = categories.map(cat => ({
                        'ID': cat.id,
                        'Название категории': cat.name,
                        'Описание': cat.description || ''
                      }));
                      const wsCat = XLSX.utils.json_to_sheet(categoriesData);
                      
                      const sizesData = [
                        { 'Размер': '60х40х5' },
                        { 'Размер': '60х40х8' },
                        { 'Размер': '80х40х5' },
                        { 'Размер': '80х40х8' },
                        { 'Размер': '90х45х8' },
                        { 'Размер': '100х50х5' },
                        { 'Размер': '100х50х8' },
                        { 'Размер': '100х60х5' },
                        { 'Размер': '100х60х8' },
                        { 'Размер': '120х60х8' },
                        { 'Размер': '110х70х8' },
                        { 'Размер': 'или свой размер' }
                      ];
                      const wsSizes = XLSX.utils.json_to_sheet(sizesData);
                      
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Товары');
                      XLSX.utils.book_append_sheet(wb, wsCat, 'Категории (справочник)');
                      XLSX.utils.book_append_sheet(wb, wsSizes, 'Размеры (справочник)');
                      XLSX.writeFile(wb, 'шаблон_товаров.xlsx');
                      toast({
                        title: '✅ Шаблон скачан',
                        description: 'В файле 3 листа: "Товары", "Категории" и "Размеры"'
                      });
                    }}
                  >
                    <Icon name="Download" size={20} className="mr-2" />
                    Шаблон Excel
                  </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Справочная информация</p>
                    <div className="flex flex-wrap gap-2">

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="font-oswald">
                        <Icon name="Info" size={20} className="mr-2" />
                        ID категорий
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Справочник ID категорий</DialogTitle>
                        <DialogDescription>
                          Используйте эти ID при заполнении Excel файла в колонке "ID категории"
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {categories.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Категории не созданы. Создайте категории перед импортом товаров.</p>
                        ) : (
                          categories.map((category) => (
                            <Card key={category.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline" className="font-mono text-base px-3 py-1">{category.id}</Badge>
                                      <div>
                                        <h4 className="font-semibold text-base">{category.name}</h4>
                                        {category.description && (
                                          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      navigator.clipboard.writeText(category.id.toString());
                                      toast({
                                        title: '✅ Скопировано',
                                        description: `ID ${category.id} скопирован в буфер обмена`
                                      });
                                    }}
                                  >
                                    <Icon name="Copy" size={14} className="mr-1" />
                                    Копировать
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
                    setIsProductDialogOpen(open);
                    if (!open) {
                      setEditingProduct(null);
                      setProductForm({
                        name: '',
                        slug: '',
                        description: '',
                        price: '',
                        old_price: '',
                        image_url: '',
                        material: '',
                        size: '',
                        sku: '',
                        polish: '',
                        category_id: '',
                        in_stock: true,
                        is_featured: false,
                        is_price_from: false,
                      });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="font-oswald">
                        <Icon name="Plus" size={20} className="mr-2" />
                        Добавить товар
                      </Button>
                    </DialogTrigger>
                  <DialogContent 
                    className="max-w-2xl max-h-[90vh] overflow-y-auto"
                    style={{ touchAction: 'pan-y' } as React.CSSProperties}
                  >
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}</DialogTitle>
                      <DialogDescription>
                        Заполните информацию о товаре
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pb-20">
                      <div>
                        <Label htmlFor="product-name">Название</Label>
                        <Input
                          id="product-name"
                          value={productForm.name}
                          onChange={(e) => {
                            setProductForm({ ...productForm, name: e.target.value, slug: generateSlug(e.target.value) });
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-slug">URL (slug)</Label>
                        <Input
                          id="product-slug"
                          value={productForm.slug}
                          onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-description">Описание</Label>
                        <Textarea
                          id="product-description"
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="product-price">Цена</Label>
                          <Input
                            id="product-price"
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-old-price">Старая цена</Label>
                          <Input
                            id="product-old-price"
                            type="number"
                            value={productForm.old_price}
                            onChange={(e) => setProductForm({ ...productForm, old_price: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="product-sku">Артикул</Label>
                          <Input
                            id="product-sku"
                            value={productForm.sku}
                            onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                            placeholder="ART-001"
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-material">Материал</Label>
                          <Input
                            id="product-material"
                            value={productForm.material}
                            onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="product-size">Размер (см)</Label>
                          <Select
                            value={['60х40х5', '60х40х8', '80х40х5', '80х40х8', '90х45х8', '100х50х5', '100х50х8', '100х60х5', '100х60х8', '120х60х8', '110х70х8'].includes(productForm.size) ? productForm.size : 'custom'}
                            onValueChange={(value) => {
                              if (value === 'custom') {
                                setCustomSize(productForm.size);
                                setProductForm({ ...productForm, size: '' });
                              } else {
                                setCustomSize('');
                                setProductForm({ ...productForm, size: value });
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите размер" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="60х40х5">60х40х5</SelectItem>
                              <SelectItem value="60х40х8">60х40х8</SelectItem>
                              <SelectItem value="80х40х5">80х40х5</SelectItem>
                              <SelectItem value="80х40х8">80х40х8</SelectItem>
                              <SelectItem value="90х45х8">90х45х8</SelectItem>
                              <SelectItem value="100х50х5">100х50х5</SelectItem>
                              <SelectItem value="100х50х8">100х50х8</SelectItem>
                              <SelectItem value="100х60х5">100х60х5</SelectItem>
                              <SelectItem value="100х60х8">100х60х8</SelectItem>
                              <SelectItem value="120х60х8">120х60х8</SelectItem>
                              <SelectItem value="110х70х8">110х70х8</SelectItem>
                              <SelectItem value="custom">Свой размер</SelectItem>
                            </SelectContent>
                          </Select>
                          {!['60х40х5', '60х40х8', '80х40х5', '80х40х8', '90х45х8', '100х50х5', '100х50х8', '100х60х5', '100х60х8', '120х60х8', '110х70х8'].includes(productForm.size) && (
                            <Input
                              className="mt-2"
                              placeholder="Введите свой размер (например: 150х80х10)"
                              value={productForm.size}
                              onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                            />
                          )}
                        </div>
                        <div>
                          <Label htmlFor="product-polish">Полировка</Label>
                          <Select
                            value={productForm.polish}
                            onValueChange={(value) => setProductForm({ ...productForm, polish: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите полировку" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1 сторона">1 сторона</SelectItem>
                              <SelectItem value="2 стороны">2 стороны</SelectItem>
                              <SelectItem value="3 стороны">3 стороны</SelectItem>
                              <SelectItem value="4 стороны">4 стороны</SelectItem>
                              <SelectItem value="5 сторон">5 сторон</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="product-category">Категория</Label>
                        <Select
                          value={productForm.category_id}
                          onValueChange={(value) => setProductForm({ ...productForm, category_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Изображение</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'product')}
                        />
                        {productForm.image_url && (
                          <div className="mt-2 space-y-2">
                            <img src={productForm.image_url} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                            <Input
                              value={productForm.image_url}
                              onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                              placeholder="Или вставьте URL изображения"
                              className="text-xs"
                            />
                          </div>
                        )}
                        {!productForm.image_url && (
                          <Input
                            value={productForm.image_url}
                            onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                            placeholder="Или вставьте URL изображения"
                            className="text-xs mt-2"
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="in_stock"
                            checked={productForm.in_stock}
                            onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="in_stock" className="cursor-pointer">В наличии</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is_featured"
                            checked={productForm.is_featured}
                            onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="is_featured" className="cursor-pointer">Хит продаж</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is_price_from"
                            checked={productForm.is_price_from}
                            onChange={(e) => setProductForm({ ...productForm, is_price_from: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="is_price_from" className="cursor-pointer">Цена "от"</Label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={async () => {
                          if (!productForm.name || !productForm.slug || !productForm.price) {
                            toast({
                              title: 'Ошибка',
                              description: 'Заполните название, slug и цену',
                              variant: 'destructive'
                            });
                            return;
                          }

                          try {
                            const url = editingProduct 
                              ? `${PRODUCTS_API}?id=${editingProduct.id}`
                              : PRODUCTS_API;
                            
                            const response = await fetch(url, {
                              method: editingProduct ? 'PUT' : 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(productForm)
                            });

                            if (response.ok) {
                              toast({
                                title: '✅ Успешно',
                                description: editingProduct ? 'Товар обновлён' : 'Товар создан'
                              });
                              loadProducts();
                              setIsProductDialogOpen(false);
                              setEditingProduct(null);
                              setProductForm({
                                name: '',
                                slug: '',
                                description: '',
                                price: '',
                                old_price: '',
                                image_url: '',
                                material: '',
                                size: '',
                                sku: '',
                                polish: '',
                                category_id: '',
                                in_stock: true,
                                is_featured: false,
                                is_price_from: false,
                              });
                            } else {
                              throw new Error('Failed to save product');
                            }
                          } catch (error) {
                            toast({
                              title: '❌ Ошибка',
                              description: 'Не удалось сохранить товар',
                              variant: 'destructive'
                            });
                          }
                        }}>
                          <Icon name={editingProduct ? "Save" : "Plus"} size={16} className="mr-2" />
                          {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
                        </Button>
                        {editingProduct && (
                          <Button variant="outline" onClick={() => {
                            setEditingProduct(null);
                            setProductForm({
                              name: '',
                              slug: '',
                              description: '',
                              price: '',
                              old_price: '',
                              image_url: '',
                              material: '',
                              size: '',
                              sku: '',
                              polish: '',
                              category_id: '',
                              in_stock: true,
                              is_featured: false,
                              is_price_from: false,
                            });
                          }}>
                            Отменить
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                </div>

                <div className="space-y-4 mb-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">Всего товаров: {products.filter(p => selectedCategoryFilter === 'all' || p.category_id?.toString() === selectedCategoryFilter).length}</p>
                      <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
                        <SelectTrigger className="w-[200px] h-8">
                          <SelectValue placeholder="Все категории" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все категории</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-1 border rounded-lg p-1">
                      <Button
                        size="sm"
                        variant={productsViewMode === 'grid' ? 'default' : 'ghost'}
                        onClick={() => setProductsViewMode('grid')}
                        className="h-8 px-3"
                      >
                        <Icon name="LayoutGrid" size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant={productsViewMode === 'list' ? 'default' : 'ghost'}
                        onClick={() => setProductsViewMode('list')}
                        className="h-8 px-3"
                      >
                        <Icon name="List" size={16} />
                      </Button>
                    </div>
                  </div>
                </div>

                {productsViewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {products.filter(p => selectedCategoryFilter === 'all' || p.category_id?.toString() === selectedCategoryFilter).map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-[4/3] bg-secondary relative">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="Image" size={48} className="text-muted-foreground" />
                          </div>
                        )}
                        {product.is_featured && (
                          <Badge className="absolute top-2 right-2 bg-primary">Хит</Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <Badge variant="outline" className="mb-2">{product.category_name}</Badge>
                        <h3 className="font-oswald font-semibold text-lg mb-1">{product.name}</h3>
                        {product.sku && (
                          <p className="text-xs text-muted-foreground mb-1">Артикул: {product.sku}</p>
                        )}
                        {product.polish && (
                          <p className="text-xs text-muted-foreground mb-1">Полировка: {product.polish}</p>
                        )}
                        <p className="font-oswald text-xl text-primary mb-3">{parseFloat(product.price).toLocaleString('ru-RU')} ₽</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setEditingProduct(product);
                            setProductForm({
                              name: product.name,
                              slug: product.slug,
                              description: product.description,
                              price: product.price,
                              old_price: product.old_price || '',
                              image_url: product.image_url || '',
                              material: product.material || '',
                              size: product.size || '',
                              sku: product.sku || '',
                              polish: product.polish || '',
                              category_id: product.category_id?.toString() || '',
                              in_stock: product.in_stock,
                              is_featured: product.is_featured,
                              is_price_from: product.is_price_from || false,
                            });
                            setIsProductDialogOpen(true);
                          }}
                        >
                          <Icon name="Edit" size={14} className="mr-1" />
                          Редактировать
                        </Button>
                      </CardContent>
                    </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {products.filter(p => selectedCategoryFilter === 'all' || p.category_id?.toString() === selectedCategoryFilter).map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-secondary rounded overflow-hidden flex-shrink-0">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Icon name="Image" size={24} className="text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">{product.category_name}</Badge>
                                {product.is_featured && (
                                  <Badge className="bg-primary text-xs">Хит</Badge>
                                )}
                                {!product.in_stock && (
                                  <Badge variant="destructive" className="text-xs">Нет в наличии</Badge>
                                )}
                                {product.is_price_from && (
                                  <Badge variant="secondary" className="text-xs">Цена от</Badge>
                                )}
                              </div>
                              <h3 className="font-oswald font-semibold text-lg mb-1 truncate">{product.name}</h3>
                              {product.sku && (
                                <p className="text-xs text-muted-foreground mb-1">Артикул: {product.sku}</p>
                              )}
                              {product.polish && (
                                <p className="text-xs text-muted-foreground mb-1">Полировка: {product.polish}</p>
                              )}
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{product.description}</p>
                              <div className="flex items-center gap-4">
                                <span className="font-oswald text-xl text-primary">
                                  {product.is_price_from && 'от '}{parseFloat(product.price).toLocaleString('ru-RU')} ₽
                                </span>
                                {product.old_price && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    {parseFloat(product.old_price).toLocaleString('ru-RU')} ₽
                                  </span>
                                )}
                                {product.material && (
                                  <span className="text-sm text-muted-foreground">{product.material}</span>
                                )}
                                {product.size && (
                                  <span className="text-sm text-muted-foreground">{product.size}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setProductForm({
                                    name: product.name,
                                    slug: product.slug,
                                    description: product.description,
                                    price: product.price,
                                    old_price: product.old_price || '',
                                    image_url: product.image_url || '',
                                    material: product.material || '',
                                    size: product.size || '',
                                    sku: product.sku || '',
                                    polish: product.polish || '',
                                    category_id: product.category_id?.toString() || '',
                                    in_stock: product.in_stock,
                                    is_featured: product.is_featured,
                                    is_price_from: product.is_price_from || false,
                                  });
                                  setIsProductDialogOpen(true);
                                }}
                              >
                                <Icon name="Edit" size={14} className="mr-1" />
                                Изменить
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={async () => {
                                  if (!confirm(`Удалить товар "${product.name}"?`)) return;
                                  
                                  try {
                                    const response = await fetch(`${PRODUCTS_API}?id=${product.id}`, {
                                      method: 'DELETE'
                                    });
                                    
                                    if (response.ok) {
                                      toast({
                                        title: '✅ Успешно',
                                        description: 'Товар удалён'
                                      });
                                      loadProducts();
                                    }
                                  } catch (error) {
                                    toast({
                                      title: '❌ Ошибка',
                                      description: 'Не удалось удалить товар',
                                      variant: 'destructive'
                                    });
                                  }
                                }}
                              >
                                <Icon name="Trash2" size={14} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-oswald">
                  {editingGalleryId !== null ? 'Редактировать элемент галереи' : 'Добавить в галерею работ'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGallerySubmit} className="space-y-4">
                  <div>
                    <Label>Тип контента</Label>
                    <Select
                      value={galleryForm.type}
                      onValueChange={(value: 'image' | 'video') => setGalleryForm({ ...galleryForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">📷 Изображение</SelectItem>
                        <SelectItem value="video">🎥 Видео</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Файл *</Label>
                    <div className="flex gap-4 items-start">
                      <Input
                        type="file"
                        accept={galleryForm.type === 'image' ? 'image/*' : 'video/*'}
                        onChange={(e) => handleImageUpload(e, 'gallery')}
                        disabled={uploadingGallery}
                      />
                      {galleryForm.url && (
                        <div className="w-20 h-20 rounded border overflow-hidden">
                          {galleryForm.type === 'video' ? (
                            <video src={galleryForm.url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={galleryForm.url} alt="Preview" className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                    {uploadingGallery && <Progress value={galleryUploadProgress} className="mt-2" />}
                  </div>

                  <div>
                    <Label htmlFor="gallery-title">Заголовок *</Label>
                    <Input
                      id="gallery-title"
                      value={galleryForm.title}
                      onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                      placeholder="Название работы"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gallery-desc">Описание</Label>
                    <Textarea
                      id="gallery-desc"
                      value={galleryForm.desc}
                      onChange={(e) => setGalleryForm({ ...galleryForm, desc: e.target.value })}
                      placeholder="Краткое описание работы"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={uploadingGallery}>
                      <Icon name={editingGalleryId !== null ? "Save" : "Plus"} size={16} className="mr-2" />
                      {editingGalleryId !== null ? 'Сохранить изменения' : 'Добавить в галерею'}
                    </Button>
                    {editingGalleryId !== null && (
                      <Button type="button" variant="outline" onClick={() => {
                        setEditingGalleryId(null);
                        setGalleryForm({ type: 'image', url: '', title: '', desc: '' });
                      }}>
                        Отменить
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-oswald">Элементы галереи ({galleryItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={galleryItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {galleryItems.map((item, index) => (
                        <SortableGalleryItem
                          key={item.id}
                          item={item}
                          index={index}
                          onEdit={handleGalleryEdit}
                          onDelete={handleGalleryDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}