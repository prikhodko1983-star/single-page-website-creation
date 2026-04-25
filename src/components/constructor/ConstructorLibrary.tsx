import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  defaultTab?: string;
  monumentImage: string;
  setMonumentImage: (src: string) => void;
  addTextElement: (customText?: string, customFont?: string) => void;
  addEpitaphElement: (customText?: string) => void;
  addImageElement: (src: string, type: 'image' | 'cross' | 'flower') => void;
  addFIOElement: () => void;
  addDatesElement: (preset?: 'inline' | 'stacked' | 'offset') => void;
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

type DesktopToolPanel = 'fio' | 'dates' | 'epitaph' | 'text' | 'photo' | 'cross' | 'flower' | 'imageCatalog' | null;

const DESKTOP_TOOLS = [
  { key: 'fio' as DesktopToolPanel, icon: 'User', label: 'ФИО' },
  { key: 'dates' as DesktopToolPanel, icon: 'Calendar', label: 'Даты' },
  { key: 'epitaph' as DesktopToolPanel, icon: 'Quote', label: 'Эпитафия' },
  { key: 'text' as DesktopToolPanel, icon: 'Type', label: 'Текст' },
  { key: 'photo' as DesktopToolPanel, icon: 'Camera', label: 'Портрет' },
  { key: 'cross' as DesktopToolPanel, icon: 'Cross', label: 'Крест' },
  { key: 'imageCatalog' as DesktopToolPanel, icon: 'Images', label: 'Картинки' },
];

