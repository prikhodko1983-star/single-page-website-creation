import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toPng } from 'html-to-image';


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
}

const Constructor = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [savedDesigns, setSavedDesigns] = useState<Array<{monumentImage: string, elements: CanvasElement[], timestamp: number}>>([]);
  
  const [monumentImage, setMonumentImage] = useState<string>('https://cdn.poehali.dev/files/692de6e1-c8ae-42f8-ac61-0d8770aeb8ec.png');
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, fontSize: 0 });
  const [imageError, setImageError] = useState(false);
  
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [selectedFont, setSelectedFont] = useState('font1');
  
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [selectedDateFont, setSelectedDateFont] = useState('font1');
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Загружаем сохраненные дизайны при монтировании
  const loadSavedDesigns = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('monumentDesigns') || '[]');
      setSavedDesigns(saved);
    } catch (error) {
      console.error('Error loading saved designs:', error);
    }
  };

  const loadDesign = (index: number) => {
    const design = savedDesigns[index];
    if (design) {
      setMonumentImage(design.monumentImage);
      setElements(design.elements);
      toast({
        title: "Дизайн загружен",
        description: "Проект восстановлен из сохраненных",
      });
    }
  };

  const deleteDesign = (index: number) => {
    const updated = savedDesigns.filter((_, i) => i !== index);
    setSavedDesigns(updated);
    localStorage.setItem('monumentDesigns', JSON.stringify(updated));
    toast({
      title: "Дизайн удален",
      description: "Сохраненный проект удален",
    });
  };

  const monumentImages = [
    { id: '1', src: 'https://cdn.poehali.dev/files/692de6e1-c8ae-42f8-ac61-0d8770aeb8ec.png', name: 'Вертикальный' },
    { id: '2', src: 'https://cdn.poehali.dev/files/c80c1bd4-c413-425a-a1fc-91dbb36a8de4.jpg', name: 'Горизонтальный' },
    { id: '3', src: 'https://cdn.poehali.dev/files/a6e29eb2-0f18-47ca-917e-adac360db4c3.jpeg', name: 'Эксклюзивный' },
  ];

  const fonts = [
    { id: 'font1', name: '№ 1/1а', style: 'Playfair Display', weight: '400', example: 'Фамилия Имя Отчество', fullStyle: 'Playfair Display|400' },
    { id: 'font2', name: '№ 2/2а', style: 'Playfair Display', weight: '700', example: 'Фамилия Имя Отчество', fullStyle: 'Playfair Display|700' },
    { id: 'font3', name: '№ 3', style: 'Cormorant Garamond', weight: '400', example: 'Фамилия Имя Отчество', fullStyle: 'Cormorant Garamond|400' },
    { id: 'font4', name: '№ 4', style: 'Cormorant Garamond', weight: '700', example: 'Фамилия Имя Отчество', fullStyle: 'Cormorant Garamond|700' },
    { id: 'font5', name: '№ 3а', style: 'EB Garamond', weight: '400', example: 'Фамилия Имя Отчество', fullStyle: 'EB Garamond|400' },
    { id: 'font6', name: 'Иск 1/1а', style: 'Dancing Script', weight: '400', example: 'Фамилия Имя Отчество', fullStyle: 'Dancing Script|400' },
    { id: 'font7', name: 'Иск 2/2а', style: 'Great Vibes', weight: '400', example: 'Фамилия Имя Отчество', fullStyle: 'Great Vibes|400' },
    { id: 'font8', name: 'Иск 3/3а', style: 'Allura', weight: '400', example: 'Фамилия Имя Отчество', fullStyle: 'Allura|400' },
    { id: 'font9', name: '№ Cinzel', style: 'Cinzel', weight: '700', example: 'Фамилия Имя Отчество', fullStyle: 'Cinzel|700' },
  ];

  const addTextElement = () => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: 'text',
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      content: 'Текст',
      fontSize: 24,
      color: '#FFFFFF',
      rotation: 0,
    };
    setElements([...elements, newElement]);
  };

  const addImageElement = (src: string, type: 'image' | 'cross' | 'flower') => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      src,
      rotation: 0,
    };
    setElements([...elements, newElement]);
  };

  const addEpitaphElement = () => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: 'epitaph',
      x: 50,
      y: 200,
      width: 300,
      height: 100,
      content: 'Вечная память',
      fontSize: 18,
      color: '#FFFFFF',
      rotation: 0,
    };
    setElements([...elements, newElement]);
  };

  const addFIOElement = () => {
    if (!surname && !name && !patronymic) return;
    
    const fioText = `${surname}\n${name}\n${patronymic}`.trim();
    const selectedFontData = fonts.find(f => f.id === selectedFont);
    
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: 'fio',
      x: 100,
      y: 100,
      width: 300,
      height: 120,
      content: fioText,
      fontSize: 28,
      color: '#FFFFFF',
      rotation: 0,
      fontFamily: selectedFontData?.fullStyle || 'serif',
    };
    setElements([...elements, newElement]);
    
    setSurname('');
    setName('');
    setPatronymic('');
  };

  const addDatesElement = () => {
    if (!birthDate && !deathDate) return;
    
    const datesText = `${birthDate} — ${deathDate}`.trim();
    const selectedFontData = fonts.find(f => f.id === selectedDateFont);
    
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: 'dates',
      x: 100,
      y: 250,
      width: 250,
      height: 40,
      content: datesText,
      fontSize: 20,
      color: '#FFFFFF',
      rotation: 0,
      fontFamily: selectedFontData?.fullStyle || 'serif',
    };
    setElements([...elements, newElement]);
    
    setBirthDate('');
    setDeathDate('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const photoUrl = event.target?.result as string;
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: 'photo',
        x: 100,
        y: 50,
        width: 150,
        height: 200,
        src: photoUrl,
        rotation: 0,
      };
      setElements([...elements, newElement]);
    };
    reader.readAsDataURL(file);
    
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleTouchStart = (e: React.TouchEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    const touch = e.touches[0];
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !selectedElement) return;
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = Math.max(30, resizeStart.height + deltaY);
      
      const element = elements.find(el => el.id === selectedElement);
      if (element && (element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates')) {
        const scaleRatio = Math.max(newWidth / resizeStart.width, newHeight / resizeStart.height);
        const newFontSize = Math.max(12, Math.min(72, Math.round(resizeStart.fontSize * scaleRatio)));
        
        setElements(elements.map(el => 
          el.id === selectedElement 
            ? { ...el, width: newWidth, height: newHeight, fontSize: newFontSize }
            : el
        ));
      } else {
        setElements(elements.map(el => 
          el.id === selectedElement 
            ? { ...el, width: newWidth, height: newHeight }
            : el
        ));
      }
    } else if (isDragging) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;
      
      setElements(elements.map(el => 
        el.id === selectedElement 
          ? { ...el, x: Math.max(0, Math.min(newX, canvasRect.width - el.width)), 
                    y: Math.max(0, Math.min(newY, canvasRect.height - el.height)) }
          : el
      ));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!canvasRef.current || !selectedElement) return;
    
    const touch = e.touches[0];
    
    if (isResizing) {
      const deltaX = touch.clientX - resizeStart.x;
      const deltaY = touch.clientY - resizeStart.y;
      const newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = Math.max(30, resizeStart.height + deltaY);
      
      const element = elements.find(el => el.id === selectedElement);
      if (element && (element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates')) {
        const scaleRatio = Math.max(newWidth / resizeStart.width, newHeight / resizeStart.height);
        const newFontSize = Math.max(12, Math.min(72, Math.round(resizeStart.fontSize * scaleRatio)));
        
        setElements(elements.map(el => 
          el.id === selectedElement 
            ? { ...el, width: newWidth, height: newHeight, fontSize: newFontSize }
            : el
        ));
      } else {
        setElements(elements.map(el => 
          el.id === selectedElement 
            ? { ...el, width: newWidth, height: newHeight }
            : el
        ));
      }
    } else if (isDragging) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = touch.clientX - canvasRect.left - dragOffset.x;
      const newY = touch.clientY - canvasRect.top - dragOffset.y;
      
      setElements(elements.map(el => 
        el.id === selectedElement 
          ? { ...el, x: Math.max(0, Math.min(newX, canvasRect.width - el.width)), 
                    y: Math.max(0, Math.min(newY, canvasRect.height - el.height)) }
          : el
      ));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element || !canvasRef.current) return;
    
    setSelectedElement(elementId);
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
      fontSize: element.fontSize || 24,
    });
  };

  const handleResizeTouchStart = (e: React.TouchEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element || !canvasRef.current) return;
    
    const touch = e.touches[0];
    setSelectedElement(elementId);
    setIsResizing(true);
    setResizeStart({
      x: touch.clientX,
      y: touch.clientY,
      width: element.width,
      height: element.height,
      fontSize: element.fontSize || 24,
    });
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  const saveDesign = () => {
    if (elements.length === 0) {
      toast({
        title: "Пустой дизайн",
        description: "Добавьте элементы на памятник",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const designData = {
        monumentImage,
        elements,
        timestamp: Date.now(),
      };
      
      // Сохраняем в localStorage
      const saved = JSON.parse(localStorage.getItem('monumentDesigns') || '[]');
      saved.push(designData);
      localStorage.setItem('monumentDesigns', JSON.stringify(saved));
      setSavedDesigns(saved);
      
      toast({
        title: "Дизайн сохранен",
        description: "Проект сохранен в браузере",
      });
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить дизайн",
        variant: "destructive",
      });
    }
  };

  const sendForCalculation = async () => {
    if (elements.length === 0) {
      toast({
        title: "Пустой дизайн",
        description: "Добавьте элементы на памятник перед отправкой",
        variant: "destructive",
      });
      return;
    }

    if (!canvasRef.current) {
      toast({
        title: "Ошибка",
        description: "Холст недоступен",
        variant: "destructive",
      });
      return;
    }

    // Запрашиваем имя и телефон
    const name = prompt('Введите ваше имя:');
    if (!name) return;
    
    const phone = prompt('Введите ваш телефон:');
    if (!phone) return;

    toast({
      title: "Создаем изображение...",
      description: "Подождите, идет подготовка дизайна",
    });

    try {
      // Создаем скриншот холста
      const dataUrl = await toPng(canvasRef.current, {
        quality: 0.95,
        backgroundColor: '#1a1a1a',
      });

      // Конвертируем dataURL в Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `monument-design-${Date.now()}.png`, { type: 'image/png' });

      // Формируем описание дизайна
      const monumentName = monumentImages.find(m => m.src === monumentImage)?.name || 'Памятник';
      
      let comment = `🪦 ДИЗАЙН ПАМЯТНИКА\n\n`;
      comment += `Основа: ${monumentName}\n`;
      comment += `Элементов: ${elements.length}\n\n`;
      
      const textElements = elements.filter(el => el.type === 'fio' || el.type === 'text' || el.type === 'dates' || el.type === 'epitaph');
      if (textElements.length > 0) {
        comment += `ТЕКСТ:\n`;
        textElements.forEach(el => {
          if (el.content) {
            comment += `• ${el.content.replace(/\n/g, ' ')}\n`;
          }
        });
      }
      
      const photoCount = elements.filter(el => el.type === 'photo').length;
      if (photoCount > 0) comment += `\nФотографий: ${photoCount}`;

      // Отправляем на сервер
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('comment', comment);
      formData.append('photo', file);

      const submitResponse = await fetch('https://functions.poehali.dev/8fc1d3aa-d848-4664-99c3-7ad60233aa64', {
        method: 'POST',
        body: formData,
      });

      const result = await submitResponse.json();

      if (submitResponse.ok && result.success) {
        toast({
          title: "Заявка отправлена!",
          description: "Мы свяжемся с вами в течение 30 минут",
        });
      } else {
        toast({
          title: "Ошибка отправки",
          description: result.error || "Попробуйте позже",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Send error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заявку",
        variant: "destructive",
      });
    }
  };

  const selectedEl = elements.find(el => el.id === selectedElement);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
              >
                <Icon name="ArrowLeft" size={20} className="mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="font-oswald font-bold text-xl text-primary">КОНСТРУКТОР ПАМЯТНИКА</h1>
                <p className="text-xs text-muted-foreground">Создайте уникальный дизайн</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[320px,1fr,320px] gap-6">
          {/* Левая панель - Библиотека */}
          <Card className="h-fit">
            <CardContent className="p-4">
              <h2 className="font-oswald font-bold text-lg mb-4">Библиотека элементов</h2>
              
              <Tabs defaultValue="monuments" className="w-full" onValueChange={(value) => {
                if (value === 'saved') loadSavedDesigns();
              }}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="monuments">Основа</TabsTrigger>
                  <TabsTrigger value="elements">Элементы</TabsTrigger>
                  <TabsTrigger value="saved">Сохр.</TabsTrigger>
                </TabsList>
                
                <TabsContent value="monuments" className="space-y-3 mt-4">
                  <Label>Выберите памятник</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {monumentImages.map(img => (
                      <button
                        key={img.id}
                        onClick={() => {
                          setMonumentImage(img.src);
                          setImageError(false);
                        }}
                        className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                          monumentImage === img.src ? 'border-primary' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                          {img.name}
                        </div>
                      </button>
                    ))}
                  </div>
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
                  
                  <div className="space-y-2">
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
                      variant="default" 
                      className="w-full justify-start bg-primary"
                    >
                      <Icon name="Image" size={18} className="mr-2" />
                      Добавить фотографию
                    </Button>
                  </div>
                  
                  <Button onClick={addTextElement} variant="outline" className="w-full justify-start">
                    <Icon name="Type" size={18} className="mr-2" />
                    Добавить текст
                  </Button>
                  
                  <Button onClick={addEpitaphElement} variant="outline" className="w-full justify-start">
                    <Icon name="FileText" size={18} className="mr-2" />
                    Добавить эпитафию
                  </Button>
                  
                  <Button 
                    onClick={() => addImageElement('https://cdn.poehali.dev/files/cross-icon.png', 'cross')} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить крест
                  </Button>
                  
                  <Button 
                    onClick={() => addImageElement('https://cdn.poehali.dev/files/flower-icon.png', 'flower')} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Icon name="Flower" size={18} className="mr-2" />
                    Добавить цветы
                  </Button>
                </TabsContent>
                
                <TabsContent value="saved" className="space-y-3 mt-4">
                  <Label>Сохраненные дизайны ({savedDesigns.length})</Label>
                  {savedDesigns.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Нет сохраненных дизайнов
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {savedDesigns.map((design, index) => (
                        <div 
                          key={index}
                          className="border border-border rounded-lg p-3 space-y-2"
                        >
                          <div className="text-xs text-muted-foreground">
                            {new Date(design.timestamp).toLocaleString('ru')}
                          </div>
                          <div className="text-sm">
                            Элементов: {design.elements.length}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => loadDesign(index)}
                            >
                              <Icon name="Download" size={16} className="mr-1" />
                              Загрузить
                            </Button>
                            <Button 
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteDesign(index)}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Центр - Холст */}
          <div className="flex flex-col items-center">
            <div 
              ref={canvasRef}
              className="relative w-full max-w-2xl aspect-[3/4] bg-secondary rounded-lg overflow-hidden shadow-2xl border-4 border-border touch-none"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {imageError ? (
                <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                  <div className="text-center p-4">
                    <Icon name="ImageOff" size={48} className="mx-auto mb-2" />
                    <p>Не удалось загрузить изображение памятника</p>
                    <p className="text-xs mt-2">Выберите другой памятник слева</p>
                  </div>
                </div>
              ) : (
                <img 
                  src={monumentImage} 
                  alt="Памятник" 
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={() => {
                    console.error('Failed to load monument image:', monumentImage);
                    setImageError(true);
                  }}
                  onLoad={() => setImageError(false)}
                />
              )}
              
              {elements.map(element => (
                <div
                  key={element.id}
                  className={`absolute cursor-move touch-none ${selectedElement === element.id ? 'ring-2 ring-primary' : ''}`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    transform: `rotate(${element.rotation || 0}deg)`,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                  onTouchStart={(e) => handleTouchStart(e, element.id)}
                >
                  {element.type === 'text' && (
                    <div 
                      className="w-full h-full flex items-center justify-center text-center select-none overflow-hidden"
                      style={{ 
                        fontSize: `${element.fontSize}px`, 
                        color: element.color,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        fontWeight: 'bold',
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                  
                  {element.type === 'epitaph' && (
                    <div 
                      className="w-full h-full flex items-center justify-center text-center select-none italic overflow-hidden"
                      style={{ 
                        fontSize: `${element.fontSize}px`, 
                        color: element.color,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                  
                  {element.type === 'fio' && (
                    <div 
                      className="w-full h-full flex items-center justify-center text-center select-none whitespace-pre-line overflow-hidden"
                      style={{ 
                        fontSize: `${element.fontSize}px`, 
                        color: element.color,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        fontFamily: element.fontFamily?.split('|')[0] || 'serif',
                        fontWeight: element.fontFamily?.split('|')[1] || '400',
                        lineHeight: 1.3,
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                  
                  {element.type === 'dates' && (
                    <div 
                      className="w-full h-full flex items-center justify-center text-center select-none overflow-hidden whitespace-nowrap"
                      style={{ 
                        fontSize: `${element.fontSize}px`, 
                        color: element.color,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        fontFamily: element.fontFamily?.split('|')[0] || 'serif',
                        fontWeight: element.fontFamily?.split('|')[1] || '400',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                  
                  {element.type === 'photo' && element.src && (
                    <img 
                      src={element.src} 
                      alt="Фотография"
                      className="w-full h-full object-cover select-none"
                      draggable={false}
                    />
                  )}
                  
                  {(element.type === 'image' || element.type === 'cross' || element.type === 'flower') && element.src && (
                    <img 
                      src={element.src} 
                      alt={element.type}
                      className="w-full h-full object-contain select-none"
                      draggable={false}
                    />
                  )}
                  
                  {selectedElement === element.id && (
                    <div 
                      className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary rounded-full cursor-nwse-resize hover:scale-110 transition-transform touch-none"
                      onMouseDown={(e) => handleResizeMouseDown(e, element.id)}
                      onTouchStart={(e) => handleResizeTouchStart(e, element.id)}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setElements([])}>
                <Icon name="Trash2" size={18} className="mr-2" />
                Очистить всё
              </Button>
              <Button 
                variant="outline" 
                onClick={saveDesign}
                disabled={elements.length === 0}
              >
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить дизайн
              </Button>
              <Button 
                onClick={sendForCalculation}
                disabled={elements.length === 0}
              >
                <Icon name="Send" size={18} className="mr-2" />
                Отправить на расчет
              </Button>
            </div>
          </div>

          {/* Правая панель - Свойства */}
          <Card className="h-fit">
            <CardContent className="p-4">
              <h2 className="font-oswald font-bold text-lg mb-4">Свойства элемента</h2>
              
              {!selectedEl && (
                <p className="text-sm text-muted-foreground">Выберите элемент для редактирования</p>
              )}
              
              {selectedEl && (
                <div className="space-y-4">
                  <div>
                    <Label>Тип: {selectedEl.type === 'text' ? 'Текст' : selectedEl.type === 'epitaph' ? 'Эпитафия' : selectedEl.type === 'fio' ? 'ФИО' : selectedEl.type === 'dates' ? 'Даты' : selectedEl.type === 'photo' ? 'Фотография' : 'Изображение'}</Label>
                  </div>
                  
                  {(selectedEl.type === 'text' || selectedEl.type === 'epitaph' || selectedEl.type === 'fio' || selectedEl.type === 'dates') && (
                    <>
                      <div>
                        <Label>Текст</Label>
                        <Input 
                          value={selectedEl.content || ''} 
                          onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Размер шрифта: {selectedEl.fontSize}px</Label>
                        <input 
                          type="range" 
                          min="12" 
                          max="72" 
                          value={selectedEl.fontSize || 24}
                          onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                          className="w-full mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Цвет</Label>
                        <input 
                          type="color" 
                          value={selectedEl.color || '#FFFFFF'}
                          onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                          className="w-full h-10 mt-1 rounded border"
                        />
                      </div>
                      
                      <div>
                        <Label>Шрифт</Label>
                        <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                          {fonts.map(font => (
                            <button
                              key={font.id}
                              onClick={() => updateElement(selectedEl.id, { fontFamily: font.fullStyle })}
                              className={`w-full text-left p-2 rounded border transition-all ${
                                selectedEl.fontFamily === font.fullStyle ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="text-xs text-muted-foreground">{font.name}</div>
                              <div 
                                className="text-sm"
                                style={{ fontFamily: font.style, fontWeight: font.weight }}
                              >
                                {font.example}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <Label>Ширина: {selectedEl.width}px</Label>
                    <input 
                      type="range" 
                      min="50" 
                      max="500" 
                      value={selectedEl.width}
                      onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) })}
                      className="w-full mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Высота: {selectedEl.height}px</Label>
                    <input 
                      type="range" 
                      min="30" 
                      max="400" 
                      value={selectedEl.height}
                      onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) })}
                      className="w-full mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Поворот: {selectedEl.rotation || 0}°</Label>
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      value={selectedEl.rotation || 0}
                      onChange={(e) => updateElement(selectedEl.id, { rotation: parseInt(e.target.value) })}
                      className="w-full mt-1"
                    />
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => deleteElement(selectedEl.id)}
                  >
                    <Icon name="Trash2" size={18} className="mr-2" />
                    Удалить элемент
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Constructor;