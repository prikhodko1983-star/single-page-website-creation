import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  desc: string;
}

interface SortableGalleryItemProps {
  item: GalleryItem;
  index: number;
  onEdit: (idx: number) => void;
  onDelete: (idx: number) => void;
}

const SortableGalleryItem = ({ item, index, onEdit, onDelete }: SortableGalleryItemProps) => {
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
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(index)}
                  className="min-w-[80px]"
                >
                  <Icon name="Edit" size={14} className="mr-1" />
                  Изменить
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(index)}
                  className="min-w-[80px]"
                >
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

const Admin = () => {
  const navigate = useNavigate();
  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("Все");
  const [formData, setFormData] = useState<Monument>({
    title: "",
    image_url: "",
    price: "",
    size: "",
    category: "Вертикальные",
    description: ""
  });

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([
    { id: '1', type: 'image', url: 'https://cdn.poehali.dev/files/bbcac88c-6deb-429e-b227-40488c7c5273.jpg', title: 'Комплексное благоустройство', desc: 'Установка памятников и уход за территорией' },
    { id: '2', type: 'image', url: 'https://cdn.poehali.dev/files/58ba923f-a428-4ebd-a17d-2cd8e5b523a8.jpg', title: 'Художественная гравировка', desc: 'Индивидуальный дизайн и качественное исполнение' },
    { id: '3', type: 'image', url: 'https://cdn.poehali.dev/files/c80c1bd4-c413-425a-a1fc-91dbb36a8de4.jpg', title: 'Горизонтальные памятники', desc: 'Классический дизайн из чёрного гранита' },
    { id: '4', type: 'image', url: 'https://cdn.poehali.dev/files/6f5b52e2-08d6-473f-838f-e3ffd77bc1cf.jpg', title: 'Вертикальные стелы', desc: 'С профессиональной гравировкой портрета' },
    { id: '5', type: 'image', url: 'https://cdn.poehali.dev/files/a92e8f49-5be4-4b4b-939f-e97e69b14d55.jpg', title: 'Мемориальные комплексы', desc: 'С благоустройством и цветником' },
    { id: '6', type: 'image', url: 'https://cdn.poehali.dev/files/e4f88cd9-b74c-4b96-bf11-ab78a26bc19a.jpg', title: 'Элитные памятники', desc: 'Эксклюзивный дизайн по индивидуальному проекту' }
  ]);
  const [editingGalleryId, setEditingGalleryId] = useState<number | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState(0);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [galleryFormData, setGalleryFormData] = useState<Omit<GalleryItem, 'id'>>({
    type: 'image',
    url: '',
    title: '',
    desc: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const categories = ["Вертикальные", "Горизонтальные", "Эксклюзивные", "С крестом"];
  const filterCategories = ["Все", ...categories];

  const API_URL = "https://functions.poehali.dev/92a4ea52-a3a0-4502-9181-ceeb714f2ad6";
  const UPLOAD_URL = "https://functions.poehali.dev/96dcc1e1-90f9-4b11-b0c7-2d66559ddcbb";

  useEffect(() => {
    fetchMonuments();
    
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
      } else {
        console.error("API returned non-array data:", data);
        setMonuments([]);
      }
    } catch (error) {
      console.error("Error fetching monuments:", error);
      setMonuments([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация обязательных полей
    if (!formData.title.trim()) {
      alert('❌ Пожалуйста, введите название памятника');
      return;
    }
    if (!formData.image_url.trim()) {
      alert('❌ Пожалуйста, загрузите изображение памятника');
      return;
    }
    if (!formData.price.trim()) {
      alert('❌ Пожалуйста, укажите цену');
      return;
    }
    if (!formData.size.trim()) {
      alert('❌ Пожалуйста, укажите размер');
      return;
    }

    try {
      let response;
      if (editingId) {
        response = await fetch(`${API_URL}?id=${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        alert(editingId ? '✓ Памятник успешно обновлён' : '✓ Памятник успешно добавлен');
        setFormData({ title: "", image_url: "", price: "", size: "", category: "Вертикальные", description: "" });
        setEditingId(null);
        fetchMonuments();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        alert('✗ Ошибка при сохранении памятника');
      }
    } catch (error) {
      console.error("Error saving monument:", error);
      alert('✗ Ошибка при сохранении памятника');
    }
  };

  const handleEdit = (monument: Monument) => {
    setFormData(monument);
    setEditingId(monument.id || null);
  };

  const handleDelete = async (id: number) => {
    const monument = monuments.find(m => m.id === id);
    if (!confirm(`Вы уверены, что хотите удалить памятник "${monument?.title}"?\n\nЭто действие нельзя отменить.`)) return;

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        alert('✓ Памятник успешно удалён');
        fetchMonuments();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Delete error:', errorData);
        alert(`✗ Ошибка при удалении: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error("Error deleting monument:", error);
      alert(`✗ Ошибка при удалении: ${error}`);
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", image_url: "", price: "", size: "", category: "Вертикальные", description: "" });
    setEditingId(null);
  };

  const uploadFile = async (file: File, targetForm: 'monument' | 'gallery' = 'gallery') => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      alert('❌ Пожалуйста, выберите изображение или видео');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('❌ Размер файла не должен превышать 10 МБ');
      return;
    }

    if (targetForm === 'monument') {
      setUploading(true);
      setUploadProgress(0);
    } else {
      setUploadingGallery(true);
      setGalleryUploadProgress(0);
    }

    try {
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentLoaded = Math.round((e.loaded / e.total) * 50);
          if (targetForm === 'monument') {
            setUploadProgress(percentLoaded);
          } else {
            setGalleryUploadProgress(percentLoaded);
          }
        }
      };
      
      reader.onerror = () => {
        console.error('FileReader error');
        alert('❌ Ошибка чтения файла. Попробуйте другое изображение.');
        if (targetForm === 'monument') {
          setUploading(false);
          setUploadProgress(0);
        } else {
          setUploadingGallery(false);
          setGalleryUploadProgress(0);
        }
      };
      
      reader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            throw new Error('Не удалось прочитать файл');
          }
          
          if (targetForm === 'monument') {
            setUploadProgress(50);
          } else {
            setGalleryUploadProgress(50);
          }
          
          const base64 = event.target.result as string;
          
          if (!base64 || !base64.startsWith('data:')) {
            throw new Error('Неверный формат данных');
          }
          
          const extension = file.name.split('.').pop()?.toLowerCase() || (file.type.startsWith('video/') ? 'mp4' : 'jpg');

          if (targetForm === 'monument') {
            setUploadProgress(60);
          } else {
            setGalleryUploadProgress(60);
          }

          const uploadTimeout = setTimeout(() => {
            throw new Error('Превышено время ожидания загрузки');
          }, 60000);
          
          const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64,
              extension: extension
            })
          });
          
          clearTimeout(uploadTimeout);

          if (targetForm === 'monument') {
            setUploadProgress(90);
          } else {
            setGalleryUploadProgress(90);
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('Upload error:', errorData);
            alert(`❌ Ошибка загрузки: ${errorData.error || 'Неизвестная ошибка'}`);
            if (targetForm === 'monument') {
              setUploading(false);
              setUploadProgress(0);
            } else {
              setUploadingGallery(false);
              setGalleryUploadProgress(0);
            }
            return;
          }

          const data = await response.json();

          if (!data || typeof data !== 'object') {
            throw new Error('Неверный ответ сервера');
          }

          if (data.url && typeof data.url === 'string') {
            if (targetForm === 'monument') {
              setUploadProgress(100);
              setFormData({ ...formData, image_url: data.url });
              setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
              }, 500);
            } else {
              setGalleryUploadProgress(100);
              setGalleryFormData({ ...galleryFormData, url: data.url, type: isImage ? 'image' : 'video' });
              setTimeout(() => {
                setUploadingGallery(false);
                setGalleryUploadProgress(0);
              }, 500);
            }
          } else {
            alert('❌ Ошибка: не получен URL изображения');
            if (targetForm === 'monument') {
              setUploading(false);
              setUploadProgress(0);
            } else {
              setUploadingGallery(false);
              setGalleryUploadProgress(0);
            }
          }
        } catch (error) {
          console.error('Upload error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
          alert(`❌ Ошибка загрузки: ${errorMessage}`);
          if (targetForm === 'monument') {
            setUploading(false);
            setUploadProgress(0);
          } else {
            setUploadingGallery(false);
            setGalleryUploadProgress(0);
          }
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Ошибка загрузки изображения');
      if (targetForm === 'monument') {
        setUploading(false);
        setUploadProgress(0);
      } else {
        setUploadingGallery(false);
        setGalleryUploadProgress(0);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file, 'monument');
  };

  const handleDragOver = (e: React.DragEvent, target: 'monument' | 'gallery' = 'monument') => {
    e.preventDefault();
    if (target === 'monument') {
      setIsDragging(true);
    } else {
      setIsDraggingGallery(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent, target: 'monument' | 'gallery' = 'monument') => {
    e.preventDefault();
    if (target === 'monument') {
      setIsDragging(false);
    } else {
      setIsDraggingGallery(false);
    }
  };

  const handleDrop = (e: React.DragEvent, target: 'monument' | 'gallery' = 'monument') => {
    e.preventDefault();
    if (target === 'monument') {
      setIsDragging(false);
    } else {
      setIsDraggingGallery(false);
    }

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file, target);
    }
  };

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, 'gallery');
  };

  const handleAddGalleryItem = () => {
    if (!galleryFormData.url || !galleryFormData.title || !galleryFormData.desc) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    if (editingGalleryId !== null) {
      setGalleryItems(galleryItems.map((item, idx) => 
        idx === editingGalleryId ? { ...galleryFormData, id: item.id } : item
      ));
      alert('✓ Элемент галереи обновлён');
    } else {
      const newId = Date.now().toString();
      setGalleryItems([...galleryItems, { ...galleryFormData, id: newId }]);
      alert('✓ Элемент галереи добавлен');
    }

    setGalleryFormData({ type: 'image', url: '', title: '', desc: '' });
    setEditingGalleryId(null);
  };

  const handleEditGalleryItem = (idx: number) => {
    const { id, ...rest } = galleryItems[idx];
    setGalleryFormData(rest);
    setEditingGalleryId(idx);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setGalleryItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDeleteGalleryItem = (idx: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот элемент?')) return;
    setGalleryItems(galleryItems.filter((_, i) => i !== idx));
    alert('✓ Элемент галереи удалён');
  };

  const handleCancelGalleryEdit = () => {
    setGalleryFormData({ type: 'image', url: '', title: '', desc: '' });
    setEditingGalleryId(null);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-oswald font-bold text-4xl mb-2">Админ-панель</h1>
              <p className="text-muted-foreground">Управление каталогом памятников</p>
            </div>
            <Button onClick={() => navigate('/admin/products')} className="font-oswald">
              <Icon name="ShoppingBag" size={20} className="mr-2" />
              Управление товарами
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-oswald">
                {editingId ? "Редактировать памятник" : "Добавить памятник"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Название *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Вертикальные памятники"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Изображение *</label>
                  <div className="space-y-3">
                    <div 
                      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragging 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onDragOver={(e) => handleDragOver(e, 'monument')}
                      onDragLeave={(e) => handleDragLeave(e, 'monument')}
                      onDrop={(e) => handleDrop(e, 'monument')}
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
                          <Icon name="Loader2" className="animate-spin text-primary" size={40} />
                          <div className="w-full space-y-2">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-sm text-center text-muted-foreground font-medium">
                              Загрузка {uploadProgress}%
                            </p>
                          </div>
                        </div>
                      ) : formData.image_url ? (
                        <div className="space-y-3">
                          <div className="relative w-full h-48 bg-secondary rounded overflow-hidden flex items-center justify-center">
                            <img
                              src={formData.image_url}
                              alt="Превью"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({ ...formData, image_url: "" })}
                          >
                            <Icon name="X" className="mr-2" size={16} />
                            Удалить изображение
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Icon name="Upload" className="mx-auto text-muted-foreground" size={48} />
                          <div>
                            <p className="text-sm font-medium mb-1">
                              Перетащите изображение сюда
                            </p>
                            <p className="text-xs text-muted-foreground">
                              или нажмите, чтобы выбрать файл
                            </p>
                          </div>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="или вставьте URL: https://..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Цена *</label>
                  <Input
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="от 15 000 ₽"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Размер *</label>
                  <Input
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="100x50x5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Категория *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Описание</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Дополнительная информация"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Icon name={editingId ? "Save" : "Plus"} className="mr-2" size={18} />
                    {editingId ? "Сохранить" : "Добавить"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Отмена
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-oswald font-bold text-2xl">Список памятников</h2>
              <div className="flex gap-2">
                {filterCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            {monuments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Пока нет памятников в каталоге</p>
                  <p className="text-sm text-muted-foreground">Добавьте первый памятник через форму слева</p>
                </CardContent>
              </Card>
            ) : (
              monuments
                .filter(m => filterCategory === "Все" || m.category === filterCategory)
                .map((monument) => (
                <Card key={monument.id} className={editingId === monument.id ? 'border-primary border-2' : ''}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-32 h-40 flex-shrink-0 bg-secondary rounded border-2 border-border overflow-hidden flex items-center justify-center">
                        <img
                          src={monument.image_url}
                          alt={monument.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        {editingId === monument.id && (
                          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-oswald font-bold text-lg mb-1 truncate">{monument.title}</h3>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Icon name="DollarSign" size={14} />
                            {monument.price}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Icon name="Maximize2" size={14} />
                            {monument.size}
                          </p>
                          {monument.category && (
                            <p className="text-sm text-primary font-medium flex items-center gap-2">
                              <Icon name="Tag" size={14} />
                              {monument.category}
                            </p>
                          )}
                        </div>
                        {monument.description && (
                          <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{monument.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant={editingId === monument.id ? "default" : "outline"}
                          onClick={() => handleEdit(monument)}
                          className="min-w-[100px]"
                        >
                          <Icon name="Edit" size={16} className="mr-2" />
                          Изменить
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(monument.id!)}
                          className="min-w-[100px]"
                        >
                          <Icon name="Trash2" size={16} className="mr-2" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-oswald font-bold text-3xl mb-6">Управление галереей работ</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-oswald">
                  {editingGalleryId !== null ? "Редактировать элемент" : "Добавить фото/видео в галерею"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Тип контента</label>
                    <select
                      value={galleryFormData.type}
                      onChange={(e) => setGalleryFormData({ ...galleryFormData, type: e.target.value as 'image' | 'video' })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="image">Фото</option>
                      <option value="video">Видео</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Файл *</label>
                    <div className="space-y-3">
                      <div 
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          isDraggingGallery 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onDragOver={(e) => handleDragOver(e, 'gallery')}
                        onDragLeave={(e) => handleDragLeave(e, 'gallery')}
                        onDrop={(e) => handleDrop(e, 'gallery')}
                      >
                        {uploadingGallery ? (
                          <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
                            <Icon name="Loader2" className="animate-spin text-primary" size={40} />
                            <div className="w-full space-y-2">
                              <Progress value={galleryUploadProgress} className="h-2" />
                              <p className="text-sm text-center text-muted-foreground font-medium">
                                Загрузка {galleryUploadProgress}%
                              </p>
                            </div>
                          </div>
                        ) : galleryFormData.url ? (
                          <div className="space-y-3">
                            <div className="relative w-full h-48 bg-secondary rounded overflow-hidden">
                              {galleryFormData.type === 'video' ? (
                                <video
                                  src={galleryFormData.url}
                                  className="w-full h-full object-contain"
                                  controls
                                />
                              ) : (
                                <img
                                  src={galleryFormData.url}
                                  alt="Превью"
                                  className="w-full h-full object-contain"
                                />
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setGalleryFormData({ ...galleryFormData, url: "" })}
                            >
                              <Icon name="X" className="mr-2" size={16} />
                              Удалить файл
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Icon name="Upload" className="mx-auto text-muted-foreground" size={48} />
                            <div>
                              <p className="text-sm font-medium mb-1">
                                Перетащите {galleryFormData.type === 'video' ? 'видео' : 'изображение'} сюда
                              </p>
                              <p className="text-xs text-muted-foreground">
                                или нажмите, чтобы выбрать файл
                              </p>
                            </div>
                            <Input
                              type="file"
                              accept={galleryFormData.type === 'video' ? 'video/*' : 'image/*'}
                              onChange={handleGalleryImageUpload}
                              disabled={uploadingGallery}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                      <Input
                        value={galleryFormData.url}
                        onChange={(e) => setGalleryFormData({ ...galleryFormData, url: e.target.value })}
                        placeholder="или вставьте URL: https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Название *</label>
                    <Input
                      value={galleryFormData.title}
                      onChange={(e) => setGalleryFormData({ ...galleryFormData, title: e.target.value })}
                      placeholder="Комплексное благоустройство"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Описание *</label>
                    <Textarea
                      value={galleryFormData.desc}
                      onChange={(e) => setGalleryFormData({ ...galleryFormData, desc: e.target.value })}
                      placeholder="Установка памятников и уход за территорией"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" onClick={handleAddGalleryItem} className="flex-1">
                      <Icon name={editingGalleryId !== null ? "Save" : "Plus"} className="mr-2" size={18} />
                      {editingGalleryId !== null ? "Сохранить" : "Добавить"}
                    </Button>
                    {editingGalleryId !== null && (
                      <Button type="button" variant="outline" onClick={handleCancelGalleryEdit}>
                        Отмена
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-oswald font-semibold text-xl">
                  Элементы галереи ({galleryItems.length})
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="GripVertical" size={16} />
                  <span>Перетащите для изменения порядка</span>
                </div>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={galleryItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                    {galleryItems.map((item, idx) => (
                      <SortableGalleryItem
                        key={item.id}
                        item={item}
                        index={idx}
                        onEdit={handleEditGalleryItem}
                        onDelete={handleDeleteGalleryItem}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;