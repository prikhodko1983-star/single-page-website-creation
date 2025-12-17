import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_URL = 'https://functions.poehali.dev/dee0114f-9dc3-4783-87b7-346a133d7c73';
const UPLOAD_URL = 'https://functions.poehali.dev/131d63b7-bef6-496a-a392-c04e347cd6aa';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
}

interface CategoryImage {
  id: number;
  category_id: number;
  name: string;
  image_url: string;
  sort_order: number;
  category_name: string;
}

export function ImageCategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<CategoryImage[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Category dialog
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0
  });
  
  // Image dialog
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<CategoryImage | null>(null);
  const [imageForm, setImageForm] = useState({
    category_id: 0,
    name: '',
    image_url: '',
    sort_order: 0
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadImages();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      loadImages(selectedCategoryId);
    } else {
      loadImages();
    }
  }, [selectedCategoryId]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?type=categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить категории', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async (categoryId?: number) => {
    setLoading(true);
    try {
      const url = categoryId 
        ? `${API_URL}?type=images&category_id=${categoryId}`
        : `${API_URL}?type=images`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить изображения', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name || !categoryForm.slug) {
      toast({ title: 'Ошибка', description: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }

    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory 
        ? { ...categoryForm, id: editingCategory.id }
        : categoryForm;

      const response = await fetch(`${API_URL}?type=category`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast({ title: 'Успех', description: editingCategory ? 'Категория обновлена' : 'Категория создана' });
        loadCategories();
        setCategoryDialogOpen(false);
        setEditingCategory(null);
        setCategoryForm({ name: '', slug: '', description: '', sort_order: 0 });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast({ title: 'Ошибка', description: 'Не удалось сохранить категорию', variant: 'destructive' });
    }
  };

  const handleCategoryDelete = async (id: number) => {
    if (!confirm('Удалить категорию и все её изображения?')) return;

    try {
      const response = await fetch(`${API_URL}?type=category&id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: 'Успех', description: 'Категория удалена' });
        loadCategories();
        loadImages();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ title: 'Ошибка', description: 'Не удалось удалить категорию', variant: 'destructive' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        const response = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            filename: file.name
          })
        });

        if (response.ok) {
          const data = await response.json();
          setImageForm(prev => ({ ...prev, image_url: data.url }));
          toast({ title: 'Успех', description: 'Изображение загружено' });
        }
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить изображение', variant: 'destructive' });
      setUploading(false);
    }
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageForm.category_id || !imageForm.name || !imageForm.image_url) {
      toast({ title: 'Ошибка', description: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }

    try {
      const method = editingImage ? 'PUT' : 'POST';
      const body = editingImage 
        ? { ...imageForm, id: editingImage.id }
        : imageForm;

      const response = await fetch(`${API_URL}?type=image`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast({ title: 'Успех', description: editingImage ? 'Изображение обновлено' : 'Изображение добавлено' });
        loadImages(selectedCategoryId || undefined);
        setImageDialogOpen(false);
        setEditingImage(null);
        setImageForm({ category_id: 0, name: '', image_url: '', sort_order: 0 });
      }
    } catch (error) {
      console.error('Error saving image:', error);
      toast({ title: 'Ошибка', description: 'Не удалось сохранить изображение', variant: 'destructive' });
    }
  };

  const handleImageDelete = async (id: number) => {
    if (!confirm('Удалить изображение?')) return;

    try {
      const response = await fetch(`${API_URL}?type=image&id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: 'Успех', description: 'Изображение удалено' });
        loadImages(selectedCategoryId || undefined);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({ title: 'Ошибка', description: 'Не удалось удалить изображение', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Категории изображений</CardTitle>
          <Button onClick={() => {
            setEditingCategory(null);
            setCategoryForm({ name: '', slug: '', description: '', sort_order: 0 });
            setCategoryDialogOpen(true);
          }}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить категорию
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <Card key={category.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryForm({
                          name: category.name,
                          slug: category.slug,
                          description: category.description,
                          sort_order: category.sort_order
                        });
                        setCategoryDialogOpen(true);
                      }}
                    >
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCategoryDelete(category.id)}
                    >
                      <Icon name="Trash" size={16} />
                    </Button>
                  </div>
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Images Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <CardTitle>Изображения</CardTitle>
            <Select
              value={selectedCategoryId?.toString() || 'all'}
              onValueChange={(value) => setSelectedCategoryId(value === 'all' ? null : parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
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
          <Button onClick={() => {
            setEditingImage(null);
            setImageForm({ 
              category_id: selectedCategoryId || (categories[0]?.id || 0), 
              name: '', 
              image_url: '', 
              sort_order: 0 
            });
            setImageDialogOpen(true);
          }}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить изображение
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map(image => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-square bg-secondary relative">
                  <img src={image.image_url} alt={image.name} className="w-full h-full object-contain" />
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium truncate">{image.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{image.category_name}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditingImage(image);
                        setImageForm({
                          category_id: image.category_id,
                          name: image.name,
                          image_url: image.image_url,
                          sort_order: image.sort_order
                        });
                        setImageDialogOpen(true);
                      }}
                    >
                      <Icon name="Pencil" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleImageDelete(image.id)}
                    >
                      <Icon name="Trash" size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {images.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Image" size={48} className="mx-auto mb-4 opacity-20" />
              <p>Нет изображений</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Редактировать' : 'Добавить'} категорию</DialogTitle>
            <DialogDescription>Создайте категорию для организации изображений</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <Label>Название *</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Цветы"
                required
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="flowers"
                required
              />
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Цветы и букеты"
              />
            </div>
            <div>
              <Label>Порядок сортировки</Label>
              <Input
                type="number"
                value={categoryForm.sort_order}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingCategory ? 'Обновить' : 'Создать'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                Отмена
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingImage ? 'Редактировать' : 'Добавить'} изображение</DialogTitle>
            <DialogDescription>Загрузите изображение в категорию</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImageSubmit} className="space-y-4">
            <div>
              <Label>Категория *</Label>
              <Select
                value={imageForm.category_id.toString()}
                onValueChange={(value) => setImageForm(prev => ({ ...prev, category_id: parseInt(value) }))}
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
              <Label>Название *</Label>
              <Input
                value={imageForm.name}
                onChange={(e) => setImageForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Роза"
                required
              />
            </div>
            <div>
              <Label>Изображение *</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading && <p className="text-sm text-muted-foreground mt-2">Загрузка...</p>}
              {imageForm.image_url && (
                <img src={imageForm.image_url} alt="Preview" className="mt-2 w-32 h-32 object-contain border rounded" />
              )}
            </div>
            <div>
              <Label>Порядок сортировки</Label>
              <Input
                type="number"
                value={imageForm.sort_order}
                onChange={(e) => setImageForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={!imageForm.image_url}>
                {editingImage ? 'Обновить' : 'Добавить'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setImageDialogOpen(false)}>
                Отмена
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
