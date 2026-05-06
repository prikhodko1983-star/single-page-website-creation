import { useState, useEffect, useRef } from 'react';
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
import { ImageCategoriesManager } from '@/components/admin/ImageCategoriesManager';

const useAuth = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const response = await fetch('https://functions.poehali.dev/8ac57caf-53fd-4068-b6ca-7c89b2e92e0c', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token
          }
        });
        
        if (!response.ok) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_username');
          navigate('/login');
          return;
        }
        
        setIsVerifying(false);
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_username');
        navigate('/login');
      }
    };
    
    verifyToken();
  }, [navigate]);
  
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_username');
    navigate('/login');
  };
  
  return { logout, username: localStorage.getItem('auth_username'), isVerifying };
};
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

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

  const [crosses, setCrosses] = useState<Array<{id: number, name: string, image_url: string, display_order: number}>>([]);
  const [crossForm, setCrossForm] = useState({ name: '', image_url: '', display_order: 0 });
  const [editingCross, setEditingCross] = useState<{id: number, name: string, image_url: string, display_order: number} | null>(null);
  const [uploadingCross, setUploadingCross] = useState(false);
  const [crossUploadProgress, setCrossUploadProgress] = useState(0);
  const [screenMode, setScreenMode] = useState(true);
  
  const [flowers, setFlowers] = useState<Array<{id: number, name: string, image_url: string, display_order: number}>>([]);
  const [flowerForm, setFlowerForm] = useState({ name: '', image_url: '', display_order: 0 });
  const [editingFlower, setEditingFlower] = useState<{id: number, name: string, image_url: string, display_order: number} | null>(null);
  const [uploadingFlower, setUploadingFlower] = useState(false);
  const [flowerUploadProgress, setFlowerUploadProgress] = useState(0);

  const [fonts, setFonts] = useState<Array<{filename: string, name: string, url: string}>>([]);
  const [fontForm, setFontForm] = useState({ name: '', file: null as File | null });
  const [uploadingFont, setUploadingFont] = useState(false);
  const [fontUploadProgress, setFontUploadProgress] = useState(0);
  const fontInputRef = useRef<HTMLInputElement>(null);
  const excelImportRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const categories_list = ["Вертикальные", "Горизонтальные", "Эксклюзивные", "С крестом"];
  const filterCategories = ["Все", ...categories_list];

  const API_URL = "https://functions.poehali.dev/92a4ea52-a3a0-4502-9181-ceeb714f2ad6";
  const UPLOAD_URL = "https://functions.poehali.dev/131d63b7-bef6-496a-a392-c04e347cd6aa";
  const PRODUCTS_API = "https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d";
  const FONTS_API = "https://functions.poehali.dev/c1b3f505-db44-492c-8db4-231760a9bb95";
  const GALLERY_API = "https://functions.poehali.dev/16b2bcd1-9c80-4d3e-96c6-0aaaac12c483";

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
    loadCrosses();
    loadFlowers();
    loadFonts();
    loadGallery();
  }, []);

  const [galleryLoaded, setGalleryLoaded] = useState(false);

  useEffect(() => {
    if (galleryLoaded && galleryItems.length > 0) {
      saveGallery();
    }
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
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${PRODUCTS_API}?type=categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const loadCrosses = async () => {
    try {
      const response = await fetch(`${API_URL}?type=crosses`);
      if (response.ok) {
        const data = await response.json();
        setCrosses(data);
      }
    } catch (error) {
      console.error('Error loading crosses:', error);
      setCrosses([]);
    }
  };

  const handleCrossSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!crossForm.name || !crossForm.image_url) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    try {
      const method = editingCross ? 'PUT' : 'POST';
      const url = editingCross ? `${API_URL}?type=crosses&id=${editingCross.id}` : `${API_URL}?type=crosses`;

      const displayOrder = editingCross 
        ? crossForm.display_order 
        : (crosses.length > 0 ? Math.max(...crosses.map(c => c.display_order)) + 1 : 1);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...crossForm,
          display_order: displayOrder
        })
      });

      if (response.ok) {
        toast({
          title: "Успех",
          description: editingCross ? "Крест обновлен" : "Крест добавлен"
        });
        loadCrosses();
        setCrossForm({ name: '', image_url: '', display_order: 0 });
        setEditingCross(null);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить крест",
        variant: "destructive"
      });
    }
  };

  const handleCrossEdit = (cross: typeof crosses[0]) => {
    setEditingCross(cross);
    setCrossForm({
      name: cross.name,
      image_url: cross.image_url,
      display_order: cross.display_order
    });
  };

  const handleCrossDelete = async (id: number) => {
    if (!confirm('Удалить этот крест?')) return;

    try {
      const response = await fetch(`${API_URL}?type=crosses&id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({ title: "Успех", description: "Крест удален" });
        loadCrosses();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить крест",
        variant: "destructive"
      });
    }
  };

  const handleCrossOrderChange = async (cross: typeof crosses[0], direction: 'up' | 'down') => {
    const currentIndex = crosses.findIndex(c => c.id === cross.id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === crosses.length - 1) return;
    
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapCross = crosses[swapIndex];
    
    try {
      await Promise.all([
        fetch(`${API_URL}?type=crosses&id=${cross.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cross.name,
            image_url: cross.image_url,
            display_order: swapCross.display_order
          })
        }),
        fetch(`${API_URL}?type=crosses&id=${swapCross.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: swapCross.name,
            image_url: swapCross.image_url,
            display_order: cross.display_order
          })
        })
      ]);
      
      loadCrosses();
      toast({ title: "Успех", description: "Порядок изменен" });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить порядок",
        variant: "destructive"
      });
    }
  };

  const loadFlowers = async () => {
    try {
      const response = await fetch(`${API_URL}?type=flowers`);
      if (response.ok) {
        const data = await response.json();
        setFlowers(data);
      }
    } catch (error) {
      console.error('Error loading flowers:', error);
      setFlowers([]);
    }
  };

  const handleFlowerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flowerForm.name || !flowerForm.image_url) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    try {
      const method = editingFlower ? 'PUT' : 'POST';
      const url = editingFlower ? `${API_URL}?type=flowers&id=${editingFlower.id}` : `${API_URL}?type=flowers`;

      const displayOrder = editingFlower 
        ? flowerForm.display_order 
        : (flowers.length > 0 ? Math.max(...flowers.map(f => f.display_order)) + 1 : 1);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...flowerForm,
          display_order: displayOrder
        })
      });

      if (response.ok) {
        toast({
          title: "Успех",
          description: editingFlower ? "Цветок обновлен" : "Цветок добавлен"
        });
        loadFlowers();
        setFlowerForm({ name: '', image_url: '', display_order: 0 });
        setEditingFlower(null);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить цветок",
        variant: "destructive"
      });
    }
  };

  const handleFlowerEdit = (flower: typeof flowers[0]) => {
    setEditingFlower(flower);
    setFlowerForm({
      name: flower.name,
      image_url: flower.image_url,
      display_order: flower.display_order
    });
  };

  const handleFlowerDelete = async (id: number) => {
    if (!confirm('Удалить этот цветок?')) return;

    try {
      const response = await fetch(`${API_URL}?type=flowers&id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({ title: "Успех", description: "Цветок удален" });
        loadFlowers();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить цветок",
        variant: "destructive"
      });
    }
  };

  const handleFlowerOrderChange = async (flower: typeof flowers[0], direction: 'up' | 'down') => {
    const currentIndex = flowers.findIndex(f => f.id === flower.id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === flowers.length - 1) return;
    
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapFlower = flowers[swapIndex];
    
    try {
      await Promise.all([
        fetch(`${API_URL}?type=flowers&id=${flower.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: flower.name,
            image_url: flower.image_url,
            display_order: swapFlower.display_order
          })
        }),
        fetch(`${API_URL}?type=flowers&id=${swapFlower.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: swapFlower.name,
            image_url: swapFlower.image_url,
            display_order: flower.display_order
          })
        })
      ]);
      
      loadFlowers();
      toast({ title: "Успех", description: "Порядок изменен" });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить порядок",
        variant: "destructive"
      });
    }
  };

  const loadFonts = async () => {
    try {
      console.log('Loading fonts from:', FONTS_API);
      const response = await fetch(FONTS_API);
      console.log('Fonts response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Fonts data:', data);
        setFonts(data);
      } else {
        console.error('Failed to load fonts:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading fonts:', error);
    }
  };

  const loadGallery = async () => {
    try {
      const response = await fetch(GALLERY_API);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setGalleryItems(data);
          setGalleryLoaded(true);
        }
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setGalleryLoaded(true);
    }
  };

  const saveGallery = async () => {
    try {
      const response = await fetch(GALLERY_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: galleryItems })
      });
      
      if (response.ok) {
        // Уведомляем другие компоненты об обновлении
        window.dispatchEvent(new Event('galleryUpdated'));
      }
    } catch (error) {
      console.error('Error saving gallery:', error);
    }
  };

  const handleFontUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fontForm.file || !fontForm.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Выберите файл и укажите название шрифта',
        variant: 'destructive'
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (fontForm.file.size > maxSize) {
      toast({
        title: 'Ошибка',
        description: 'Файл слишком большой (максимум 5 МБ)',
        variant: 'destructive'
      });
      return;
    }

    setUploadingFont(true);
    setFontUploadProgress(0);

    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        const base64 = reader.result?.toString().split(',')[1];
        
        if (!base64) {
          throw new Error('Failed to read file');
        }

        const token = localStorage.getItem('auth_token');
        console.log('Uploading font:', fontForm.file!.name, 'to', FONTS_API);
        const response = await fetch(FONTS_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token || ''
          },
          body: JSON.stringify({
            filename: fontForm.file!.name,
            data: base64,
            name: fontForm.name
          })
        });

        console.log('Upload response status:', response.status);
        if (response.ok) {
          const result = await response.json();
          console.log('Upload success:', result);
          toast({
            title: '✅ Успешно',
            description: 'Шрифт загружен'
          });
          await loadFonts();
          setFontForm({ name: '', file: null });
          if (fontInputRef.current) {
            fontInputRef.current.value = '';
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
          console.error('Upload failed:', errorData);
          throw new Error(errorData.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Font upload error:', error);
        toast({
          title: '❌ Ошибка',
          description: error instanceof Error ? error.message : 'Не удалось загрузить шрифт',
          variant: 'destructive'
        });
      } finally {
        setUploadingFont(false);
      }
    };

    reader.onerror = () => {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось прочитать файл',
        variant: 'destructive'
      });
      setUploadingFont(false);
    };

    reader.readAsDataURL(fontForm.file);
  };

  const handleFontDelete = async (filename: string) => {
    if (!confirm(`Удалить шрифт "${filename}"?`)) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${FONTS_API}?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': token || ''
        }
      });

      if (response.ok) {
        toast({
          title: '✅ Успешно',
          description: 'Шрифт удален'
        });
        loadFonts();
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось удалить шрифт',
        variant: 'destructive'
      });
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'monument' | 'gallery' | 'product' | 'cross' | 'flower') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'monument') setUploading(true);
    if (target === 'gallery') setUploadingGallery(true);
    if (target === 'cross') setUploadingCross(true);
    if (target === 'flower') setUploadingFlower(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
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
          console.log('Upload response:', data);

          if (data.url) {
            if (target === 'monument') {
              setMonumentForm({ ...monumentForm, image_url: data.url });
            } else if (target === 'gallery') {
              setGalleryForm({ ...galleryForm, url: data.url });
            } else if (target === 'product') {
              setProductForm({ ...productForm, image_url: data.url });
            } else if (target === 'cross') {
              const fileName = file.name.replace(/\.[^/.]+$/, '');
              setCrossForm({ 
                ...crossForm, 
                image_url: data.url,
                name: crossForm.name || fileName
              });
            } else if (target === 'flower') {
              const fileName = file.name.replace(/\.[^/.]+$/, '');
              setFlowerForm({ 
                ...flowerForm, 
                image_url: data.url,
                name: flowerForm.name || fileName
              });
            }
            
            toast({
              title: '✅ Успешно',
              description: 'Изображение загружено'
            });
          } else {
            toast({
              title: '❌ Ошибка',
              description: data.error || 'Не удалось загрузить изображение',
              variant: 'destructive'
            });
          }
        } catch (error) {
          console.error('Upload error:', error);
          toast({
            title: '❌ Ошибка',
            description: 'Не удалось загрузить изображение',
            variant: 'destructive'
          });
        } finally {
          if (target === 'monument') setUploading(false);
          if (target === 'gallery') setUploadingGallery(false);
          if (target === 'cross') setUploadingCross(false);
          if (target === 'flower') setUploadingFlower(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: '❌ Ошибка',
          description: 'Не удалось прочитать файл',
          variant: 'destructive'
        });
        if (target === 'monument') setUploading(false);
        if (target === 'gallery') setUploadingGallery(false);
        if (target === 'cross') setUploadingCross(false);
        if (target === 'flower') setUploadingFlower(false);
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
      if (target === 'cross') setUploadingCross(false);
      if (target === 'flower') setUploadingFlower(false);
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
      const updated = galleryItems.map((item, idx) =>
        idx === editingGalleryId ? { ...galleryForm, id: item.id } : item
      );
      console.log('Updating gallery item:', updated);
      setGalleryItems(updated);
      toast({
        title: '✅ Успешно',
        description: 'Элемент галереи обновлён'
      });
    } else {
      const newItem = { ...galleryForm, id: Date.now().toString() };
      const updated = [...galleryItems, newItem];
      console.log('Adding gallery item:', newItem);
      console.log('New gallery items:', updated);
      setGalleryItems(updated);
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

    setImporting(true);
    toast({
      title: '⏳ Импорт начат',
      description: 'Обработка файла...'
    });

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Excel data:', jsonData);

      if (!jsonData || jsonData.length === 0) {
        throw new Error('Файл пустой или формат неверный');
      }

      let successCount = 0;
      let errorCount = 0;
      let updatedCount = 0;
      let createdCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as Record<string, unknown>;
        try {
          const productData = {
            name: row['Название'] || row['name'] || '',
            slug: generateSlug(row['Название'] || row['name'] || ''),
            description: row['Описание'] || row['description'] || '',
            price: String(row['Цена'] || row['price'] || 0),
            old_price: row['Старая цена'] || row['old_price'] ? String(row['Старая цена'] || row['old_price']) : '',
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

          console.log(`Row ${i + 2}:`, productData);

          if (!productData.name || !productData.price) {
            errors.push(`Строка ${i + 2}: отсутствует название или цена`);
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
          const token = localStorage.getItem('auth_token');

          const response = await fetch(url, {
            method: method,
            headers: { 
              'Content-Type': 'application/json',
              'X-Auth-Token': token || ''
            },
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
            const errorText = await response.text();
            console.error(`Row ${i + 2} error:`, response.status, errorText);
            errors.push(`Строка ${i + 2}: ${response.status} ${errorText}`);
            errorCount++;
          }
        } catch (error) {
          console.error(`Row ${i + 2} exception:`, error);
          errors.push(`Строка ${i + 2}: ${error instanceof Error ? error.message : 'неизвестная ошибка'}`);
          errorCount++;
        }
      }

      console.log('Import result:', { createdCount, updatedCount, errorCount, errors });

      if (errors.length > 0) {
        console.error('Import errors:', errors);
      }

      toast({
        title: successCount > 0 ? '✅ Импорт завершён' : '❌ Импорт завершён с ошибками',
        description: `Создано: ${createdCount}, Обновлено: ${updatedCount}, Ошибок: ${errorCount}`,
        variant: errorCount > 0 && successCount === 0 ? 'destructive' : 'default'
      });

      loadProducts();
      e.target.value = '';
    } catch (error) {
      console.error('Excel import error:', error);
      toast({
        title: '❌ Ошибка импорта',
        description: error instanceof Error ? error.message : 'Не удалось обработать файл Excel',
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
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

  const { logout, username, isVerifying } = useAuth();
  
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background pb-20 pt-14">
      <div className="w-full border-b bg-background sticky top-14 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-oswald font-bold text-2xl">Панель администратора</h1>
              <p className="text-sm text-muted-foreground">Управление сайтом</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                <Icon name="Key" size={16} className="mr-2" />
                <span className="hidden sm:inline">Сменить пароль</span>
              </Button>
              <Button size="sm" variant="outline" onClick={logout}>
                <Icon name="LogOut" size={16} className="mr-2" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Смена логина и пароля</DialogTitle>
            <DialogDescription>
              Измените данные для входа в админ-панель
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const currentUsername = formData.get('current_username') as string;
            const currentPassword = formData.get('current_password') as string;
            const newUsername = formData.get('new_username') as string;
            const newPassword = formData.get('new_password') as string;
            
            if (!currentUsername || !currentPassword) {
              toast({
                title: 'Ошибка',
                description: 'Введите текущие данные',
                variant: 'destructive'
              });
              return;
            }
            
            if (!newUsername && !newPassword) {
              toast({
                title: 'Ошибка',
                description: 'Введите новый логин или пароль',
                variant: 'destructive'
              });
              return;
            }
            
            try {
              const response = await fetch('https://functions.poehali.dev/cf510a11-9eb6-49d2-905f-18c803ab5aa0', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  current_username: currentUsername,
                  current_password: currentPassword,
                  new_username: newUsername || undefined,
                  new_password: newPassword || undefined
                })
              });
              
              const data = await response.json();
              
              if (response.ok) {
                toast({
                  title: '✅ Успешно',
                  description: 'Данные обновлены. Войдите заново.'
                });
                setIsPasswordDialogOpen(false);
                setTimeout(() => {
                  logout();
                }, 2000);
              } else {
                toast({
                  title: 'Ошибка',
                  description: data.error || 'Не удалось изменить данные',
                  variant: 'destructive'
                });
              }
            } catch (error) {
              toast({
                title: 'Ошибка',
                description: 'Не удалось подключиться к серверу',
                variant: 'destructive'
              });
            }
          }} className="space-y-4">
            <div>
              <Label htmlFor="current_username">Текущий логин</Label>
              <Input id="current_username" name="current_username" required />
            </div>
            <div>
              <Label htmlFor="current_password">Текущий пароль</Label>
              <Input id="current_password" name="current_password" type="password" required />
            </div>
            <div className="border-t pt-4">
              <div className="mb-4">
                <Label htmlFor="new_username">Новый логин (необязательно)</Label>
                <Input id="new_username" name="new_username" placeholder="Оставьте пустым, чтобы не менять" />
              </div>
              <div>
                <Label htmlFor="new_password">Новый пароль (необязательно)</Label>
                <Input id="new_password" name="new_password" type="password" placeholder="Минимум 8 символов" />
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить изменения
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full mb-8 sticky top-[122px] z-30 bg-background/95 backdrop-blur -mx-4 px-4 py-2 border-b">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex w-auto h-auto p-1 bg-muted">
                <TabsTrigger value="overview" className="font-oswald whitespace-nowrap text-xs sm:text-sm">
                  <Icon name="LayoutDashboard" size={14} className="sm:mr-2" />
                  <span className="hidden sm:inline">Обзор</span>
                </TabsTrigger>
                <TabsTrigger value="shop" className="font-oswald whitespace-nowrap text-xs sm:text-sm">
                  <Icon name="ShoppingBag" size={14} className="sm:mr-2" />
                  <span className="hidden sm:inline">Магазин</span>
                </TabsTrigger>
                <TabsTrigger value="crosses" className="font-oswald whitespace-nowrap text-xs sm:text-sm">
                  <Icon name="Cross" size={14} className="sm:mr-2" />
                  <span className="hidden sm:inline">Кресты</span>
                </TabsTrigger>
                <TabsTrigger value="flowers" className="font-oswald whitespace-nowrap text-xs sm:text-sm">
                  <Icon name="Flower2" size={14} className="sm:mr-2" />
                  <span className="hidden sm:inline">Цветы</span>
                </TabsTrigger>
                <TabsTrigger value="gallery" className="font-oswald whitespace-nowrap text-xs sm:text-sm">
                  <Icon name="Images" size={14} className="sm:mr-2" />
                  <span className="hidden sm:inline">Галерея</span>
                </TabsTrigger>
                <TabsTrigger value="images" className="font-oswald whitespace-nowrap text-xs sm:text-sm">
                  <Icon name="Image" size={14} className="sm:mr-2" />
                  <span className="hidden sm:inline">Изображения</span>
                </TabsTrigger>
                <TabsTrigger value="fonts" className="font-oswald whitespace-nowrap text-xs sm:text-sm">
                  <Icon name="Type" size={14} className="sm:mr-2" />
                  <span className="hidden sm:inline">Шрифты</span>
                </TabsTrigger>
                <TabsTrigger value="staff" className="font-oswald whitespace-nowrap text-xs sm:text-sm">
                  <Icon name="Users" size={14} className="sm:mr-2" />
                  <span className="hidden sm:inline">Сотрудники</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                              const token = localStorage.getItem('auth_token');
                              const url = editingCategory 
                                ? `${PRODUCTS_API}?type=categories&id=${editingCategory.id}`
                                : `${PRODUCTS_API}?type=categories`;
                              
                              const response = await fetch(url, {
                                method: editingCategory ? 'PUT' : 'POST',
                                headers: { 
                                  'Content-Type': 'application/json',
                                  'X-Auth-Token': token || ''
                                },
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
                                            const token = localStorage.getItem('auth_token');
                                            const response = await fetch(`${PRODUCTS_API}?type=categories&id=${category.id}`, {
                                              method: 'DELETE',
                                              headers: {
                                                'X-Auth-Token': token || ''
                                              }
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
                      disabled={importing}
                    />
                    <Button 
                      variant="outline" 
                      className="font-oswald"
                      onClick={() => document.getElementById('excel-import')?.click()}
                      disabled={importing}
                    >
                      <Icon name={importing ? "Loader2" : "Upload"} size={20} className={`mr-2 ${importing ? 'animate-spin' : ''}`} />
                      {importing ? 'Импортирую...' : 'Импорт из Excel'}
                    </Button>
                  </div>

                  <Button 
                    variant="outline" 
                    className="font-oswald"
                    onClick={async () => {
                      if (products.length === 0) {
                        toast({
                          title: '⚠️ Нет товаров',
                          description: 'Добавьте товары перед экспортом',
                          variant: 'destructive'
                        });
                        return;
                      }

                      try {
                        const workbook = new ExcelJS.Workbook();
                        const worksheet = workbook.addWorksheet('Товары');

                        worksheet.columns = [
                          { header: 'Название', key: 'name', width: 30 },
                          { header: 'Артикул', key: 'sku', width: 15 },
                          { header: 'Категория', key: 'category', width: 20 },
                          { header: 'Описание', key: 'description', width: 40 },
                          { header: 'Цена', key: 'price', width: 15 },
                          { header: 'Старая цена', key: 'old_price', width: 15 },
                          { header: 'Материал', key: 'material', width: 20 },
                          { header: 'Размер', key: 'size', width: 20 },
                          { header: 'Полировка', key: 'polish', width: 20 },
                          { header: 'В наличии', key: 'in_stock', width: 12 },
                          { header: 'Хит продаж', key: 'is_featured', width: 12 },
                          { header: 'Изображение', key: 'image', width: 40 }
                        ];

                        worksheet.getRow(1).font = { bold: true };
                        worksheet.getRow(1).fill = {
                          type: 'pattern',
                          pattern: 'solid',
                          fgColor: { argb: 'FFD4A855' }
                        };

                        for (const product of products) {
                          const rowNumber = worksheet.rowCount + 1;
                          const row = worksheet.addRow({
                            name: product.name,
                            sku: product.sku || '',
                            category: product.category_name,
                            description: product.description,
                            price: `${product.is_price_from ? 'от ' : ''}${parseFloat(product.price).toLocaleString('ru-RU')} ₽`,
                            old_price: product.old_price ? `${parseFloat(product.old_price).toLocaleString('ru-RU')} ₽` : '',
                            material: product.material || '',
                            size: product.size || '',
                            polish: product.polish || '',
                            in_stock: product.in_stock ? 'Да' : 'Нет',
                            is_featured: product.is_featured ? 'Да' : 'Нет'
                          });

                          row.height = 100;

                          if (product.image_url) {
                            try {
                              const imageResponse = await fetch(product.image_url);
                              const imageBlob = await imageResponse.blob();
                              const imageBuffer = await imageBlob.arrayBuffer();

                              const imageId = workbook.addImage({
                                buffer: imageBuffer,
                                extension: 'png',
                              });

                              worksheet.addImage(imageId, {
                                tl: { col: 11, row: rowNumber - 1 },
                                ext: { width: 120, height: 120 }
                              });
                            } catch (error) {
                              console.error('Error loading image:', error);
                              row.getCell('image').value = product.image_url;
                            }
                          }
                        }

                        const buffer = await workbook.xlsx.writeBuffer();
                        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        const date = new Date().toISOString().split('T')[0];
                        link.download = `товары_${date}.xlsx`;
                        link.click();
                        window.URL.revokeObjectURL(url);

                        toast({
                          title: '✅ Товары экспортированы',
                          description: `Файл товары_${date}.xlsx успешно скачан`
                        });
                      } catch (error) {
                        console.error('Error exporting to Excel:', error);
                        toast({
                          title: '❌ Ошибка экспорта',
                          description: 'Не удалось экспортировать товары',
                          variant: 'destructive'
                        });
                      }
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
                    <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Справочник ID категорий</DialogTitle>
                        <DialogDescription>
                          Используйте эти ID при заполнении Excel файла в колонке "ID категории"
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto flex-1">
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
                    className="max-w-xl max-h-[85vh] overflow-y-auto"
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
                            const token = localStorage.getItem('auth_token');
                            console.log('Saving product:', editingProduct ? 'UPDATE' : 'CREATE');
                            console.log('Product data:', productForm);
                            console.log('Token exists:', !!token);
                            const url = editingProduct 
                              ? `${PRODUCTS_API}?id=${editingProduct.id}`
                              : PRODUCTS_API;
                            
                            const response = await fetch(url, {
                              method: editingProduct ? 'PUT' : 'POST',
                              headers: { 
                                'Content-Type': 'application/json',
                                'X-Auth-Token': token || ''
                              },
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
                            console.error('Product save error:', error);
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
                                    const token = localStorage.getItem('auth_token');
                                    const response = await fetch(`${PRODUCTS_API}?id=${product.id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'X-Auth-Token': token || ''
                                      }
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

          <TabsContent value="crosses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-oswald">
                  {editingCross ? 'Редактировать крест' : 'Добавить крест'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCrossSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="cross-name">Название *</Label>
                    <Input
                      id="cross-name"
                      value={crossForm.name}
                      onChange={(e) => setCrossForm({ ...crossForm, name: e.target.value })}
                      placeholder="Классический крест"
                      required
                    />
                  </div>

                  <div>
                    <Label>Изображение *</Label>
                    <div className="flex gap-4 items-start">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'cross')}
                        disabled={uploadingCross}
                      />
                      {crossForm.image_url && (
                        <div className="w-20 h-20 rounded border overflow-hidden bg-secondary">
                          <img src={crossForm.image_url} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                    {uploadingCross && <Progress value={crossUploadProgress} className="mt-2" />}
                    <p className="text-xs text-muted-foreground mt-2">
                      Новый крест добавится в конец галереи. Используйте кнопки ↑↓ для изменения порядка.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={uploadingCross}>
                      <Icon name={editingCross ? "Save" : "Plus"} size={16} className="mr-2" />
                      {editingCross ? 'Сохранить изменения' : 'Добавить крест'}
                    </Button>
                    {editingCross && (
                      <Button type="button" variant="outline" onClick={() => {
                        setEditingCross(null);
                        setCrossForm({ name: '', image_url: '', display_order: 0 });
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
                  <CardTitle className="font-oswald">Кресты в галерее ({crosses.length})</CardTitle>
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                    <input
                      type="checkbox"
                      id="screen-mode"
                      checked={screenMode}
                      onChange={(e) => setScreenMode(e.target.checked)}
                      className="w-5 h-5 rounded border-primary/30"
                    />
                    <Label htmlFor="screen-mode" className="cursor-pointer font-medium">
                      Режим "Экран"
                    </Label>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Убирает черный цвет с фотографии
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {crosses.map((cross, index) => (
                    <div key={cross.id} className="relative group">
                      <div className={`aspect-square rounded-lg border-2 border-border overflow-hidden ${screenMode ? 'bg-black' : 'bg-secondary'}`}>
                        <img 
                          src={cross.image_url} 
                          alt={cross.name} 
                          className="w-full h-full object-contain p-2"
                          style={screenMode ? { mixBlendMode: 'screen' } : {}}
                        />
                      </div>
                      <div className="mt-2 text-sm font-medium text-center">{cross.name}</div>
                      <div className="text-xs text-muted-foreground text-center">#{index + 1}</div>
                      
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCrossOrderChange(cross, 'up')}
                          disabled={index === 0}
                          className="h-8 w-8 p-0"
                          title="Переместить вверх"
                        >
                          <Icon name="ChevronUp" size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCrossOrderChange(cross, 'down')}
                          disabled={index === crosses.length - 1}
                          className="h-8 w-8 p-0"
                          title="Переместить вниз"
                        >
                          <Icon name="ChevronDown" size={14} />
                        </Button>
                      </div>
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCrossEdit(cross)}
                          className="h-8 w-8 p-0"
                          title="Редактировать"
                        >
                          <Icon name="Pencil" size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCrossDelete(cross.id)}
                          className="h-8 w-8 p-0"
                          title="Удалить"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {crosses.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Plus" size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Нет крестов в галерее</p>
                    <p className="text-sm">Добавьте первый крест используя форму выше</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flowers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-oswald">
                  {editingFlower ? 'Редактировать цветок' : 'Добавить цветок'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFlowerSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="flower-name">Название *</Label>
                    <Input
                      id="flower-name"
                      value={flowerForm.name}
                      onChange={(e) => setFlowerForm({ ...flowerForm, name: e.target.value })}
                      placeholder="Роза красная"
                      required
                    />
                  </div>

                  <div>
                    <Label>Изображение *</Label>
                    <div className="flex gap-4 items-start">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'flower')}
                        disabled={uploadingFlower}
                      />
                      {flowerForm.image_url && (
                        <div className="w-20 h-20 rounded border overflow-hidden bg-secondary">
                          <img src={flowerForm.image_url} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                    {uploadingFlower && <Progress value={flowerUploadProgress} className="mt-2" />}
                    <p className="text-xs text-muted-foreground mt-2">
                      Новый цветок добавится в конец галереи. Используйте кнопки ↑↓ для изменения порядка.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={uploadingFlower}>
                      <Icon name={editingFlower ? "Save" : "Plus"} size={16} className="mr-2" />
                      {editingFlower ? 'Сохранить изменения' : 'Добавить цветок'}
                    </Button>
                    {editingFlower && (
                      <Button type="button" variant="outline" onClick={() => {
                        setEditingFlower(null);
                        setFlowerForm({ name: '', image_url: '', display_order: 0 });
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
                  <CardTitle className="font-oswald">Цветы в галерее ({flowers.length})</CardTitle>
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                    <input
                      type="checkbox"
                      id="flower-screen-mode"
                      checked={screenMode}
                      onChange={(e) => setScreenMode(e.target.checked)}
                      className="w-5 h-5 rounded border-primary/30"
                    />
                    <Label htmlFor="flower-screen-mode" className="cursor-pointer font-medium">
                      Режим "Экран"
                    </Label>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Убирает черный цвет с фотографии
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {flowers.map((flower, index) => (
                    <div key={flower.id} className="relative group">
                      <div className={`aspect-square rounded-lg border-2 border-border overflow-hidden ${screenMode ? 'bg-black' : 'bg-secondary'}`}>
                        <img 
                          src={flower.image_url} 
                          alt={flower.name} 
                          className="w-full h-full object-contain p-2"
                          style={screenMode ? { mixBlendMode: 'screen' } : {}}
                        />
                      </div>
                      <div className="mt-2 text-sm font-medium text-center">{flower.name}</div>
                      <div className="text-xs text-muted-foreground text-center">#{index + 1}</div>
                      
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleFlowerOrderChange(flower, 'up')}
                          disabled={index === 0}
                          className="h-8 w-8 p-0"
                          title="Переместить вверх"
                        >
                          <Icon name="ChevronUp" size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleFlowerOrderChange(flower, 'down')}
                          disabled={index === flowers.length - 1}
                          className="h-8 w-8 p-0"
                          title="Переместить вниз"
                        >
                          <Icon name="ChevronDown" size={14} />
                        </Button>
                      </div>
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleFlowerEdit(flower)}
                          className="h-8 w-8 p-0"
                          title="Редактировать"
                        >
                          <Icon name="Pencil" size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleFlowerDelete(flower.id)}
                          className="h-8 w-8 p-0"
                          title="Удалить"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {flowers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Plus" size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Нет цветов в галерее</p>
                    <p className="text-sm">Добавьте первый цветок используя форму выше</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <ImageCategoriesManager />
          </TabsContent>

          <TabsContent value="fonts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-oswald">Загрузить шрифт</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFontUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="font-name">Название шрифта</Label>
                    <Input
                      id="font-name"
                      value={fontForm.name}
                      onChange={(e) => setFontForm({ ...fontForm, name: e.target.value })}
                      placeholder="Например: Helvetica"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="font-file">Файл шрифта (.ttf, .otf, .woff, .woff2)</Label>
                    <Input
                      ref={fontInputRef}
                      id="font-file"
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFontForm({ ...fontForm, file });
                        }
                      }}
                      required
                    />
                  </div>
                  {uploadingFont && (
                    <Progress value={fontUploadProgress} className="w-full" />
                  )}
                  <Button type="submit" disabled={uploadingFont || !fontForm.file || !fontForm.name.trim()}>
                    {uploadingFont ? (
                      <>
                        <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Icon name="Upload" size={16} className="mr-2" />
                        Загрузить шрифт
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-oswald">Загруженные шрифты</CardTitle>
              </CardHeader>
              <CardContent>
                {fonts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Type" size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Нет загруженных шрифтов</p>
                    <p className="text-sm">Загрузите первый шрифт используя форму выше</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fonts.map((font) => (
                      <div key={font.filename} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-semibold">{font.name}</div>
                          <div className="text-sm text-muted-foreground">{font.filename}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleFontDelete(font.filename)}
                        >
                          <Icon name="Trash2" size={14} className="mr-1" />
                          Удалить
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка: Сотрудники */}
          <TabsContent value="staff">
            <StaffTab token={localStorage.getItem('auth_token') || ''} currentUsername={localStorage.getItem('auth_username') || ''} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const STAFF_URL = 'https://functions.poehali.dev/cf510a11-9eb6-49d2-905f-18c803ab5aa0';

function StaffTab({ token, currentUsername }: { token: string; currentUsername: string }) {
  const { toast } = useToast();
  const [users, setUsers] = useState<{ id: number; username: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [curPassword, setCurPassword] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const res = await fetch(STAFF_URL, { headers: { 'X-Auth-Token': token } });
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch(STAFF_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify({ action: 'create_manager', username: newLogin, password: newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      toast({ title: 'Менеджер создан', description: `Логин: ${newLogin}`, duration: 3000 });
      setNewLogin(''); setNewPassword('');
      loadUsers();
    } else {
      toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
    }
    setCreating(false);
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Удалить менеджера «${username}»?`)) return;
    const res = await fetch(STAFF_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast({ title: 'Удалён', description: username, duration: 2000 });
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPwd(true);
    const res = await fetch(STAFF_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify({ action: 'change_password', current_username: currentUsername, current_password: curPassword, new_password: newPwd }),
    });
    const data = await res.json();
    if (res.ok) {
      toast({ title: 'Пароль изменён', duration: 2000 });
      setCurPassword(''); setNewPwd('');
    } else {
      toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
    }
    setChangingPwd(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Список пользователей */}
      <Card>
        <CardHeader>
          <CardTitle className="font-oswald">Сотрудники</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground text-sm py-4">Загрузка...</div>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{u.username}</span>
                    <Badge className="ml-2 text-xs" variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {u.role === 'admin' ? 'Администратор' : 'Менеджер'}
                    </Badge>
                  </div>
                  {u.role !== 'admin' && (
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id, u.username)}>
                      <Icon name="Trash2" size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Создать менеджера */}
      <Card>
        <CardHeader>
          <CardTitle className="font-oswald">Добавить менеджера</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Логин</Label>
                <Input placeholder="manager1" value={newLogin} onChange={e => setNewLogin(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Пароль</Label>
                <Input type="password" placeholder="минимум 6 символов" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
              </div>
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? <><Icon name="Loader2" size={14} className="mr-2 animate-spin" />Создаю...</> : <><Icon name="UserPlus" size={14} className="mr-2" />Создать</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Сменить свой пароль */}
      <Card>
        <CardHeader>
          <CardTitle className="font-oswald">Сменить свой пароль</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="space-y-1">
              <Label>Текущий пароль</Label>
              <Input type="password" placeholder="••••••••" value={curPassword} onChange={e => setCurPassword(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Новый пароль</Label>
              <Input type="password" placeholder="минимум 8 символов" value={newPwd} onChange={e => setNewPwd(e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" disabled={changingPwd}>
              {changingPwd ? <><Icon name="Loader2" size={14} className="mr-2 animate-spin" />Сохраняю...</> : <><Icon name="KeyRound" size={14} className="mr-2" />Сменить пароль</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}