export const ConstructorLibrary = ({
  defaultTab = 'catalog',
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [activeToolPanel, setActiveToolPanel] = useState<DesktopToolPanel>(null);
  const [imageCategories, setImageCategories] = useState<Array<{id: number, name: string, slug: string}>>([]);
  const [categoryImages, setCategoryImages] = useState<Array<{id: number, category_id: number, name: string, image_url: string, category_name: string}>>([]);
  const [selectedImageCategory, setSelectedImageCategory] = useState<number | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customTextFont, setCustomTextFont] = useState('');

  const formatDateInput = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
  };

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    loadImageCategories();
  }, []);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

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
      const results = await Promise.all(
        categories.map(async (category) => {
          const response = await fetch(`https://functions.poehali.dev/dee0114f-9dc3-4783-87b7-346a133d7c73?type=images&category_id=${category.id}`);
          if (response.ok) return response.json();
          return [];
        })
      );
      setCategoryImages(results.flat());
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#181818', color: 'white' }}>
          <div className="hidden lg:block px-3 pt-3 pb-2 border-b border-white/10">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">Библиотека</p>
            <div className="grid grid-cols-3 bg-white/5 h-8 rounded-md p-0.5 gap-0.5">
              {(['catalog', 'images', 'elements'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs rounded transition-all font-medium ${
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {tab === 'catalog' ? 'Каталог' : tab === 'images' ? 'Изображения' : 'Элементы'}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ display: activeTab === 'catalog' ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', padding: '8px 12px 16px' }}>
            <Label className="shrink-0 mb-2">Памятники из каталога магазина</Label>
            
            {isLoadingCatalog ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {catalogCategories.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    {/* Кнопки категорий */}
                    <div className="flex flex-wrap gap-1 shrink-0 mb-3 bg-white/5 rounded-lg p-1">
                      {catalogCategories.map(cat => {
                        const count = catalogProducts.filter(p => p.category_id === cat.id && p.image_url).length;
                        const isActive = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex-1 min-w-[100px] px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-white/50 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <span className="truncate">{cat.name}</span>
                            <Badge variant="secondary" className="ml-1 h-4 text-[10px] px-1 shrink-0">
                              {count}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Сетка памятников — прокручивается */}
                    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                      {(() => {
                        const categoryProducts = catalogProducts.filter(p => p.category_id === selectedCategory && p.image_url);
                        return categoryProducts.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 pb-2">
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
                        );
                      })()}
                    </div>
                  </div>
                )}
                
                {catalogCategories.length === 0 && catalogProducts.length === 0 && !isLoadingCatalog && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Package" size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">Каталог пуст</p>
                    <p className="text-xs mt-1">Добавьте памятники в магазин через админ-панель</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: activeTab === 'images' ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', padding: '8px 16px 16px' }}>
            <Label className="shrink-0 mb-2">Изображения по категориям</Label>
            {isLoadingImages ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : imageCategories.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <div className="flex flex-wrap gap-1 shrink-0 mb-2 bg-white/5 rounded-lg p-1">
                  {imageCategories.map(cat => {
                    const count = categoryImages.filter(img => img.category_id === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedImageCategory(cat.id)}
                        className={`flex-1 min-w-[80px] px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                          selectedImageCategory === cat.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-white/50 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <Badge variant="secondary" className="ml-1 h-4 text-[10px] px-1 shrink-0">{count}</Badge>
                      </button>
                    );
                  })}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                  {(() => {
                    const images = categoryImages.filter(img => img.category_id === selectedImageCategory);
                    return images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 pb-2">
                        {images.map(image => (
                          <button key={image.id} onClick={() => addImageElement(image.image_url, 'image')}
                            className="relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-all bg-secondary">
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
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Image" size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">Нет категорий</p>
              </div>
            )}
          </div>

          <div style={{ display: activeTab === 'elements' ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {/* Иконочная панель инструментов в стиле Фотошопа */}
            <div className="flex flex-1 min-h-0">
              {/* Вертикальная панель иконок */}
              <div className="flex flex-col items-center gap-1 py-2 bg-[#141414] border-r border-white/10 shrink-0" style={{ width: '52px' }}>
                {DESKTOP_TOOLS.map((tool) => (
                  <button
                    key={tool.key}
                    onClick={() => setActiveToolPanel(prev => prev === tool.key ? null : tool.key)}
                    className={`w-10 h-10 flex flex-col items-center justify-center rounded transition-colors gap-0.5 ${
                      activeToolPanel === tool.key
                        ? 'bg-primary text-primary-foreground'
                        : 'text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                    title={tool.label}
                  >
                    {tool.key === 'cross' ? (
                      <svg width="17" height="17" viewBox="0 0 90 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                        {/* Вертикальная стойка */}
                        <rect x="38" y="0" width="14" height="160" fill="currentColor"/>
                        {/* Верхняя перекладина (квадратная, короткая) */}
                        <rect x="28" y="8" width="34" height="14" fill="currentColor"/>
                        {/* Средняя длинная перекладина */}
                        <rect x="0" y="44" width="90" height="14" fill="currentColor"/>
                        {/* Нижняя косая: левый конец выше, правый ниже, с выступами */}
                        <polygon points="10,98 10,112 38,118 38,106" fill="currentColor"/>
                        <polygon points="52,106 52,118 80,112 80,98" fill="currentColor"/>
                      </svg>
                    ) : (
                      <Icon name={tool.icon as Parameters<typeof Icon>[0]['name']} size={17} />
                    )}
                    <span className="text-[7px] leading-none">{tool.label}</span>
                  </button>
                ))}
              </div>

              {/* Панель содержимого инструмента */}
              <div className="flex-1 overflow-y-auto min-h-0 bg-[#181818]">
                {!activeToolPanel && (
                  <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2 p-4 text-center">
                    <Icon name="MousePointer2" size={32} />
                    <p className="text-xs">Выберите инструмент</p>
                  </div>
                )}

                {/* ФИО */}
                {activeToolPanel === 'fio' && (
                  <div className="p-3 space-y-2">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">ФИО</p>
                    {/* Превью ФИО */}
                    {(() => {
                      const f = fonts.find(f => f.id === selectedFont);
                      const lines = [surname, name, patronymic].filter(Boolean);
                      const preview = lines.length > 0 ? lines : ['Фамилия', 'Имя', 'Отчество'];
                      return (
                        <div className="rounded-lg bg-black/40 border border-white/10 flex flex-col items-center justify-center py-3 px-4 min-h-[64px]">
                          {preview.map((line, i) => (
                            <span
                              key={i}
                              className="text-white text-sm text-center leading-tight"
                              style={{ fontFamily: f?.style, fontWeight: f?.weight, opacity: lines.length === 0 ? 0.3 : 1 }}
                            >
                              {line}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                    <Input placeholder="Фамилия" value={surname} onChange={(e) => setSurname(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-8 text-xs" />
                    <Input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-8 text-xs" />
                    <Input placeholder="Отчество" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-8 text-xs" />
                    <p className="text-[10px] text-white/40 pt-1">Шрифт</p>
                    <div className="grid grid-cols-2 gap-1">
                      {fonts.map(font => (
                        <button key={font.id} onClick={() => setSelectedFont(font.id)}
                          className={`px-2 py-1.5 rounded border text-left transition-all ${selectedFont === font.id ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-primary/50 text-white/70'}`}>
                          <div className="text-[9px] text-white/40 truncate">{font.name}</div>
                          <div className="text-xs truncate" style={{ fontFamily: font.style, fontWeight: font.weight }}>{font.example.slice(0, 8)}</div>
                        </button>
                      ))}
                    </div>
                    <Button className="w-full h-8 text-xs mt-1" onClick={() => { addFIOElement(); }} disabled={!surname && !name && !patronymic}>
                      <Icon name="Plus" size={14} className="mr-1" /> Добавить ФИО
                    </Button>
                  </div>
                )}

                {/* Даты */}
                {activeToolPanel === 'dates' && (
                  <div className="p-3 space-y-2">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Даты жизни</p>

                    {/* Превью дат */}
                    {(() => {
                      const f = fonts.find(f => f.id === selectedDateFont);
                      const b = birthDate || '1950';
                      const d = deathDate || '2024';
                      const isEmpty = !birthDate && !deathDate;
                      return (
                        <div className="rounded-lg bg-black/40 border border-white/10 flex items-center justify-center py-3 px-4">
                          <span
                            className="text-white text-lg text-center whitespace-pre"
                            style={{ fontFamily: f?.style, fontWeight: f?.weight, opacity: isEmpty ? 0.3 : 1 }}
                          >
                            {`${b} – ${d}`}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Пресеты расположения */}
                    <p className="text-[10px] text-white/40 pt-1">Расположение</p>
                    {(() => {
                      const f = fonts.find(f => f.id === selectedDateFont);
                      const b = birthDate || '1950';
                      const d = deathDate || '2024';
                      const disabled = !birthDate && !deathDate;
                      const presets: Array<{ key: 'inline' | 'stacked' | 'offset'; label: string; preview: string; align: 'center' | 'left' }> = [
                        { key: 'inline', label: 'В строку', preview: `${b} – ${d}`, align: 'center' },
                        { key: 'stacked', label: 'Столбцом', preview: `${b}\n${d}`, align: 'center' },
                        { key: 'offset', label: 'Со сдвигом', preview: `${b}\n      ${d}`, align: 'left' },
                      ];
                      return (
                        <div className="grid grid-cols-3 gap-2">
                          {presets.map(p => (
                            <button
                              key={p.key}
                              disabled={disabled}
                              onClick={() => addDatesElement(p.key)}
                              className="flex flex-col items-center gap-2 p-2 rounded-lg border border-white/10 hover:border-primary/70 hover:bg-primary/10 transition-all disabled:opacity-30 disabled:cursor-default group"
                            >
                              <div
                                className="bg-black/60 rounded-md w-full flex items-center justify-center py-3 px-2 min-h-[52px]"
                              >
                                <span
                                  className="text-white leading-snug whitespace-pre"
                                  style={{
                                    fontFamily: f?.style,
                                    fontWeight: f?.weight,
                                    fontSize: p.key === 'inline' ? '10px' : '11px',
                                    textAlign: p.align,
                                    display: 'block',
                                    width: '100%',
                                  }}
                                >
                                  {p.preview}
                                </span>
                              </div>
                              <span className="text-[10px] text-white/50 group-hover:text-white/80 text-center leading-tight transition-colors">{p.label}</span>
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                    <div className="space-y-1">
                      <Label className="text-[10px] text-white/40">Дата рождения</Label>
                      <Input placeholder="01.01.1950" value={birthDate} inputMode="numeric" maxLength={10} onChange={(e) => setBirthDate(formatDateInput(e.target.value))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-8 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-white/40">Дата смерти</Label>
                      <Input placeholder="01.01.2020" value={deathDate} inputMode="numeric" maxLength={10} onChange={(e) => setDeathDate(formatDateInput(e.target.value))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-8 text-xs" />
                    </div>

                    <p className="text-[10px] text-white/40 pt-1">Шрифт</p>
                    <div className="grid grid-cols-2 gap-1">
                      {fonts.map(font => (
                        <button key={font.id} onClick={() => setSelectedDateFont(font.id)}
                          className={`px-2 py-1.5 rounded border text-left transition-all ${selectedDateFont === font.id ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-primary/50 text-white/70'}`}>
                          <div className="text-[9px] text-white/40 truncate">{font.name}</div>
                          <div className="text-xs truncate" style={{ fontFamily: font.style, fontWeight: font.weight }}>01.01—01.01</div>
                        </button>
                      ))}
                    </div>

                    <Button className="w-full h-8 text-xs mt-1" onClick={() => addDatesElement('inline')} disabled={!birthDate && !deathDate}>
                      <Icon name="Calendar" size={14} className="mr-1" /> Добавить даты
                    </Button>
                  </div>
                )}

                {/* Эпитафия */}
                {activeToolPanel === 'epitaph' && (
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Эпитафии</p>
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
                      <button key={idx} onClick={() => addEpitaphElement(text)}
                        className="w-full text-left px-2 py-2 rounded border border-white/10 hover:border-primary transition-all bg-white/5 hover:bg-primary/10">
                        <p className="text-xs italic text-white/70">{text}</p>
                      </button>
                    ))}
                    <p className="text-[10px] text-white/30 pt-1">После добавления можно отредактировать</p>
                  </div>
                )}

                {/* Текст */}
                {activeToolPanel === 'text' && (
                  <div className="p-3 space-y-3">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Текст</p>
                    <textarea
                      placeholder="Введите текст..."
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded text-white placeholder:text-white/30 text-sm p-2 resize-none focus:outline-none focus:border-primary"
                    />
                    <p className="text-[10px] text-white/40">Шрифт</p>
                    <div className="grid grid-cols-2 gap-1">
                      {fonts.map(font => (
                        <button key={font.id} onClick={() => setCustomTextFont(font.fullStyle)}
                          className={`px-2 py-1.5 rounded border text-left transition-all ${customTextFont === font.fullStyle ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-primary/50 text-white/70'}`}>
                          <div className="text-[9px] text-white/40 truncate">{font.name}</div>
                          <div className="text-xs truncate" style={{ fontFamily: font.style, fontWeight: font.weight }}>{font.example.slice(0, 8)}</div>
                        </button>
                      ))}
                    </div>
                    <Button className="w-full h-8 text-xs" onClick={() => {
                      addTextElement(customText || undefined, customTextFont || undefined);
                      setCustomText('');
                      setCustomTextFont('');
                    }}>
                      <Icon name="Plus" size={14} className="mr-1" /> Добавить текст
                    </Button>
                  </div>
                )}

                {/* Портрет */}
                {activeToolPanel === 'photo' && (
                  <div className="p-3 space-y-2">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Портреты</p>
                    <Tabs defaultValue="female" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 h-7 bg-white/5">
                        <TabsTrigger value="male" className="text-xs">Мужские</TabsTrigger>
                        <TabsTrigger value="female" className="text-xs">Женские</TabsTrigger>
                      </TabsList>
                      <TabsContent value="male" className="mt-2">
                        <div className="grid grid-cols-2 gap-1.5">
                          <button onClick={() => addImageElement('https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/5be3255b-1f30-4759-8daf-1c364342e4e7.jpg', 'image')}
                            className="relative overflow-hidden rounded border-2 border-white/10 hover:border-primary transition-all aspect-[3/4] bg-black">
                            <img src="https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/5be3255b-1f30-4759-8daf-1c364342e4e7.jpg" alt="Мужской портрет" className="w-full h-full object-cover" />
                          </button>
                          <button onClick={() => addImageElement('https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/1a839d6b-b217-4729-bfc9-58961b033575.jpg', 'image')}
                            className="relative overflow-hidden rounded border-2 border-white/10 hover:border-primary transition-all aspect-[3/4] bg-black">
                            <img src="https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/1a839d6b-b217-4729-bfc9-58961b033575.jpg" alt="Мужской портрет контур" className="w-full h-full object-cover" />
                          </button>
                        </div>
                      </TabsContent>
                      <TabsContent value="female" className="mt-2">
                        <div className="grid grid-cols-2 gap-1.5">
                          <button onClick={() => addImageElement('https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/e1a552a7-32c5-4385-99b6-143f6b05e8b7.jpg', 'image')}
                            className="relative overflow-hidden rounded border-2 border-white/10 hover:border-primary transition-all aspect-[3/4] bg-black">
                            <img src="https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/e1a552a7-32c5-4385-99b6-143f6b05e8b7.jpg" alt="Женский портрет" className="w-full h-full object-cover" />
                          </button>
                          <button onClick={() => addImageElement('https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/81e2b99f-4600-4a07-8bd0-9387efad0f57.jpg', 'image')}
                            className="relative overflow-hidden rounded border-2 border-white/10 hover:border-primary transition-all aspect-[3/4] bg-black">
                            <img src="https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/81e2b99f-4600-4a07-8bd0-9387efad0f57.jpg" alt="Женский портрет контур" className="w-full h-full object-cover" />
                          </button>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                    <Button onClick={() => photoInputRef.current?.click()} className="w-full h-8 text-xs mt-2">
                      <Icon name="Upload" size={14} className="mr-1" /> Загрузить свой портрет
                    </Button>
                    <div className="mt-1 p-2 bg-white/5 rounded text-[10px] text-white/30">
                      <Icon name="Info" size={10} className="inline mr-1" />
                      Или <button onClick={() => { navigate('/'); setTimeout(() => document.getElementById('retouch')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-primary hover:underline">закажите ретушь</button> у профессионалов.
                    </div>
                  </div>
                )}

                {/* Крест */}
                {activeToolPanel === 'cross' && (
                  <div className="p-3 space-y-2">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Кресты</p>
                    {isLoadingCrosses ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                      </div>
                    ) : crosses.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        {crosses.map((cross) => (
                          <button key={cross.id} onClick={() => addImageElement(cross.image_url, 'cross')}
                            className="aspect-square rounded border border-white/10 hover:border-primary transition-all p-2 bg-white/5 hover:bg-primary/10 flex flex-col">
                            <div className="flex-1 flex items-center justify-center">
                              <img src={cross.image_url} alt={cross.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="text-[9px] text-center mt-1 text-white/40 truncate">{cross.name}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-white/30 text-center py-4">Кресты не найдены</p>
                    )}
                  </div>
                )}

                {/* Цветок */}
                {activeToolPanel === 'flower' && (
                  <div className="p-3 space-y-2">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Цветы</p>
                    {isLoadingFlowers ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                      </div>
                    ) : flowers.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        {flowers.map((flower) => (
                          <button key={flower.id} onClick={() => addImageElement(flower.image_url, 'flower')}
                            className="aspect-square rounded border border-white/10 hover:border-primary transition-all p-2 bg-white/5 hover:bg-primary/10 flex flex-col">
                            <div className="flex-1 flex items-center justify-center">
                              <img src={flower.image_url} alt={flower.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="text-[9px] text-center mt-1 text-white/40 truncate">{flower.name}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-white/30 text-center py-4">Цветы не найдены</p>
                    )}
                  </div>
                )}

                {/* Каталог изображений */}
                {activeToolPanel === 'imageCatalog' && (
                  <div className="p-3 space-y-2">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Каталог изображений</p>
                    {isLoadingImages ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      </div>
                    ) : imageCategories.length > 0 ? (
                      <>
                        <div className="grid grid-cols-3 gap-1 bg-white/5 rounded-lg p-1 shrink-0">
                          {imageCategories.map(cat => {
                            const count = categoryImages.filter(img => img.category_id === cat.id).length;
                            return (
                              <button
                                key={cat.id}
                                onClick={() => setSelectedImageCategory(cat.id)}
                                className={`px-1.5 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 w-full ${
                                  selectedImageCategory === cat.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-white/50 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                <span className="truncate">{cat.name}</span>
                                <span className="shrink-0 bg-white/20 rounded-full text-[10px] px-1 leading-4">{count}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pb-2">
                          {categoryImages.filter(img => img.category_id === selectedImageCategory).map(image => (
                            <button
                              key={image.id}
                              onClick={() => addImageElement(image.image_url, 'image')}
                              className="rounded border-2 border-white/10 hover:border-primary transition-all bg-black/40 hover:bg-primary/5 overflow-hidden flex flex-col"
                            >
                              <div className="flex items-center justify-center p-2" style={{ height: '90px' }}>
                                <img src={image.image_url} alt={image.name} className="max-w-full max-h-full object-contain" />
                              </div>
                              <div className="bg-black/60 text-white text-[9px] px-1 py-1 text-center truncate w-full">
                                {image.name}
                              </div>
                            </button>
                          ))}
                          {categoryImages.filter(img => img.category_id === selectedImageCategory).length === 0 && (
                            <p className="col-span-2 text-xs text-white/40 text-center py-6">Нет изображений</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-white/30 text-center py-4">Категории не найдены</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
    </div>
  );
};