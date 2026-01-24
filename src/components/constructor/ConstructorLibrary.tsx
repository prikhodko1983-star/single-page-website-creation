import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useEffect, useState } from "react";

interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'cross' | 'flower' | 'epitaph' | 'fio' | 'dates' | 'photo';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string;
  fontSize?: number;
  color?: string;
  rotation?: number;
  fontFamily?: string;
  screenMode?: boolean;
  processedSrc?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
  autoSize?: boolean;
}

interface ConstructorLibraryProps {
  monumentImage: string;
  setMonumentImage: (src: string) => void;
  addTextElement: () => void;
  addEpitaphElement: (customText?: string) => void;
  addImageElement: (src: string, type: 'image' | 'cross' | 'flower') => void;
  addFIOElement: () => void;
  addDatesElement: () => void;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  photoInputRef: React.RefObject<HTMLInputElement>;
  surname: string;
  setSurname: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  patronymic: string;
  setPatronymic: (value: string) => void;
  selectedFont: string;
  setSelectedFont: (value: string) => void;
  birthDate: string;
  setBirthDate: (value: string) => void;
  deathDate: string;
  setDeathDate: (value: string) => void;
  selectedDateFont: string;
  setSelectedDateFont: (value: string) => void;
  catalogCategories: Array<{id: number, name: string}>;
  catalogProducts: Array<{id: number, name: string, category_id: number, image_url: string | null}>;
  selectedCategory: number | null;
  setSelectedCategory: (id: number) => void;
  isLoadingCatalog: boolean;
  loadCatalog: () => void;
  fonts: Array<{id: string, name: string, style: string, weight: string, example: string, fullStyle: string}>;
  crosses: Array<{id: number, name: string, image_url: string}>;
  isLoadingCrosses: boolean;
  loadCrosses: () => void;
  flowers: Array<{id: number, name: string, image_url: string}>;
  isLoadingFlowers: boolean;
  loadFlowers: () => void;
}

