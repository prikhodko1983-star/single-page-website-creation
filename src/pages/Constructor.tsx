import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ConstructorLibrary } from "@/components/constructor/ConstructorLibrary";
import { ConstructorCanvas } from "@/components/constructor/ConstructorCanvas";
import { ConstructorProperties } from "@/components/constructor/ConstructorProperties";
import { TextEditorModal } from "@/components/constructor/TextEditorModal";

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
  
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [selectedFont, setSelectedFont] = useState('font1');
  
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<CanvasElement | null>(null);
  const [selectedDateFont, setSelectedDateFont] = useState('font1');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  
  const [catalogCategories, setCatalogCategories] = useState<Array<{id: number, name: string}>>([]);
  const [catalogProducts, setCatalogProducts] = useState<Array<{id: number, name: string, category_id: number, image_url: string | null}>>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  const loadCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      const mockData = [
        {
          id: 2,
          name: 'Памятник №2 "Элегант"',
          category_id: 1,
          category_name: 'Одиночные памятники',
          image_url: 'https://storage.yandexcloud.net/sitevek/5474527360758972468.jpg'
        }
      ];
      
      const uniqueCategories = new Map();
      mockData.forEach(p => {
        if (!uniqueCategories.has(p.category_id)) {
          uniqueCategories.set(p.category_id, {
            id: p.category_id,
            name: p.category_name
          });
        }
      });
      
      const categories = Array.from(uniqueCategories.values());
      
      setCatalogCategories(categories);
      setCatalogProducts(mockData);
      
      if (categories.length > 0) {
        setSelectedCategory(categories[0].id);
      }
    } catch (error) {
      console.error('Error loading catalog:', error);
      toast({
        title: "Ошибка загрузки каталога",
        description: "Не удалось загрузить памятники из базы данных",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  const monumentImages = [
    { id: '1', src: 'https://cdn.poehali.dev/files/692de6e1-c8ae-42f8-ac61-0d8770aeb8ec.png', name: 'Вертикальный' },
    { id: '2', src: 'https://cdn.poehali.dev/files/c80c1bd4-c413-425a-a1fc-91dbb36a8de4.jpg', name: 'Горизонтальный' },
    { id: '3', src: 'https://cdn.poehali.dev/files/a6e29eb2-0f18-47ca-917e-adac360db4c3.jpeg', name: 'Эксклюзивный' },
    { id: '4', src: 'https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/files/a953008d-a55f-41f3-9716-0889bec7b486.jpg', name: 'Классический' },
    { id: '5', src: 'https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/files/b4dcbf74-8910-472b-8c57-60782a8ed308.jpg', name: 'Крест' },
    { id: '6', src: 'https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/files/70b4ec4a-540e-4deb-b2c1-f10b74841657.jpg', name: 'Волна' },
    { id: '7', src: 'https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/files/48622168-6eae-44fe-adfe-3369b16806a9.jpg', name: 'Арка' },
    { id: '8', src: 'https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/files/c7ecf157-0f48-4a5c-a003-6d1abba97aa6.jpg', name: 'Двойной' },
    { id: '9', src: 'https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/files/408d6af0-9259-4a19-a531-558ae5297497.jpg', name: 'Книга' },
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

  const applyScreenMode = (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageData);
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = pixels.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          const rNorm = r / 255;
          const gNorm = g / 255;
          const bNorm = b / 255;
          
          const luminance = 0.299 * rNorm + 0.587 * gNorm + 0.114 * bNorm;
          
          const screenR = 1 - (1 - rNorm) * (1 - 0.5);
          const screenG = 1 - (1 - gNorm) * (1 - 0.5);
          const screenB = 1 - (1 - bNorm) * (1 - 0.5);
          
          data[i] = screenR * 255;
          data[i + 1] = screenG * 255;
          data[i + 2] = screenB * 255;
          
          data[i + 3] = Math.pow(luminance, 0.7) * 255;
        }
        
        ctx.putImageData(pixels, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.src = imageData;
    });
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

  const handleDoubleClick = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    if (['text', 'epitaph', 'fio', 'dates'].includes(element.type)) {
      setEditingElement(element);
      setIsTextEditorOpen(true);
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

  const updateElement = async (id: string, updates: Partial<CanvasElement>) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    if (updates.screenMode === true && element.type === 'photo' && element.src && !element.processedSrc) {
      const processed = await applyScreenMode(element.src);
      setElements(elements.map(el => el.id === id ? { ...el, ...updates, processedSrc: processed } : el));
    } 
    else if (updates.screenMode === false) {
      setElements(elements.map(el => el.id === id ? { ...el, ...updates, processedSrc: undefined } : el));
    }
    else {
      setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    }
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

  const exportDesign = () => {
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
        version: '1.0',
      };
      
      const jsonString = JSON.stringify(designData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `monument_design_${Date.now()}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Шаблон экспортирован",
        description: "JSON файл скачан на устройство",
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать шаблон",
        variant: "destructive",
      });
    }
  };

  const importDesign = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        
        if (!jsonData.monumentImage || !jsonData.elements) {
          throw new Error('Неверный формат файла');
        }
        
        setMonumentImage(jsonData.monumentImage);
        setElements(jsonData.elements);
        setSelectedElement(null);
        
        toast({
          title: "Шаблон загружен",
          description: "Дизайн восстановлен из файла",
        });
      } catch (error) {
        toast({
          title: "Ошибка импорта",
          description: "Не удалось загрузить шаблон. Проверьте файл",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    if (e.target) {
      e.target.value = '';
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
    
    try {
      toast({
        title: "Создание изображения...",
        description: "Пожалуйста, подождите",
      });

      if (!canvasRef.current) return;
      
      const canvasElement = document.createElement('canvas');
      const rect = canvasRef.current.getBoundingClientRect();
      canvasElement.width = rect.width * 2;
      canvasElement.height = rect.height * 2;
      
      const ctx = canvasElement.getContext('2d');
      if (!ctx) return;
      
      ctx.scale(2, 2);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      const loadImageWithCORS = (src: string): Promise<HTMLImageElement | null> => {
        return new Promise((resolve) => {
          const supportsCORS = src.includes('cdn.poehali.dev') || 
                               src.startsWith('data:') || 
                               src.startsWith(window.location.origin);
          
          if (!supportsCORS) {
            console.warn('Source does not support CORS, skipping:', src);
            resolve(null);
            return;
          }
          
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => {
            console.warn('Failed to load image:', src);
            resolve(null);
          };
          img.src = src;
        });
      };
      
      const monumentImg = await loadImageWithCORS(monumentImage);
      if (monumentImg) {
        ctx.drawImage(monumentImg, 0, 0, rect.width, rect.height);
      } else {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.fillStyle = '#666';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        const monumentName = monumentImages.find(m => m.src === monumentImage)?.name || 'Памятник';
        ctx.fillText(monumentName, rect.width / 2, rect.height / 2 - 20);
        ctx.font = '16px sans-serif';
        ctx.fillText('(изображение из внешнего источника)', rect.width / 2, rect.height / 2 + 20);
      }
      
      for (const element of elements) {
        ctx.save();
        
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate((element.rotation || 0) * Math.PI / 180);
        ctx.translate(-centerX, -centerY);
        
        if (element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates') {
          const [fontFamily, fontWeight] = element.fontFamily?.split('|') || ['serif', '400'];
          ctx.font = `${fontWeight} ${element.fontSize}px ${fontFamily}`;
          ctx.fillStyle = element.color || '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          const lines = element.content?.split('\n') || [];
          const lineHeight = (element.fontSize || 24) * (element.lineHeight || 1.2);
          const startY = element.y + element.height / 2 - (lines.length - 1) * lineHeight / 2;
          
          lines.forEach((line, idx) => {
            ctx.fillText(line, element.x + element.width / 2, startY + idx * lineHeight);
          });
        } else if (element.src) {
          const imgSrc = element.screenMode && element.processedSrc ? element.processedSrc : element.src;
          const img = await loadImageWithCORS(imgSrc);
          
          if (img) {
            ctx.drawImage(img, element.x, element.y, element.width, element.height);
          }
        }
        
        ctx.restore();
      }
      
      const imgData = canvasElement.toDataURL('image/jpeg', 0.95);
      const fileName = `monument_design_${Date.now()}.jpg`;
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile && navigator.share) {
        try {
          const blob = await fetch(imgData).then(r => r.blob());
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Дизайн памятника',
              text: 'Макет памятника из конструктора'
            });
            
            toast({
              title: "Изображение сохранено!",
              description: "Выберите 'Сохранить в галерею' в меню",
            });
            return;
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            return;
          }
          console.log('Share API failed, fallback to download:', error);
        }
      }
      
      const link = document.createElement('a');
      link.href = imgData;
      link.download = fileName;
      link.click();
      
      toast({
        title: "Изображение сохранено!",
        description: "JPG файл скачан на устройство",
      });
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "Ошибка создания изображения",
        description: "Попробуйте ещё раз",
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
          <ConstructorLibrary
            monumentImage={monumentImage}
            setMonumentImage={setMonumentImage}
            addTextElement={addTextElement}
            addEpitaphElement={addEpitaphElement}
            addImageElement={addImageElement}
            addFIOElement={addFIOElement}
            addDatesElement={addDatesElement}
            handlePhotoUpload={handlePhotoUpload}
            photoInputRef={photoInputRef}
            surname={surname}
            setSurname={setSurname}
            name={name}
            setName={setName}
            patronymic={patronymic}
            setPatronymic={setPatronymic}
            selectedFont={selectedFont}
            setSelectedFont={setSelectedFont}
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            deathDate={deathDate}
            setDeathDate={setDeathDate}
            selectedDateFont={selectedDateFont}
            setSelectedDateFont={setSelectedDateFont}
            catalogCategories={catalogCategories}
            catalogProducts={catalogProducts}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            isLoadingCatalog={isLoadingCatalog}
            loadCatalog={loadCatalog}
            monumentImages={monumentImages}
            fonts={fonts}
          />

          <ConstructorCanvas
            canvasRef={canvasRef}
            monumentImage={monumentImage}
            elements={elements}
            selectedElement={selectedElement}
            handleMouseDown={handleMouseDown}
            handleTouchStart={handleTouchStart}
            handleDoubleClick={handleDoubleClick}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            handleResizeMouseDown={handleResizeMouseDown}
            handleResizeTouchStart={handleResizeTouchStart}
            setElements={setElements}
            saveDesign={saveDesign}
            sendForCalculation={sendForCalculation}
            exportDesign={exportDesign}
            importDesign={importDesign}
            importInputRef={importInputRef}
          />

          <ConstructorProperties
            selectedEl={selectedEl}
            updateElement={updateElement}
            deleteElement={deleteElement}
            fonts={fonts}
          />
        </div>
      </div>
      
      <TextEditorModal
        isOpen={isTextEditorOpen}
        onClose={() => setIsTextEditorOpen(false)}
        editingElement={editingElement}
        setEditingElement={setEditingElement}
        onApply={(updates) => {
          if (editingElement) {
            updateElement(editingElement.id, updates);
          }
        }}
      />
    </div>
  );
};

export default Constructor;