export const ConstructorLibrary = ({
  monumentImage,
  setMonumentImage,
  addTextElement,
  addEpitaphElement,
  addImageElement,
  addFIOElement,
  addDatesElement,
  handlePhotoUpload,
  photoInputRef,
  surname,
  setSurname,
  name,
  setName,
  patronymic,
  setPatronymic,
  selectedFont,
  setSelectedFont,
  birthDate,
  setBirthDate,
  deathDate,
  setDeathDate,
  selectedDateFont,
  setSelectedDateFont,
  catalogCategories,
  catalogProducts,
  selectedCategory,
  setSelectedCategory,
  isLoadingCatalog,
  loadCatalog,
  fonts,
  crosses,
  isLoadingCrosses,
  loadCrosses,
  flowers,
  isLoadingFlowers,
  loadFlowers,
}: ConstructorLibraryProps) => {
  const [imageCategories, setImageCategories] = useState<Array<{id: number, name: string, slug: string}>>([]);
  const [categoryImages, setCategoryImages] = useState<Array<{id: number, category_id: number, name: string, image_url: string, category_name: string}>>([]);
  const [selectedImageCategory, setSelectedImageCategory] = useState<number | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  useEffect(() => {
    loadCatalog();
    loadCrosses();
    loadFlowers();
    loadImageCategories();
  }, []);

  const loadImageCategories = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/dee0114f-9dc3-4783-87b7-346a133d7c73?type=categories');
      if (response.ok) {
        const data = await response.json();
        setImageCategories(data);
        if (data.length > 0) {
          setSelectedImageCategory(data[0].id);
          loadAllCategoryImages(data);
        }
      }
    } catch (error) {
      console.error('Error loading image categories:', error);
    }
  };

  const loadAllCategoryImages = async (categories: Array<{id: number, name: string, slug: string}>) => {
    setIsLoadingImages(true);
    try {
      const allImages: Array<{id: number, category_id: number, name: string, image_url: string, category_name: string}> = [];
      
      for (const category of categories) {
        const response = await fetch(`https://functions.poehali.dev/dee0114f-9dc3-4783-87b7-346a133d7c73?type=images&category_id=${category.id}`);
        if (response.ok) {
          const data = await response.json();
          allImages.push(...data);
        }
      }
      
      setCategoryImages(allImages);
    } catch (error) {
      console.error('Error loading category images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const loadCategoryImages = async (categoryId: number) => {
    setIsLoadingImages(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/dee0114f-9dc3-4783-87b7-346a133d7c73?type=images&category_id=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setCategoryImages(data);
      }
    } catch (error) {
      console.error('Error loading category images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-oswald font-bold text-lg mb-4">Библиотека элементов</h2>
        
        <Tabs defaultValue="catalog" className="w-full" onValueChange={(value) => {
          if (value === 'catalog') loadCatalog();
          if (value === 'elements') {
            loadCrosses();
            loadFlowers();
          }
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="catalog">Каталог</TabsTrigger>
            <TabsTrigger value="images">Изображения</TabsTrigger>
            <TabsTrigger value="elements">Элементы</TabsTrigger>
          </TabsList>
          
          <TabsContent value="catalog" className="space-y-3 mt-4">
            <Label>Памятники из каталога магазина</Label>
            
            {isLoadingCatalog ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {catalogCategories.length > 0 && (
                  <Tabs value={selectedCategory?.toString()} onValueChange={(val) => setSelectedCategory(parseInt(val))} className="w-full">
                    <TabsList className="w-full flex-wrap h-auto gap-1">
                      {catalogCategories.map(cat => {
                        const count = catalogProducts.filter(p => p.category_id === cat.id && p.image_url).length;
                        return (
                          <TabsTrigger 
                            key={cat.id} 
                            value={cat.id.toString()} 
                            className="text-xs flex-1 min-w-[100px]"
                          >
                            <span className="truncate">{cat.name}</span>
                            <Badge variant="secondary" className="ml-1 h-4 text-[10px] px-1">
                              {count}
                            </Badge>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                    
                    {catalogCategories.map(cat => {
                      const categoryProducts = catalogProducts.filter(p => p.category_id === cat.id && p.image_url);
                      return (
                        <TabsContent key={cat.id} value={cat.id.toString()} className="mt-3">
                          {categoryProducts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {categoryProducts.map(product => (
                                <button
                                  key={product.id}
                                  onClick={() => setMonumentImage(product.image_url!)}
                                  className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all bg-secondary ${
                                    monumentImage === product.image_url ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                                  }`}
                                >
                                  <img src={product.image_url!} alt={product.name} className="w-full h-full object-contain p-2" />
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent text-white text-xs p-2 text-center">
                                    <div className="font-medium">{product.name}</div>
                                  </div>
                                  {monumentImage === product.image_url && (
                                    <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                                      <Icon name="Check" size={12} className="text-primary-foreground" />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <p className="text-sm">Нет памятников в этой категории</p>
                            </div>
                          )}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                )}
                
                {catalogCategories.length === 0 && catalogProducts.length === 0 && !isLoadingCatalog && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Package" size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">Каталог пуст</p>
                    <p className="text-xs mt-1">Добавьте памятники в магазин через админ-панель</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="images" className="space-y-3 mt-4">
            <Label>Изображения по категориям</Label>
            
            {isLoadingImages ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {imageCategories.length > 0 && (
                  <Tabs value={selectedImageCategory?.toString()} onValueChange={(val) => {
                    const catId = parseInt(val);
                    setSelectedImageCategory(catId);
                  }} className="w-full">
                    <TabsList className="w-full flex-wrap h-auto gap-1">
                      {imageCategories.map(cat => {
                        const count = categoryImages.filter(img => img.category_id === cat.id).length;
                        return (
                          <TabsTrigger 
                            key={cat.id} 
                            value={cat.id.toString()} 
                            className="text-xs flex-1 min-w-[80px]"
                          >
                            <span className="truncate">{cat.name}</span>
                            <Badge variant="secondary" className="ml-1 h-4 text-[10px] px-1">
                              {count}
                            </Badge>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                    
                    {imageCategories.map(cat => {
                      const images = categoryImages.filter(img => img.category_id === cat.id);
                      return (
                        <TabsContent key={cat.id} value={cat.id.toString()} className="mt-3">
                          {images.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                              {images.map(image => (
                                <button
                                  key={image.id}
                                  onClick={() => addImageElement(image.image_url, 'image')}
                                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-all bg-secondary"
                                >
                                  <img src={image.image_url} alt={image.name} className="w-full h-full object-contain p-1" />
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent text-white text-[10px] p-1 text-center">
                                    <div className="font-medium truncate">{image.name}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <p className="text-sm">Нет изображений в этой категории</p>
                            </div>
                          )}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                )}
                
                {imageCategories.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Image" size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">Нет категорий</p>
                    <p className="text-xs mt-1">Добавьте категории изображений через админ-панель</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="elements" className="space-y-3 mt-4">
            <div className="space-y-3 p-3 bg-secondary/20 rounded-lg">
              <Label className="font-semibold">ФИО с выбором шрифта</Label>
              <Input 
                placeholder="Фамилия" 
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
              <Input 
                placeholder="Имя" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input 
                placeholder="Отчество" 
                value={patronymic}
                onChange={(e) => setPatronymic(e.target.value)}
              />
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {fonts.map(font => (
                  <button
                    key={font.id}
                    onClick={() => setSelectedFont(font.id)}
                    className={`w-full text-left p-2 rounded border transition-all ${
                      selectedFont === font.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-xs text-muted-foreground">{font.name}</div>
                    <div 
                      className="text-base"
                      style={{ fontFamily: font.style, fontWeight: font.weight }}
                    >
                      {font.example}
                    </div>
                  </button>
                ))}
              </div>
              
              <Button 
                onClick={addFIOElement} 
                className="w-full"
                disabled={!surname && !name && !patronymic}
              >
                <Icon name="ArrowRight" size={18} className="mr-2" />
                ДОБАВИТЬ
              </Button>
            </div>
            
            <div className="space-y-3 p-3 bg-secondary/20 rounded-lg">
              <Label className="font-semibold">Даты жизни</Label>
              <Input 
                placeholder="Дата рождения (01.01.1950)" 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              <Input 
                placeholder="Дата смерти (01.01.2020)" 
                value={deathDate}
                onChange={(e) => setDeathDate(e.target.value)}
              />
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {fonts.map(font => (
                  <button
                    key={font.id}
                    onClick={() => setSelectedDateFont(font.id)}
                    className={`w-full text-left p-2 rounded border transition-all ${
                      selectedDateFont === font.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-xs text-muted-foreground">{font.name}</div>
                    <div 
                      className="text-base"
                      style={{ fontFamily: font.style, fontWeight: font.weight }}
                    >
                      01.01.1950 — 01.01.2020
                    </div>
                  </button>
                ))}
              </div>
              
              <Button 
                onClick={addDatesElement} 
                className="w-full"
                disabled={!birthDate && !deathDate}
              >
                <Icon name="Calendar" size={18} className="mr-2" />
                ДОБАВИТЬ ДАТЫ
              </Button>
            </div>
            
            <div className="space-y-2 p-3 bg-secondary/20 rounded-lg">
              <Label className="font-semibold">Портреты</Label>
              <Tabs defaultValue="male" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="male">Мужские</TabsTrigger>
                  <TabsTrigger value="female">Женские</TabsTrigger>
                </TabsList>
                
                <TabsContent value="male" className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addImageElement('https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/25b06347-b759-4c5a-9e64-0752f27ac98d.jpg', 'image')}
                      className="relative overflow-hidden rounded border-2 border-border hover:border-primary transition-all aspect-[3/4] bg-black"
                    >
                      <img 
                        src="https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/25b06347-b759-4c5a-9e64-0752f27ac98d.jpg" 
                        alt="Мужской портрет"
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <button
                      onClick={() => addImageElement('https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/363f8d87-38cc-4670-905e-4e0c3e70f7d5.jpg', 'image')}
                      className="relative overflow-hidden rounded border-2 border-border hover:border-primary transition-all aspect-[3/4] bg-black"
                    >
                      <img 
                        src="https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/363f8d87-38cc-4670-905e-4e0c3e70f7d5.jpg" 
                        alt="Мужской портрет контур"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  </div>
                </TabsContent>
                
                <TabsContent value="female" className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addImageElement('https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/e1a552a7-32c5-4385-99b6-143f6b05e8b7.jpg', 'image')}
                      className="relative overflow-hidden rounded border-2 border-border hover:border-primary transition-all aspect-[3/4] bg-black"
                    >
                      <img 
                        src="https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/e1a552a7-32c5-4385-99b6-143f6b05e8b7.jpg" 
                        alt="Женский портрет"
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <button
                      onClick={() => addImageElement('https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/81e2b99f-4600-4a07-8bd0-9387efad0f57.jpg', 'image')}
                      className="relative overflow-hidden rounded border-2 border-border hover:border-primary transition-all aspect-[3/4] bg-black"
                    >
                      <img 
                        src="https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/81e2b99f-4600-4a07-8bd0-9387efad0f57.jpg" 
                        alt="Женский портрет контур"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  </div>
                </TabsContent>
              </Tabs>
              
              <input 
                ref={photoInputRef}
                type="file" 
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <Button 
                onClick={() => photoInputRef.current?.click()} 
                variant="outline" 
                className="w-full mt-3"
              >
                <Icon name="Upload" size={18} className="mr-2" />
                Загрузить свой портрет
              </Button>
            </div>
            
            <Button onClick={addTextElement} variant="outline" className="w-full justify-start">
              <Icon name="Type" size={18} className="mr-2" />
              Добавить текст
            </Button>
            
            <div className="space-y-2 p-3 bg-secondary/20 rounded-lg">
              <Label className="font-semibold">Готовые эпитафии</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {[
                  'Помним. Любим. Скорбим.',
                  'Ты всегда в нашей памяти.',
                  'Спасибо за все.',
                  'Вечная память о тебе в сердцах близких.',
                  'Покойся с миром в Царствии Небесном.',
                  'Вечная память.',
                  'Помним, скорбим…',
                  'Опустела без тебя земля.',
                  'Любим и помним.',
                  'Память сильнее смерти.',
                  'Рождение – не начало, смерть – не конец.',
                ].map((text, idx) => (
                  <button
                    key={idx}
                    onClick={() => addEpitaphElement(text)}
                    className="w-full text-left p-3 rounded border-2 border-border hover:border-primary transition-all bg-background hover:bg-primary/5"
                  >
                    <p className="text-sm italic text-muted-foreground">{text}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Выберите готовый текст или добавьте свой. После добавления можно отредактировать.
              </p>
            </div>
            
            <div className="space-y-2 p-3 bg-secondary/20 rounded-lg">
              <Label className="font-semibold">Кресты</Label>
              {isLoadingCrosses ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : crosses.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                  {crosses.map((cross) => (
                    <button 
                      key={cross.id}
                      onClick={() => addImageElement(cross.image_url, 'cross')} 
                      className="aspect-square rounded border-2 border-border hover:border-primary transition-all p-3 bg-background hover:bg-primary/5 flex flex-col"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <img src={cross.image_url} alt={cross.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="text-xs text-center mt-2 text-muted-foreground">{cross.name}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Кресты не найдены
                </p>
              )}
            </div>
            
            <div className="space-y-2 p-3 bg-secondary/20 rounded-lg">
              <Label className="font-semibold">Цветы</Label>
              {isLoadingFlowers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : flowers.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                  {flowers.map((flower) => (
                    <button 
                      key={flower.id}
                      onClick={() => addImageElement(flower.image_url, 'flower')} 
                      className="aspect-square rounded border-2 border-border hover:border-primary transition-all p-3 bg-background hover:bg-primary/5 flex flex-col"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <img src={flower.image_url} alt={flower.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="text-xs text-center mt-2 text-muted-foreground">{flower.name}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Цветы не найдены
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};