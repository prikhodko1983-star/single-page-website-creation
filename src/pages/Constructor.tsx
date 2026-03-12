import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ConstructorLibrary } from "@/components/constructor/ConstructorLibrary";
import { ConstructorCanvas } from "@/components/constructor/ConstructorCanvas";
import { ConstructorProperties } from "@/components/constructor/ConstructorProperties";
import { TextEditorModal } from "@/components/constructor/TextEditorModal";
import { MobileToolbar } from "@/components/constructor/MobileToolbar";
import { ImageEraser } from "@/components/constructor/ImageEraser";

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
  flipHorizontal?: boolean;
  autoSize?: boolean;
  italic?: boolean;
}

const Constructor = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [savedDesigns, setSavedDesigns] = useState<Array<{monumentImage: string, elements: CanvasElement[], timestamp: number}>>([]);
  
  const [monumentImage, setMonumentImage] = useState<string>('https://storage.yandexcloud.net/sitevek/5474527360758972468.jpg');
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotateMode, setRotateMode] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, fontSize: 0 });
  const [rotateStart, setRotateStart] = useState({ x: 0, y: 0, rotation: 0, centerX: 0, centerY: 0 });
  
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [selectedFont, setSelectedFont] = useState('font1');
  
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<CanvasElement | null>(null);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [selectedDateFont, setSelectedDateFont] = useState('font1');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  
  const [touchRotateStart, setTouchRotateStart] = useState<{ angle: number; rotation: number } | null>(null);
  const [touchPinchStart, setTouchPinchStart] = useState<{ distance: number; width: number; height: number; fontSize: number } | null>(null);
  
  const [catalogCategories, setCatalogCategories] = useState<Array<{id: number, name: string}>>([]);
  const [catalogProducts, setCatalogProducts] = useState<Array<{id: number, name: string, category_id: number, image_url: string | null}>>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  
  const [crosses, setCrosses] = useState<Array<{id: number, name: string, image_url: string}>>([]);
  const [isLoadingCrosses, setIsLoadingCrosses] = useState(false);
  
  const [flowers, setFlowers] = useState<Array<{id: number, name: string, image_url: string}>>([]);
  const [isLoadingFlowers, setIsLoadingFlowers] = useState(false);

  const [customFonts, setCustomFonts] = useState<Array<{filename: string, name: string, url: string}>>([]);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasPinchStart, setCanvasPinchStart] = useState<{ distance: number; zoom: number } | null>(null);
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const [isImageEraserOpen, setIsImageEraserOpen] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const prevCanvasSizeRef = useRef<{ width: number; height: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      // Загружаем категории
      const categoriesResponse = await fetch('https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d?type=categories');
      const categoriesData = await categoriesResponse.json();
      
      // Загружаем продукты
      const productsResponse = await fetch('https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d');
      const productsData = await productsResponse.json();
      
      // Фильтруем только продукты с изображениями
      const productsWithImages = productsData.filter((p: any) => p.image_url);
      
      // Создаем карту категорий для быстрого доступа
      const categoryMap = new Map();
      categoriesData.forEach((cat: any) => {
        categoryMap.set(cat.id, cat.name);
      });
      
      // Преобразуем продукты в нужный формат
      const formattedProducts = productsWithImages.map((p: any) => ({
        id: p.id,
        name: p.name,
        category_id: p.category_id || 0,
        category_name: categoryMap.get(p.category_id) || 'Без категории',
        image_url: p.image_url
      }));
      
      // Получаем уникальные категории из продуктов
      const uniqueCategories = new Map();
      formattedProducts.forEach((p: any) => {
        if (!uniqueCategories.has(p.category_id)) {
          uniqueCategories.set(p.category_id, {
            id: p.category_id,
            name: p.category_name
          });
        }
      });
      
      const categories = Array.from(uniqueCategories.values());
      
      setCatalogCategories(categories);
      setCatalogProducts(formattedProducts);
      
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

  const loadCrosses = async () => {
    setIsLoadingCrosses(true);
    try {
      const response = await fetch('https://functions.poehali.dev/92a4ea52-a3a0-4502-9181-ceeb714f2ad6?type=crosses');
      if (response.ok) {
        const data = await response.json();
        setCrosses(data);
      } else {
        setCrosses([]);
      }
    } catch (error) {
      console.error('Error loading crosses:', error);
      setCrosses([]);
    } finally {
      setIsLoadingCrosses(false);
    }
  };

  const loadFlowers = async () => {
    setIsLoadingFlowers(true);
    try {
      const response = await fetch('https://functions.poehali.dev/92a4ea52-a3a0-4502-9181-ceeb714f2ad6?type=flowers');
      if (response.ok) {
        const data = await response.json();
        setFlowers(data);
      } else {
        setFlowers([]);
      }
    } catch (error) {
      console.error('Error loading flowers:', error);
      setFlowers([]);
    } finally {
      setIsLoadingFlowers(false);
    }
  };

  const loadCustomFonts = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/c1b3f505-db44-492c-8db4-231760a9bb95');
      if (response.ok) {
        const data = await response.json();
        setCustomFonts(data);
        
        data.forEach((font: {filename: string, name: string, url: string}) => {
          const styleId = `font-face-${font.filename}`;
          if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
              @font-face {
                font-family: '${font.name}';
                src: url('${font.url}') format('truetype');
                font-weight: normal;
                font-style: normal;
              }
            `;
            document.head.appendChild(style);
          }
        });
      }
    } catch (error) {
      console.error('Error loading custom fonts:', error);
    }
  };

  useEffect(() => {
    const monumentParam = searchParams.get('monument');
    if (monumentParam) {
      setMonumentImage(decodeURIComponent(monumentParam));
    }
    loadCustomFonts();
  }, [searchParams]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const newWidth = entry.contentRect.width;
      const newHeight = entry.contentRect.height;

      if (newWidth === 0 || newHeight === 0) return;

      const prev = prevCanvasSizeRef.current;
      if (prev && (Math.abs(prev.width - newWidth) > 1 || Math.abs(prev.height - newHeight) > 1)) {
        const scaleX = newWidth / prev.width;
        const scaleY = newHeight / prev.height;

        setElements(prevElements => prevElements.map(el => ({
          ...el,
          x: el.x * scaleX,
          y: el.y * scaleY,
          width: el.width * scaleX,
          height: el.height * scaleY,
          fontSize: el.fontSize ? el.fontSize * scaleX : el.fontSize,
        })));
      }

      prevCanvasSizeRef.current = { width: newWidth, height: newHeight };
    });

    observer.observe(canvasRef.current);
    const w = canvasRef.current.offsetWidth;
    const h = canvasRef.current.offsetHeight;
    if (w > 0 && h > 0) {
      prevCanvasSizeRef.current = { width: w, height: h };
    }

    return () => observer.disconnect();
  }, []);

  const googleFonts = [
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

  const fonts = [
    ...googleFonts,
    ...customFonts.map((font, index) => ({
      id: `custom-${index}`,
      name: font.name,
      style: font.name,
      weight: '400',
      example: 'Фамилия Имя Отчество',
      fullStyle: `${font.name}|custom|${font.url}`
    }))
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
      autoSize: true,
    };
    setElements([...elements, newElement]);
  };

  const addImageElement = async (src: string, type: 'image' | 'cross' | 'flower') => {
    const processedSrc = await applyScreenMode(src);
    
    // Для портретов используем реальные пропорции изображения
    let width = 100;
    let height = 100;
    
    // Загружаем изображение для определения его пропорций
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    
    await new Promise((resolve) => {
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        
        // Для портретов (вертикальные изображения)
        if (aspectRatio < 1) {
          height = 150;
          width = Math.round(height * aspectRatio);
        } 
        // Для горизонтальных изображений
        else if (aspectRatio > 1) {
          width = 150;
          height = Math.round(width / aspectRatio);
        }
        // Для квадратных
        else {
          width = 100;
          height = 100;
        }
        
        resolve(true);
      };
      img.onerror = () => {
        // Если ошибка загрузки, оставляем дефолтные размеры
        resolve(false);
      };
    });
    
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type,
      x: 50,
      y: 50,
      width,
      height,
      src,
      rotation: 0,
      screenMode: true,
      processedSrc,
    };
    setElements([...elements, newElement]);
  };

  const addEpitaphElement = (customText?: string) => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: 'epitaph',
      x: 50,
      y: 200,
      width: 300,
      height: 60,
      content: customText || 'Вечная память',
      fontSize: 18,
      color: '#FFFFFF',
      rotation: 0,
      autoSize: true,
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
      width: 200,
      height: 90,
      content: fioText,
      fontSize: 28,
      color: '#FFFFFF',
      rotation: 0,
      fontFamily: selectedFontData?.fullStyle || 'serif',
      autoSize: true,
      lineHeight: 1.05,
    };
    setElements([...elements, newElement]);
    
    setSurname('');
    setName('');
    setPatronymic('');
  };

  const addDatesElement = () => {
    if (!birthDate && !deathDate) return;
    
    const datesText = `${birthDate} – ${deathDate}`.trim();
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

  const applyScreenMode = async (imageData: string): Promise<string> => {
    // Если это data URL (загруженное фото) - обрабатываем локально
    if (imageData.startsWith('data:')) {
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
          
          try {
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
          } catch (error) {
            console.error('❌ Ошибка обработки:', error);
            resolve(imageData);
          }
        };
        
        img.onerror = () => {
          console.error('❌ Не удалось загрузить');
          resolve(imageData);
        };
        
        img.src = imageData;
      });
    }
    
    // Если это URL - используем бэкенд для обработки (избегаем CORS)
    try {
      console.log('📡 Отправляем на бэкенд для обработки:', imageData);
      const response = await fetch('https://functions.poehali.dev/7984fbed-b9d7-47d1-aa0d-cf674fc696d8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageData })
      });
      
      if (!response.ok) {
        throw new Error('Backend error');
      }
      
      const result = await response.json();
      console.log('✅ Получили обработанное изображение');
      return result.processed_image;
    } catch (error) {
      console.error('❌ Ошибка обработки через бэкенд:', error);
      return imageData;
    }
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

  const handleSingleClick = (elementId: string) => {
    // Убрана возможность инлайн-редактирования, только через модальное окно
  };

  const handleInlineTextChange = (elementId: string, newContent: string, textareaElement?: HTMLTextAreaElement) => {
    setElements(elements.map(el => {
      if (el.id === elementId) {
        return { ...el, content: newContent };
      }
      return el;
    }));
  };

  const handleInlineEditBlur = () => {
    setInlineEditingId(null);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const element = elements.find(el => el.id === elementId);
    if (!element || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Учитываем zoom и pan при расчёте offset
    const mouseX = (e.clientX - canvasRect.left - canvasRect.width / 2) / canvasZoom - canvasPan.x / canvasZoom + canvasRect.width / 2;
    const mouseY = (e.clientY - canvasRect.top - canvasRect.height / 2) / canvasZoom - canvasPan.y / canvasZoom + canvasRect.height / 2;
    
    setDragOffset({
      x: mouseX - element.x,
      y: mouseY - element.y,
    });
  };

  const handleTouchStart = (e: React.TouchEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    // Два пальца = вращение + масштабирование
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      // Угол для вращения
      const angle = Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * (180 / Math.PI);
      setTouchRotateStart({ angle, rotation: element.rotation || 0 });
      
      // Расстояние для масштабирования
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setTouchPinchStart({ 
        distance, 
        width: element.width, 
        height: element.height,
        fontSize: element.fontSize || 24
      });
      
      return;
    }
    
    // Один палец = перетаскивание
    if (!canvasRef.current) return;
    
    setIsDragging(true);
    const touch = e.touches[0];
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Учитываем zoom и pan при расчёте offset
    const touchX = (touch.clientX - canvasRect.left - canvasRect.width / 2) / canvasZoom - canvasPan.x / canvasZoom + canvasRect.width / 2;
    const touchY = (touch.clientY - canvasRect.top - canvasRect.height / 2) / canvasZoom - canvasPan.y / canvasZoom + canvasRect.height / 2;
    
    setDragOffset({
      x: touchX - element.x,
      y: touchY - element.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    // Панорамирование canvas при увеличении
    if (isPanning && !selectedElement) {
      setCanvasPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }
    
    if (!selectedElement) return;
    
    if (isRotating) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      const deltaX = mouseX - rotateStart.centerX;
      const deltaY = mouseY - rotateStart.centerY;
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      
      const startDeltaX = rotateStart.x - rotateStart.centerX;
      const startDeltaY = rotateStart.y - rotateStart.centerY;
      const startAngle = Math.atan2(startDeltaY, startDeltaX) * (180 / Math.PI);
      
      // Делим на 3 для более медленного и точного поворота
      const rotation = rotateStart.rotation + (angle - startAngle) / 3;
      
      setElements(elements.map(el => 
        el.id === selectedElement 
          ? { ...el, rotation: Math.round(rotation) }
          : el
      ));
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const element = elements.find(el => el.id === selectedElement);
      
      if (element && (element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates')) {
        // Для текста: свободное изменение размера с масштабированием шрифта
        const newWidth = Math.max(50, resizeStart.width + deltaX);
        const newHeight = Math.max(30, resizeStart.height + deltaY);
        const scaleRatio = Math.min(newWidth / resizeStart.width, newHeight / resizeStart.height);
        const newFontSize = Math.max(8, Math.min(72, Math.round(resizeStart.fontSize * scaleRatio)));
        
        setElements(elements.map(el => 
          el.id === selectedElement 
            ? { ...el, width: newWidth, height: newHeight, fontSize: newFontSize }
            : el
        ));
      } else if (element && (element.type === 'image' || element.type === 'photo' || element.type === 'cross' || element.type === 'flower')) {
        // Для изображений: сохраняем пропорции (aspect ratio)
        const aspectRatio = resizeStart.width / resizeStart.height;
        
        // Берём наибольшее изменение (по X или по Y)
        const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY * aspectRatio;
        const newWidth = Math.max(30, resizeStart.width + delta);
        const newHeight = Math.max(30, newWidth / aspectRatio);
        
        setElements(elements.map(el => 
          el.id === selectedElement 
            ? { ...el, width: newWidth, height: newHeight }
            : el
        ));
      } else {
        // Остальные элементы: свободное изменение
        const newWidth = Math.max(50, resizeStart.width + deltaX);
        const newHeight = Math.max(30, resizeStart.height + deltaY);
        
        setElements(elements.map(el => 
          el.id === selectedElement 
            ? { ...el, width: newWidth, height: newHeight }
            : el
        ));
      }
    } else if (isDragging) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Учитываем zoom и pan при расчёте координат
      const mouseX = (e.clientX - canvasRect.left - canvasRect.width / 2) / canvasZoom - canvasPan.x / canvasZoom + canvasRect.width / 2;
      const mouseY = (e.clientY - canvasRect.top - canvasRect.height / 2) / canvasZoom - canvasPan.y / canvasZoom + canvasRect.height / 2;
      
      const newX = mouseX - dragOffset.x;
      const newY = mouseY - dragOffset.y;
      
      setElements(elements.map(el => {
        if (el.id === selectedElement) {
          // Для элементов с autoSize не ограничиваем по ширине
          const maxX = el.autoSize ? canvasRect.width : canvasRect.width - el.width;
          const maxY = el.autoSize ? canvasRect.height : canvasRect.height - el.height;
          return { 
            ...el, 
            x: Math.max(0, Math.min(newX, maxX)), 
            y: Math.max(0, Math.min(newY, maxY)) 
          };
        }
        return el;
      }));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!canvasRef.current) return;
    
    // Масштабирование всего canvas двумя пальцами (если нет выбранного элемента)
    if (e.touches.length === 2 && !selectedElement && canvasPinchStart) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const scale = currentDistance / canvasPinchStart.distance;
      const newZoom = Math.max(1, Math.min(3, canvasPinchStart.zoom * scale));
      
      setCanvasZoom(newZoom);
      return;
    }
    
    // Панорамирование canvas при увеличении (один палец)
    if (e.touches.length === 1 && isPanning && !selectedElement) {
      e.preventDefault();
      const touch = e.touches[0];
      setCanvasPan({
        x: touch.clientX - panStart.x,
        y: touch.clientY - panStart.y
      });
      return;
    }
    
    if (!selectedElement) return;
    
    // Вращение + масштабирование двумя пальцами для выбранного элемента
    if (e.touches.length === 2 && touchRotateStart && touchPinchStart) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      // Вращение
      const currentAngle = Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * (180 / Math.PI);
      const angleDiff = currentAngle - touchRotateStart.angle;
      const newRotation = touchRotateStart.rotation + angleDiff;
      
      // Масштабирование (щипок)
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const scale = currentDistance / touchPinchStart.distance;
      const newWidth = Math.max(50, touchPinchStart.width * scale);
      const newHeight = Math.max(30, touchPinchStart.height * scale);
      
      const element = elements.find(el => el.id === selectedElement);
      if (element && (element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates')) {
        const newFontSize = Math.max(8, Math.min(72, touchPinchStart.fontSize * scale));
        setElements(elements.map(el => 
          el.id === selectedElement 
            ? { ...el, rotation: Math.round(newRotation), width: newWidth, height: newHeight, fontSize: newFontSize }
            : el
        ));
      } else {
        setElements(elements.map(el => 
          el.id === selectedElement 
            ? { ...el, rotation: Math.round(newRotation), width: newWidth, height: newHeight }
            : el
        ));
      }
      
      return;
    }
    
    const touch = e.touches[0];
    
    if (isRotating) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const touchX = touch.clientX - canvasRect.left;
      const touchY = touch.clientY - canvasRect.top;
      
      const deltaX = touchX - rotateStart.centerX;
      const deltaY = touchY - rotateStart.centerY;
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      
      const startDeltaX = rotateStart.x - rotateStart.centerX;
      const startDeltaY = rotateStart.y - rotateStart.centerY;
      const startAngle = Math.atan2(startDeltaY, startDeltaX) * (180 / Math.PI);
      
      // Делим на 3 для более медленного и точного поворота
      const rotation = rotateStart.rotation + (angle - startAngle) / 3;
      
      setElements(elements.map(el => 
        el.id === selectedElement 
          ? { ...el, rotation: Math.round(rotation) }
          : el
      ));
    } else if (isResizing) {
      const deltaX = touch.clientX - resizeStart.x;
      const deltaY = touch.clientY - resizeStart.y;
      
      const element = elements.find(el => el.id === selectedElement);
      
      if (element && (element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates')) {
        // Для текста: свободное изменение размера с масштабированием шрифта
        const newWidth = Math.max(50, resizeStart.width + deltaX);
        const newHeight = Math.max(30, resizeStart.height + deltaY);
        const scaleRatio = Math.min(newWidth / resizeStart.width, newHeight / resizeStart.height);
        const newFontSize = Math.max(8, Math.min(72, Math.round(resizeStart.fontSize * scaleRatio)));
        
        setElements(elements.map(el => 
          el.id === selectedElement 
            ? { ...el, width: newWidth, height: newHeight, fontSize: newFontSize }
            : el
        ));
      } else if (element && (element.type === 'image' || element.type === 'photo' || element.type === 'cross' || element.type === 'flower')) {
        // Для изображений: сохраняем пропорции (aspect ratio)
        const aspectRatio = resizeStart.width / resizeStart.height;
        
        // Берём наибольшее изменение (по X или по Y)
        const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY * aspectRatio;
        const newWidth = Math.max(30, resizeStart.width + delta);
        const newHeight = Math.max(30, newWidth / aspectRatio);
        
        setElements(elements.map(el => 
          el.id === selectedElement 
            ? { ...el, width: newWidth, height: newHeight }
            : el
        ));
      } else {
        // Остальные элементы: свободное изменение
        const newWidth = Math.max(50, resizeStart.width + deltaX);
        const newHeight = Math.max(30, resizeStart.height + deltaY);
        
        setElements(elements.map(el => 
          el.id === selectedElement 
            ? { ...el, width: newWidth, height: newHeight }
            : el
        ));
      }
    } else if (isDragging) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Учитываем zoom и pan при расчёте координат
      const touchX = (touch.clientX - canvasRect.left - canvasRect.width / 2) / canvasZoom - canvasPan.x / canvasZoom + canvasRect.width / 2;
      const touchY = (touch.clientY - canvasRect.top - canvasRect.height / 2) / canvasZoom - canvasPan.y / canvasZoom + canvasRect.height / 2;
      
      const newX = touchX - dragOffset.x;
      const newY = touchY - dragOffset.y;
      
      setElements(elements.map(el => {
        if (el.id === selectedElement) {
          // Для элементов с autoSize не ограничиваем по ширине
          const maxX = el.autoSize ? canvasRect.width : canvasRect.width - el.width;
          const maxY = el.autoSize ? canvasRect.height : canvasRect.height - el.height;
          return { 
            ...el, 
            x: Math.max(0, Math.min(newX, maxX)), 
            y: Math.max(0, Math.min(newY, maxY)) 
          };
        }
        return el;
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setIsPanning(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setTouchRotateStart(null);
    setTouchPinchStart(null);
    setCanvasPinchStart(null);
    setIsPanning(false);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element || !canvasRef.current) return;
    
    setSelectedElement(elementId);
    
    if (rotateMode) {
      // Режим вращения
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setIsRotating(true);
      setRotateStart({
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top,
        rotation: element.rotation || 0,
        centerX: element.x + element.width / 2,
        centerY: element.y + element.height / 2,
      });
    } else {
      // Режим масштабирования
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: element.width,
        height: element.height,
        fontSize: element.fontSize || 24,
      });
    }
  };

  const handleResizeTouchStart = (e: React.TouchEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element || !canvasRef.current) return;
    
    const touch = e.touches[0];
    setSelectedElement(elementId);
    
    if (rotateMode) {
      // Режим вращения
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setIsRotating(true);
      setRotateStart({
        x: touch.clientX - canvasRect.left,
        y: touch.clientY - canvasRect.top,
        rotation: element.rotation || 0,
        centerX: element.x + element.width / 2,
        centerY: element.y + element.height / 2,
      });
    } else {
      // Режим масштабирования
      setIsResizing(true);
      setResizeStart({
        x: touch.clientX,
        y: touch.clientY,
        width: element.width,
        height: element.height,
        fontSize: element.fontSize || 24,
      });
    }
  };

  const handleRotateMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setSelectedElement(elementId);
    setIsRotating(true);
    setRotateStart({
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top,
      rotation: element.rotation || 0,
      centerX: element.x + element.width / 2,
      centerY: element.y + element.height / 2,
    });
  };

  const handleRotateTouchStart = (e: React.TouchEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element || !canvasRef.current) return;
    
    const touch = e.touches[0];
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setSelectedElement(elementId);
    setIsRotating(true);
    setRotateStart({
      x: touch.clientX - canvasRect.left,
      y: touch.clientY - canvasRect.top,
      rotation: element.rotation || 0,
      centerX: element.x + element.width / 2,
      centerY: element.y + element.height / 2,
    });
  };

  const toggleRotateMode = () => {
    setRotateMode(!rotateMode);
  };

  const updateElement = async (id: string, updates: Partial<CanvasElement>) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    // Обработка режима "Экран" для изображений
    if ('screenMode' in updates && (element.type === 'photo' || element.type === 'image' || element.type === 'cross' || element.type === 'flower') && element.src) {
      if (updates.screenMode === true) {
        // Включение режима
        if (!element.processedSrc) {
          // Нужно создать обработанную версию
          const processed = await applyScreenMode(element.src);
          setElements(elements.map(el => el.id === id ? { ...el, screenMode: true, processedSrc: processed } : el));
        } else {
          // Обработанная версия уже есть, просто включаем флаг
          setElements(elements.map(el => el.id === id ? { ...el, screenMode: true } : el));
        }
        return;
      } else if (updates.screenMode === false) {
        // Выключение режима - удалить обработанную версию
        setElements(elements.map(el => el.id === id ? { ...el, screenMode: false, processedSrc: undefined } : el));
        return;
      }
    }
    
    // Все остальные обновления
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  const handleEditImage = (id: string) => {
    console.log('📝 [NEW CODE] Открываем редактор для элемента:', id);
    console.log('📝 [NEW CODE] Текущие elements:', elements);
    
    const element = elements.find(el => el.id === id);
    console.log('📝 [NEW CODE] Найденный элемент:', element);
    
    if (element && element.src) {
      console.log('✅ [NEW CODE] Элемент найден, src:', element.src);
      setEditingImageId(id);
      setIsImageEraserOpen(true);
    } else {
      console.error('❌ [NEW CODE] Элемент не найден или нет src');
    }
  };

  const handleSaveEditedImage = (editedImageUrl: string) => {
    if (editingImageId) {
      setElements(elements.map(el => 
        el.id === editingImageId 
          ? { ...el, src: editedImageUrl, processedSrc: undefined, screenMode: false }
          : el
      ));
      toast({
        title: "Изображение обновлено",
        description: "Отредактированное изображение применено",
      });
    }
  };

  // Вычисляем URL изображения для редактора
  const editingImageUrl = useMemo(() => {
    console.log('🔍 useMemo: Вычисляем imageUrl');
    console.log('editingImageId:', editingImageId);
    console.log('Все элементы:', elements.map(e => ({ id: e.id, type: e.type, hasSrc: !!e.src })));
    
    if (!editingImageId) {
      console.log('❌ editingImageId пустой');
      return '';
    }
    
    const element = elements.find(el => el.id === editingImageId);
    console.log('Найденный элемент:', element);
    
    if (!element) {
      console.log('❌ Элемент не найден в массиве elements');
      return '';
    }
    
    // ИСПРАВЛЕНИЕ: используем ТОЛЬКО оригинальный src (не processedSrc)
    const url = element.src || '';
    console.log('🖼️ URL для ImageEraser:', url);
    return url;
  }, [editingImageId, elements]);

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
      
      console.log('💾 Сохраняем дизайн:', designData);
      
      const saved = JSON.parse(localStorage.getItem('monumentDesigns') || '[]');
      saved.push(designData);
      
      const jsonString = JSON.stringify(saved);
      console.log(`📦 Размер данных: ${(jsonString.length / 1024).toFixed(2)} KB`);
      
      localStorage.setItem('monumentDesigns', jsonString);
      setSavedDesigns(saved);
      
      console.log('✅ Дизайн успешно сохранен');
      
      toast({
        title: "Дизайн сохранен",
        description: "Проект сохранен в браузере",
      });
    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Не удалось сохранить дизайн",
        variant: "destructive",
      });
    }
  };

  const exportDesignAsPNG = async () => {
    if (isSaving) return;
    if (elements.length === 0) {
      toast({
        title: "Пустой дизайн",
        description: "Добавьте элементы на памятник",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      toast({
        title: "Создание PNG...",
        description: "Встраиваем данные в изображение",
      });
      
      const designData = {
        monumentImage,
        elements,
        timestamp: Date.now(),
        version: '1.0',
      };
      
      // Создаем превью изображение
      const previewDataUrl = await createPreviewImage();
      
      if (!previewDataUrl) {
        throw new Error('Не удалось создать превью');
      }
      
      // Конвертируем base64 в binary
      const base64Data = previewDataUrl.split(',')[1];
      const binaryData = atob(base64Data);
      const uint8Array = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
      
      // Добавляем текстовый chunk с JSON данными (tEXt chunk для PNG)
      const jsonString = JSON.stringify(designData);
      const keyword = 'workflow'; // Как в ComfyUI
      
      // Создаем новый PNG с встроенными метаданными
      const pngWithMetadata = addPNGTextChunk(uint8Array, keyword, jsonString);
      
      const blob = new Blob([pngWithMetadata], { type: 'image/png' });
      
      const date = new Date();
      const dateStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
      const fileName = `проект_${dateStr}.png`;
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile && navigator.canShare && navigator.canShare({ files: [new File([blob], fileName)] })) {
        try {
          await navigator.share({
            files: [new File([blob], fileName, { type: 'image/png' })],
            title: 'Мой памятник',
            text: 'Сохраните это изображение'
          });
          toast({
            title: "Готово!",
            description: "Сохраните изображение в галерею",
          });
          return;
        } catch {
          // Fallback на обычную загрузку
        }
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 3000);
      
      toast({
        title: "Проект сохранён",
        description: "PNG файл скачан на устройство",
      });
    } catch (error) {
      console.error('❌ Export error:', error);
      toast({
        title: "Ошибка экспорта PNG",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addPNGTextChunk = (pngData: Uint8Array, keyword: string, text: string): Uint8Array => {
    // PNG signature: 8 байт
    const signature = pngData.slice(0, 8);
    
    // Находим IEND chunk (конец файла)
    let iendPos = -1;
    for (let i = 8; i < pngData.length - 4; i++) {
      if (pngData[i] === 0x49 && pngData[i+1] === 0x45 && 
          pngData[i+2] === 0x4E && pngData[i+3] === 0x44) {
        iendPos = i - 4; // Позиция начала length для IEND
        break;
      }
    }
    
    if (iendPos === -1) {
      console.warn('IEND chunk не найден, возвращаем оригинал');
      return pngData;
    }
    
    // Создаем tEXt chunk
    const keywordBytes = new TextEncoder().encode(keyword);
    const textBytes = new TextEncoder().encode(text);
    const chunkData = new Uint8Array(keywordBytes.length + 1 + textBytes.length);
    chunkData.set(keywordBytes, 0);
    chunkData[keywordBytes.length] = 0; // null separator
    chunkData.set(textBytes, keywordBytes.length + 1);
    
    // Длина данных (без учета type и CRC)
    const length = chunkData.length;
    const lengthBytes = new Uint8Array(4);
    new DataView(lengthBytes.buffer).setUint32(0, length, false);
    
    // Type: tEXt
    const typeBytes = new Uint8Array([0x74, 0x45, 0x58, 0x74]); // "tEXt"
    
    // Вычисляем CRC32
    const crcData = new Uint8Array(typeBytes.length + chunkData.length);
    crcData.set(typeBytes, 0);
    crcData.set(chunkData, typeBytes.length);
    const crc = calculateCRC32(crcData);
    const crcBytes = new Uint8Array(4);
    new DataView(crcBytes.buffer).setUint32(0, crc, false);
    
    // Собираем новый PNG
    const newPNG = new Uint8Array(
      pngData.length + lengthBytes.length + typeBytes.length + chunkData.length + crcBytes.length
    );
    
    newPNG.set(pngData.slice(0, iendPos), 0); // Все до IEND
    let offset = iendPos;
    newPNG.set(lengthBytes, offset); offset += lengthBytes.length;
    newPNG.set(typeBytes, offset); offset += typeBytes.length;
    newPNG.set(chunkData, offset); offset += chunkData.length;
    newPNG.set(crcBytes, offset); offset += crcBytes.length;
    newPNG.set(pngData.slice(iendPos), offset); // IEND chunk
    
    console.log('✅ tEXt chunk добавлен, новый размер:', newPNG.length);
    return newPNG;
  };

  const calculateCRC32 = (data: Uint8Array): number => {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  };

  const extractPNGTextChunk = (pngData: Uint8Array, keyword: string): string | null => {
    // PNG signature: 8 байт
    let pos = 8;
    
    while (pos < pngData.length) {
      // Читаем длину chunk
      if (pos + 4 > pngData.length) break;
      const length = new DataView(pngData.buffer, pngData.byteOffset + pos).getUint32(0, false);
      pos += 4;
      
      // Читаем тип chunk
      if (pos + 4 > pngData.length) break;
      const type = String.fromCharCode(pngData[pos], pngData[pos+1], pngData[pos+2], pngData[pos+3]);
      pos += 4;
      
      // Если это IEND, останавливаемся
      if (type === 'IEND') break;
      
      // Если это tEXt chunk
      if (type === 'tEXt' && pos + length <= pngData.length) {
        const chunkData = pngData.slice(pos, pos + length);
        
        // Ищем null separator
        let separatorPos = -1;
        for (let i = 0; i < chunkData.length; i++) {
          if (chunkData[i] === 0) {
            separatorPos = i;
            break;
          }
        }
        
        if (separatorPos !== -1) {
          const chunkKeyword = new TextDecoder().decode(chunkData.slice(0, separatorPos));
          
          if (chunkKeyword === keyword) {
            const text = new TextDecoder().decode(chunkData.slice(separatorPos + 1));
            console.log(`✅ Найден tEXt chunk "${keyword}", размер:`, text.length);
            return text;
          }
        }
      }
      
      // Пропускаем данные chunk и CRC (4 байта)
      pos += length + 4;
    }
    
    console.warn(`tEXt chunk "${keyword}" не найден`);
    return null;
  };

  const exportDesign = async () => {
    if (elements.length === 0) {
      toast({
        title: "Пустой дизайн",
        description: "Добавьте элементы на памятник",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('📦 Начинаем экспорт дизайна');
      
      const designData = {
        monumentImage,
        elements,
        timestamp: Date.now(),
        version: '1.0',
      };
      
      // Экспорт JSON
      const jsonString = JSON.stringify(designData, null, 2);
      console.log('📄 JSON создан, размер:', jsonString.length);
      
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      
      const timestamp = Date.now();
      const fileName = `monument_${timestamp}`;
      
      console.log('💾 Попытка скачать JSON файл:', `${fileName}.json`);
      
      // Создаем ссылку для скачивания JSON
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `${fileName}.json`;
      jsonLink.style.display = 'none';
      
      // Добавляем в DOM
      document.body.appendChild(jsonLink);
      
      // Пробуем вызвать клик
      try {
        jsonLink.click();
        console.log('✅ JSON: click() вызван');
      } catch (clickError) {
        console.error('❌ Ошибка click():', clickError);
        // Альтернативный метод для iOS
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        jsonLink.dispatchEvent(event);
        console.log('✅ JSON: dispatchEvent() вызван');
      }
      
      // Убираем из DOM через секунду
      setTimeout(() => {
        document.body.removeChild(jsonLink);
        URL.revokeObjectURL(jsonUrl);
        console.log('🧹 JSON: элемент удален из DOM');
      }, 1000);
      
      toast({
        title: "Файл готов к загрузке",
        description: `${fileName}.json`,
      });
      
      console.log('🎉 Экспорт завершен');
    } catch (error) {
      console.error('❌ Export error:', error);
      toast({
        title: "Ошибка экспорта",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const importDesign = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('📁 Загружаем файл:', file.name, file.type, file.size);
    
    const fileName = file.name.toLowerCase();
    
    // Поддержка PNG с метаданными (как ComfyUI)
    if (fileName.endsWith('.png')) {
      console.log('🖼️ Обнаружен PNG, ищем метаданные...');
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Извлекаем tEXt chunk с keyword "workflow"
          const jsonData = extractPNGTextChunk(uint8Array, 'workflow');
          
          if (!jsonData) {
            toast({
              title: "Метаданные не найдены",
              description: "Это обычное изображение без workflow данных",
              variant: "destructive",
            });
            return;
          }
          
          const parsedData = JSON.parse(jsonData);
          
          if (!parsedData.monumentImage || !parsedData.elements) {
            throw new Error('Неверный формат данных');
          }
          
          console.log('✅ Workflow данные извлечены из PNG, элементов:', parsedData.elements.length);
          
          setMonumentImage(parsedData.monumentImage);
          setElements(parsedData.elements);
          setSelectedElement(null);
          
          toast({
            title: "Workflow загружен из PNG",
            description: `Восстановлено ${parsedData.elements.length} элементов`,
          });
        } catch (error) {
          console.error('❌ Ошибка чтения PNG метаданных:', error);
          toast({
            title: "Ошибка чтения PNG",
            description: "Не удалось извлечь workflow данные",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsArrayBuffer(file);
      if (e.target) e.target.value = '';
      return;
    }
    
    // JSON файлы
    if (!fileName.endsWith('.json')) {
      toast({
        title: "Неверный формат",
        description: "Выберите JSON или PNG файл",
        variant: "destructive",
      });
      if (e.target) e.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        console.log('📄 Содержимое файла загружено, размер:', result.length);
        
        const jsonData = JSON.parse(result);
        
        if (!jsonData.monumentImage || !jsonData.elements) {
          throw new Error('Неверный формат файла');
        }
        
        console.log('✅ JSON валиден, элементов:', jsonData.elements.length);
        
        setMonumentImage(jsonData.monumentImage);
        setElements(jsonData.elements);
        setSelectedElement(null);
        
        toast({
          title: "Шаблон загружен",
          description: `Восстановлено ${jsonData.elements.length} элементов`,
        });
      } catch (error) {
        console.error('❌ Ошибка парсинга JSON:', error);
        toast({
          title: "Ошибка импорта",
          description: "Не удалось прочитать файл. Проверьте формат",
          variant: "destructive",
        });
      }
    };
    
    reader.onerror = () => {
      console.error('❌ Ошибка чтения файла');
      toast({
        title: "Ошибка чтения",
        description: "Не удалось прочитать файл",
        variant: "destructive",
      });
    };
    
    reader.readAsText(file);
    
    if (e.target) {
      e.target.value = '';
    }
  };

  const createPreviewImage = async (): Promise<string | null> => {
    if (!canvasRef.current) return null;
    
    try {
      // Загружаем шрифты перед экспортом
      await loadFonts(elements);
      
      // Превью размер (меньше, чем финальный экспорт)
      const previewWidth = 600;
      const previewHeight = 800;
      
      const canvas = document.createElement('canvas');
      canvas.width = previewWidth;
      canvas.height = previewHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      const rect = { width: canvasRef.current.offsetWidth, height: canvasRef.current.offsetHeight };
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, previewWidth, previewHeight);
      
      const monumentImg = await loadImageWithCORS(monumentImage);
      
      if (monumentImg) {
        // Рассчитываем object-contain
        const imgRatio = monumentImg.width / monumentImg.height;
        const canvasRatio = previewWidth / previewHeight;
        
        let drawWidth = previewWidth;
        let drawHeight = previewHeight;
        let offsetX = 0;
        let offsetY = 0;
        
        if (imgRatio > canvasRatio) {
          drawWidth = previewWidth;
          drawHeight = Math.round(previewWidth / imgRatio);
          offsetY = Math.round((previewHeight - drawHeight) / 2);
        } else {
          drawHeight = previewHeight;
          drawWidth = Math.round(previewHeight * imgRatio);
          offsetX = Math.round((previewWidth - drawWidth) / 2);
        }
        
        ctx.drawImage(monumentImg, offsetX, offsetY, drawWidth, drawHeight);
        
        // Рассчитываем позицию памятника на экране (object-contain)
        const screenRatio = rect.width / rect.height;
        let screenDrawWidth = rect.width;
        let screenDrawHeight = rect.height;
        let screenOffsetX = 0;
        let screenOffsetY = 0;
        
        if (imgRatio > screenRatio) {
          screenDrawWidth = rect.width;
          screenDrawHeight = Math.round(rect.width / imgRatio);
          screenOffsetY = Math.round((rect.height - screenDrawHeight) / 2);
        } else {
          screenDrawHeight = rect.height;
          screenDrawWidth = Math.round(rect.height * imgRatio);
          screenOffsetX = Math.round((rect.width - screenDrawWidth) / 2);
        }
        
        // Масштаб: от экранного памятника к экспортному
        const fontScale = drawWidth / screenDrawWidth;
        
        // Рисуем элементы
        for (const element of elements) {
          ctx.save();
          
          // Координаты в процентах относительно памятника
          const relativeX = (element.x - screenOffsetX) / screenDrawWidth;
          const relativeY = (element.y - screenOffsetY) / screenDrawHeight;
          const relativeWidth = element.width / screenDrawWidth;
          const relativeHeight = element.height / screenDrawHeight;
          
          let scaledX, scaledY, scaledWidth, scaledHeight;
          
          if ((element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates') && !element.autoSize) {
            // Для текста с фиксированной шириной: позиционируем по центру
            const relativeCenterX = (element.x + element.width / 2 - screenOffsetX) / screenDrawWidth;
            const relativeCenterY = (element.y + element.height / 2 - screenOffsetY) / screenDrawHeight;
            
            scaledWidth = Math.round(relativeWidth * drawWidth);
            scaledHeight = Math.round(relativeHeight * drawHeight);
            
            scaledX = Math.round(relativeCenterX * drawWidth + offsetX - scaledWidth / 2);
            scaledY = Math.round(relativeCenterY * drawHeight + offsetY - scaledHeight / 2);
          } else {
            // Для изображений и autoSize текста: по левому краю
            scaledX = Math.round(relativeX * drawWidth + offsetX);
            scaledY = Math.round(relativeY * drawHeight + offsetY);
            scaledWidth = Math.round(relativeWidth * drawWidth);
            scaledHeight = Math.round(relativeHeight * drawHeight);
          }
          
          if (element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates') {
            const parts = element.fontFamily?.split('|') || ['serif', '400'];
            const fontFamily = parts[0];
            const isCustomFont = parts[1] === 'custom';
            let fontWeight: string;
            if (isCustomFont) {
              fontWeight = 'normal';
            } else if (element.type === 'text') {
              fontWeight = parts[1] || 'bold';
            } else {
              fontWeight = parts[1] || '400';
            }
            const scaledFontSize = (element.fontSize || 24) * fontScale;
            const fontStyle = element.italic ? 'italic' : 'normal';
            
            ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px "${fontFamily}"`;
            ctx.fillStyle = element.color || '#FFFFFF';
            
            if (isCustomFont) {
              (ctx as any).fontVariantLigatures = 'common-ligatures discretionary-ligatures';
              (ctx as any).fontFeatureSettings = "'ss01', 'calt', 'swsh', 'liga', 'dlig'";
            }
            
            if (element.letterSpacing) {
              ctx.letterSpacing = `${element.letterSpacing * fontScale}px`;
            } else {
              ctx.letterSpacing = '0px';
            }
            
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4 * fontScale;
            ctx.shadowOffsetX = 2 * fontScale;
            ctx.shadowOffsetY = 2 * fontScale;
            
            let content = element.content || '';
            if (element.type === 'dates') {
              content = content.toUpperCase();
            }
            
            let defaultLineHeight = 1.2;
            if (element.type === 'fio') {
              defaultLineHeight = isCustomFont ? 1.6 : 1.05;
            } else if (element.type === 'epitaph') {
              defaultLineHeight = 1.4;
            }
            
            const lh = element.lineHeight || defaultLineHeight;
            const lineHeight = scaledFontSize * lh;
            
            const hasPadding = element.type !== 'fio';
            const padding = hasPadding ? 4 * fontScale : 0;
            const contentWidth = scaledWidth - padding * 2;
            
            const paragraphs = content.split('\n');
            const allLines: string[] = [];
            
            const wrapWidth = element.autoSize ? Infinity : contentWidth;
            paragraphs.forEach(paragraph => {
              if (paragraph.trim() === '') {
                allLines.push('');
              } else {
                const wrappedLines = wrapText(ctx, paragraph, wrapWidth);
                allLines.push(...wrappedLines);
              }
            });
            
            const textAlign = element.textAlign || 'center';
            
            let effectiveWidth = contentWidth;
            if (element.autoSize) {
              const maxLineWidth = Math.max(...allLines.map(line => ctx.measureText(line).width));
              effectiveWidth = maxLineWidth;
            }
            
            const linePositions = allLines.map(line => {
              const lineWidth = ctx.measureText(line).width;
              let lineX = scaledX;
              
              if (textAlign === 'center') {
                lineX = scaledX + padding + (effectiveWidth - lineWidth) / 2;
              } else if (textAlign === 'right') {
                lineX = scaledX + padding + effectiveWidth - lineWidth;
              }
              
              return { x: lineX, width: lineWidth };
            });
            
            if (element.rotation) {
              const centerX = scaledX + scaledWidth / 2;
              const centerY = scaledY + scaledHeight / 2;
              ctx.translate(centerX, centerY);
              ctx.rotate(element.rotation * Math.PI / 180);
              ctx.translate(-centerX, -centerY);
            }
            
            ctx.textBaseline = 'alphabetic';
            
            const initialScale = element.initialScale || 1.0;
            
            const metrics = ctx.measureText('ЙЦШЩФ');
            const ascent = metrics.actualBoundingBoxAscent || scaledFontSize * 0.8;
            const halfLeading = (lineHeight - scaledFontSize) / 2;
            
            allLines.forEach((line, index) => {
              const lineY = Math.round(scaledY + padding + halfLeading + ascent + index * lineHeight);
              let currentX = Math.round(linePositions[index].x);
              
              if (element.type === 'fio' && initialScale > 1.0 && line.length > 0) {
                const words = line.split(/\s+/);
                
                words.forEach((word, wordIdx) => {
                  if (wordIdx > 0) {
                    const spaceWidth = ctx.measureText(' ').width;
                    currentX += spaceWidth;
                  }
                  
                  if (word.length > 0) {
                    const firstChar = word[0];
                    const rest = word.slice(1);
                    
                    const originalFont = ctx.font;
                    const enlargedSize = scaledFontSize * initialScale;
                    ctx.font = `${fontStyle} ${fontWeight} ${enlargedSize}px "${fontFamily}"`;
                    ctx.fillText(firstChar, currentX, lineY);
                    const firstCharWidth = ctx.measureText(firstChar).width;
                    currentX += firstCharWidth;
                    
                    ctx.font = originalFont;
                    ctx.fillText(rest, currentX, lineY);
                    const restWidth = ctx.measureText(rest).width;
                    currentX += restWidth;
                  }
                });
              } else {
                ctx.fillText(line, currentX, lineY);
              }
            });
            
            // Сбрасываем тень
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
          } else if (element.type === 'image' || element.type === 'cross' || element.type === 'flower' || element.type === 'photo') {
            const imgSrc = (element.screenMode && element.processedSrc) ? element.processedSrc : element.src;
            if (imgSrc) {
              const img = await loadImageWithCORS(imgSrc);
              if (img) {
                // Применяем вращение если есть
                if (element.rotation) {
                  const centerX = scaledX + scaledWidth / 2;
                  const centerY = scaledY + scaledHeight / 2;
                  ctx.translate(centerX, centerY);
                  ctx.rotate(element.rotation * Math.PI / 180);
                  ctx.translate(-centerX, -centerY);
                }
                
                // Для НЕ-фото применяем object-contain
                if (element.type === 'photo') {
                  // Фото: object-cover (заполняем, обрезаем)
                  const imgRatio = img.width / img.height;
                  const boxRatio = scaledWidth / scaledHeight;
                  
                  let drawW = scaledWidth;
                  let drawH = scaledHeight;
                  let drawX = scaledX;
                  let drawY = scaledY;
                  
                  if (imgRatio > boxRatio) {
                    drawW = scaledHeight * imgRatio;
                    drawX = scaledX - (drawW - scaledWidth) / 2;
                  } else {
                    drawH = scaledWidth / imgRatio;
                    drawY = scaledY - (drawH - scaledHeight) / 2;
                  }
                  
                  ctx.save();
                  ctx.rect(scaledX, scaledY, scaledWidth, scaledHeight);
                  ctx.clip();
                  
                  if (element.flipHorizontal) {
                    ctx.translate(drawX + drawW, drawY);
                    ctx.scale(-1, 1);
                    ctx.drawImage(img, 0, 0, drawW, drawH);
                  } else {
                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                  }
                  
                  ctx.restore();
                } else {
                  // Крест, цветы, изображения: object-contain (вписываем, сохраняем пропорции)
                  const imgRatio = img.width / img.height;
                  const boxRatio = scaledWidth / scaledHeight;
                  
                  let drawW = scaledWidth;
                  let drawH = scaledHeight;
                  let drawX = scaledX;
                  let drawY = scaledY;
                  
                  if (imgRatio > boxRatio) {
                    drawH = scaledWidth / imgRatio;
                    drawY = scaledY + (scaledHeight - drawH) / 2;
                  } else {
                    drawW = scaledHeight * imgRatio;
                    drawX = scaledX + (scaledWidth - drawW) / 2;
                  }
                  
                  if (element.flipHorizontal) {
                    ctx.translate(drawX + drawW, drawY);
                    ctx.scale(-1, 1);
                    ctx.drawImage(img, 0, 0, drawW, drawH);
                  } else {
                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                  }
                }
              }
            }
          }
          
          ctx.restore();
        }
      }
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Preview creation error:', error);
      return null;
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
    ]);
  };

  const loadFonts = async (elements: CanvasElement[]): Promise<void> => {
    const uniqueFonts = new Map<string, string>();
    
    elements.forEach(element => {
      if (element.fontFamily && (element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates')) {
        const parts = element.fontFamily.split('|');
        const fontFamily = parts[0];
        const fontType = parts[1];
        const fontUrl = parts[2];
        
        if (fontType === 'custom' && fontUrl) {
          uniqueFonts.set(fontFamily, fontUrl);
        } else {
          uniqueFonts.set(fontFamily, '');
        }
      }
    });
    
    if (uniqueFonts.size === 0) return;
    
    const neededVariants = new Set<string>();
    elements.forEach(element => {
      if (element.fontFamily && (element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates')) {
        const parts = element.fontFamily.split('|');
        const fontFamily = parts[0];
        const fontWeight = parts[1] === 'custom' ? 'normal' : (parts[1] || '400');
        const fontStyle = element.italic ? 'italic' : 'normal';
        neededVariants.add(`${fontStyle}|${fontWeight}|${fontFamily}`);
      }
    });
    
    const fontPromises = Array.from(uniqueFonts).map(async ([family, url]) => {
      try {
        if (url) {
          const fontFace = new FontFace(family, `url(${url})`, {
            featureSettings: "'ss01', 'calt', 'swsh', 'liga', 'dlig'"
          });
          await withTimeout(fontFace.load(), 5000, undefined as unknown as FontFace);
          document.fonts.add(fontFace);
        } else {
          const variants = Array.from(neededVariants)
            .filter(v => v.endsWith(`|${family}`))
            .map(v => {
              const [style, weight] = v.split('|');
              return `${style} ${weight} 24px "${family}"`;
            });
          if (variants.length === 0) variants.push(`400 24px "${family}"`);
          await withTimeout(Promise.all(variants.map(v => document.fonts.load(v))), 5000, []);
        }
      } catch (error) {
        console.warn(`Font load failed ${family}:`, error);
      }
    });
    
    await Promise.all(fontPromises);
  };

  const loadImageWithCORS = async (src: string): Promise<HTMLImageElement | null> => {
    const loadImg = (imgSrc: string, useCors = false): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        if (useCors) img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = imgSrc;
      });
    };

    if (src.startsWith('data:')) {
      return withTimeout(loadImg(src), 10000, null);
    }
    
    if (src.includes('/bucket/')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(src, { signal: controller.signal });
        clearTimeout(timeoutId);
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('FileReader error'));
          reader.readAsDataURL(blob);
        });
        return withTimeout(loadImg(dataUrl), 10000, null);
      } catch {
        return null;
      }
    }
    
    return withTimeout(loadImg(src, true), 10000, null);
  };

  const handlePrintOrder = async () => {
    if (elements.length === 0) {
      toast({
        title: "Пустой дизайн",
        description: "Добавьте элементы на памятник",
        variant: "destructive",
      });
      return;
    }
    const previewDataUrl = await createPreviewImage();
    navigate('/print-order', { state: { previewImage: previewDataUrl } });
  };

  const sendForCalculation = async () => {
    if (isSaving) return;
    if (elements.length === 0) {
      toast({
        title: "Пустой дизайн",
        description: "Добавьте элементы на памятник перед отправкой",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      toast({
        title: "Создание изображения...",
        description: "Пожалуйста, подождите",
      });

      if (!canvasRef.current) {
        throw new Error('Canvas не найден');
      }
      
      await loadFonts(elements);
      
      const canvasEl = canvasRef.current;
      const rect = { width: canvasEl.offsetWidth, height: canvasEl.offsetHeight };
      
      // Экспорт с увеличенным разрешением (3:4 пропорции)
      const exportWidth = 1200;
      const exportHeight = 1600;
      
      const canvasElement = document.createElement('canvas');
      canvasElement.width = exportWidth;
      canvasElement.height = exportHeight;
      
      const ctx = canvasElement.getContext('2d');
      if (!ctx) throw new Error('Не удалось создать контекст Canvas');
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, exportWidth, exportHeight);
      
      console.log('📥 Загружаем изображение памятника:', monumentImage);
      const monumentImg = await loadImageWithCORS(monumentImage);
      
      if (!monumentImg) {
        console.error('❌ Не удалось загрузить изображение памятника');
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, exportWidth, exportHeight);
        ctx.fillStyle = '#666';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Памятник', exportWidth / 2, exportHeight / 2 - 40);
        ctx.font = '32px sans-serif';
        ctx.fillText('(изображение недоступно)', exportWidth / 2, exportHeight / 2 + 40);
        
        toast({
          title: "Ошибка загрузки памятника",
          description: "Попробуйте выбрать другое изображение",
          variant: "destructive",
        });
        return;
      }
      
      console.log('✅ Изображение памятника загружено');
      
      // Рисуем памятник с object-contain
      const imgRatio = monumentImg.width / monumentImg.height;
      const canvasRatio = exportWidth / exportHeight;
      
      let drawWidth = exportWidth;
      let drawHeight = exportHeight;
      let offsetX = 0;
      let offsetY = 0;
      
      if (imgRatio > canvasRatio) {
        drawWidth = exportWidth;
        drawHeight = Math.round(exportWidth / imgRatio);
        offsetY = Math.round((exportHeight - drawHeight) / 2);
      } else {
        drawHeight = exportHeight;
        drawWidth = Math.round(exportHeight * imgRatio);
        offsetX = Math.round((exportWidth - drawWidth) / 2);
      }
      
      ctx.drawImage(monumentImg, offsetX, offsetY, drawWidth, drawHeight);
      
      // Рассчитываем позицию памятника на экране (object-contain)
      const screenRatio = rect.width / rect.height;
      let screenDrawWidth = rect.width;
      let screenDrawHeight = rect.height;
      let screenOffsetX = 0;
      let screenOffsetY = 0;
      
      if (imgRatio > screenRatio) {
        screenDrawWidth = rect.width;
        screenDrawHeight = Math.round(rect.width / imgRatio);
        screenOffsetY = Math.round((rect.height - screenDrawHeight) / 2);
      } else {
        screenDrawHeight = rect.height;
        screenDrawWidth = Math.round(rect.height * imgRatio);
        screenOffsetX = Math.round((rect.width - screenDrawWidth) / 2);
      }
      
      // Масштаб: от экранного памятника к экспортному
      const scale = drawWidth / screenDrawWidth;
      
      console.log('🔍 Параметры (экспорт):', {
        screen: `${rect.width.toFixed(0)}x${rect.height.toFixed(0)}`,
        screenMonument: `${screenDrawWidth.toFixed(0)}x${screenDrawHeight.toFixed(0)} offset(${screenOffsetX.toFixed(0)},${screenOffsetY.toFixed(0)})`,
        export: `${exportWidth}x${exportHeight}`,
        exportMonument: `${drawWidth.toFixed(0)}x${drawHeight.toFixed(0)} offset(${offsetX.toFixed(0)},${offsetY.toFixed(0)})`,
        scale: scale.toFixed(3)
      });
      
      // Рисуем элементы
      for (const element of elements) {
        ctx.save();
        
        const relativeX = (element.x - screenOffsetX) / screenDrawWidth;
        const relativeY = (element.y - screenOffsetY) / screenDrawHeight;
        const relativeWidth = element.width / screenDrawWidth;
        const relativeHeight = element.height / screenDrawHeight;
        
        let scaledX, scaledY, scaledWidth, scaledHeight;
        
        if ((element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates') && !element.autoSize) {
          const relativeCenterX = (element.x - screenOffsetX + element.width / 2) / screenDrawWidth;
          const relativeCenterY = (element.y - screenOffsetY + element.height / 2) / screenDrawHeight;
          
          scaledWidth = Math.round(relativeWidth * drawWidth);
          scaledHeight = Math.round(relativeHeight * drawHeight);
          
          scaledX = Math.round(offsetX + relativeCenterX * drawWidth - scaledWidth / 2);
          scaledY = Math.round(offsetY + relativeCenterY * drawHeight - scaledHeight / 2);
        } else {
          scaledX = Math.round(offsetX + relativeX * drawWidth);
          scaledY = Math.round(offsetY + relativeY * drawHeight);
          scaledWidth = Math.round(relativeWidth * drawWidth);
          scaledHeight = Math.round(relativeHeight * drawHeight);
        }
        
        const fontScale = drawWidth / screenDrawWidth;
        
        if (element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates') {
          const parts = element.fontFamily?.split('|') || ['serif', '400'];
          const fontFamily = parts[0];
          const isCustomFont = parts[1] === 'custom';
          let fontWeight: string;
          if (isCustomFont) {
            fontWeight = 'normal';
          } else if (element.type === 'text') {
            fontWeight = parts[1] || 'bold';
          } else {
            fontWeight = parts[1] || '400';
          }
          const scaledFontSize = (element.fontSize || 24) * fontScale;
          const fontStyle = element.italic ? 'italic' : 'normal';
          ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px "${fontFamily}"`;
          ctx.fillStyle = element.color || '#FFFFFF';
          
          if (isCustomFont) {
            (ctx as any).fontVariantLigatures = 'common-ligatures discretionary-ligatures';
            (ctx as any).fontFeatureSettings = "'ss01', 'calt', 'swsh', 'liga', 'dlig'";
          }
          
          if (element.letterSpacing) {
            ctx.letterSpacing = `${element.letterSpacing * fontScale}px`;
          } else {
            ctx.letterSpacing = '0px';
          }
          
          let defaultLineHeight = 1.2;
          if (element.type === 'fio') {
            defaultLineHeight = isCustomFont ? 1.6 : 1.05;
          } else if (element.type === 'epitaph') {
            defaultLineHeight = 1.4;
          }
          
          const lh = element.lineHeight || defaultLineHeight;
          const lineHeight = scaledFontSize * lh;
          
          const hasPadding = element.type !== 'fio';
          const padding = hasPadding ? 4 * fontScale : 0;
          const contentWidth = scaledWidth - padding * 2;
          
          let textContent = element.content || '';
          if (element.type === 'dates') {
            textContent = textContent.toUpperCase();
          }
          const paragraphs = textContent.split('\n');
          const allLines: string[] = [];
          
          const wrapWidth = element.autoSize ? Infinity : contentWidth;
          paragraphs.forEach(paragraph => {
            if (paragraph.trim() === '') {
              allLines.push('');
            } else {
              const wrappedLines = wrapText(ctx, paragraph, wrapWidth);
              allLines.push(...wrappedLines);
            }
          });
          
          const textAlign = element.textAlign || 'center';
          
          const maxLineWidth = Math.max(...allLines.map(line => ctx.measureText(line).width), 1);
          const effectiveWidth = element.autoSize ? maxLineWidth : contentWidth;
          
          const linePositions = allLines.map((line) => {
            const lineWidth = ctx.measureText(line).width;
            let lineX = scaledX;
            
            if (textAlign === 'center') {
              lineX = scaledX + padding + (effectiveWidth - lineWidth) / 2;
            } else if (textAlign === 'right') {
              lineX = scaledX + padding + effectiveWidth - lineWidth;
            }
            
            return { x: lineX, width: lineWidth };
          });
          
          ctx.textBaseline = 'alphabetic';
          
          if (element.rotation) {
            const centerX = scaledX + scaledWidth / 2;
            const centerY = scaledY + scaledHeight / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(element.rotation * Math.PI / 180);
            ctx.translate(-centerX, -centerY);
          }
          
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4 * fontScale;
          ctx.shadowOffsetX = 2 * fontScale;
          ctx.shadowOffsetY = 2 * fontScale;
          
          const initialScale = element.initialScale || 1.0;
          
          const metrics = ctx.measureText('ЙЦШЩФ');
          const ascent = metrics.actualBoundingBoxAscent || scaledFontSize * 0.8;
          const halfLeading = (lineHeight - scaledFontSize) / 2;
          
          allLines.forEach((line, idx) => {
            const lineY = Math.round(scaledY + padding + halfLeading + ascent + idx * lineHeight);
            let currentX = Math.round(linePositions[idx].x);
            
            // Если есть увеличение первой буквы (для FIO)
            if (element.type === 'fio' && initialScale > 1.0 && line.length > 0) {
              const words = line.split(/\s+/);
              
              words.forEach((word, wordIdx) => {
                if (wordIdx > 0) {
                  const spaceWidth = ctx.measureText(' ').width;
                  currentX += spaceWidth;
                }
                
                if (word.length > 0) {
                  const firstChar = word[0];
                  const rest = word.slice(1);
                  
                  // Рисуем первую букву увеличенной
                  const originalFont = ctx.font;
                  const enlargedSize = scaledFontSize * initialScale;
                  ctx.font = `${fontStyle} ${fontWeight} ${enlargedSize}px "${fontFamily}"`;
                  ctx.fillText(firstChar, currentX, lineY);
                  const firstCharWidth = ctx.measureText(firstChar).width;
                  currentX += firstCharWidth;
                  
                  // Возвращаем обычный размер
                  ctx.font = originalFont;
                  ctx.fillText(rest, currentX, lineY);
                  const restWidth = ctx.measureText(rest).width;
                  currentX += restWidth;
                }
              });
            } else {
              ctx.fillText(line, currentX, lineY);
            }
          });
          
          // Сбрасываем тень
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
        } else if (element.type === 'image' || element.type === 'cross' || element.type === 'flower' || element.type === 'photo') {
          const imgSrc = (element.screenMode && element.processedSrc) ? element.processedSrc : element.src;
          if (imgSrc) {
            const img = await loadImageWithCORS(imgSrc);
            if (img) {
              // Применяем вращение если есть
              if (element.rotation) {
                const centerX = scaledX + scaledWidth / 2;
                const centerY = scaledY + scaledHeight / 2;
                ctx.translate(centerX, centerY);
                ctx.rotate(element.rotation * Math.PI / 180);
                ctx.translate(-centerX, -centerY);
              }
              
              // Для НЕ-фото применяем object-contain
              if (element.type === 'photo') {
                // Фото: object-cover (заполняем, обрезаем)
                const imgRatio = img.width / img.height;
                const boxRatio = scaledWidth / scaledHeight;
                
                let drawW = scaledWidth;
                let drawH = scaledHeight;
                let drawX = scaledX;
                let drawY = scaledY;
                
                if (imgRatio > boxRatio) {
                  // Изображение шире - обрезаем по бокам
                  drawW = scaledHeight * imgRatio;
                  drawX = scaledX - (drawW - scaledWidth) / 2;
                } else {
                  // Изображение выше - обрезаем сверху/снизу
                  drawH = scaledWidth / imgRatio;
                  drawY = scaledY - (drawH - scaledHeight) / 2;
                }
                
                ctx.save();
                ctx.rect(scaledX, scaledY, scaledWidth, scaledHeight);
                ctx.clip();
                
                if (element.flipHorizontal) {
                  ctx.translate(drawX + drawW, drawY);
                  ctx.scale(-1, 1);
                  ctx.drawImage(img, 0, 0, drawW, drawH);
                } else {
                  ctx.drawImage(img, drawX, drawY, drawW, drawH);
                }
                
                ctx.restore();
              } else {
                // Крест, цветы, изображения: object-contain (вписываем, сохраняем пропорции)
                const imgRatio = img.width / img.height;
                const boxRatio = scaledWidth / scaledHeight;
                
                let drawW = scaledWidth;
                let drawH = scaledHeight;
                let drawX = scaledX;
                let drawY = scaledY;
                
                if (imgRatio > boxRatio) {
                  // Изображение шире - вписываем по ширине
                  drawH = scaledWidth / imgRatio;
                  drawY = scaledY + (scaledHeight - drawH) / 2;
                } else {
                  // Изображение выше - вписываем по высоте
                  drawW = scaledHeight * imgRatio;
                  drawX = scaledX + (scaledWidth - drawW) / 2;
                }
                
                if (element.flipHorizontal) {
                  ctx.translate(drawX + drawW, drawY);
                  ctx.scale(-1, 1);
                  ctx.drawImage(img, 0, 0, drawW, drawH);
                } else {
                  ctx.drawImage(img, drawX, drawY, drawW, drawH);
                }
              }
            }
          }
        }
        
        ctx.restore();
      }
      
      console.log('🎨 Конвертируем canvas в PNG...');
      const imgData = canvasElement.toDataURL('image/png');
      const fileName = `monument_design_${Date.now()}.png`;
      
      console.log('💾 Скачиваем файл:', fileName);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = fileName;
      link.click();
      
      console.log('✅ PNG успешно создан и скачан');
      
      toast({
        title: "Изображение сохранено!",
        description: `PNG файл (${exportWidth}x${exportHeight}px) скачан на устройство`,
      });
    } catch (error) {
      console.error('❌ Ошибка создания изображения:', error);
      toast({
        title: "Ошибка создания изображения",
        description: error instanceof Error ? error.message : "Попробуйте ещё раз",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedEl = elements.find(el => el.id === selectedElement);

  const handleCanvasDoubleClick = () => {
    // Просто переключаем зум
    setCanvasZoom(canvasZoom === 1 ? 2 : 1);
    // Сбрасываем панорамирование при изменении зума
    setCanvasPan({ x: 0, y: 0 });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Начинаем панорамирование, если canvas увеличен и клик на фоне
    if (canvasZoom > 1 && !selectedElement) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - canvasPan.x,
        y: e.clientY - canvasPan.y
      });
    }
  };

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    // Если два пальца на пустом canvas (нет выбранного элемента) - начинаем зум
    if (e.touches.length === 2 && !selectedElement) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      setCanvasPinchStart({ distance, zoom: canvasZoom });
    } else if (e.touches.length === 1 && canvasZoom > 1 && !selectedElement) {
      // Один палец при увеличении - начинаем панорамирование
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({
        x: touch.clientX - canvasPan.x,
        y: touch.clientY - canvasPan.y
      });
    }
  };

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

      <div className="lg:h-[calc(100vh-73px)]">
        <div className="container mx-auto px-4 py-4 h-full">
        <div className="grid lg:grid-cols-[320px,1fr,320px] gap-6 h-full pb-24 md:pb-0">
          <div className="lg:h-full lg:overflow-y-auto pb-4">
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
            fonts={fonts}
            crosses={crosses}
            isLoadingCrosses={isLoadingCrosses}
            loadCrosses={loadCrosses}
            flowers={flowers}
            isLoadingFlowers={isLoadingFlowers}
            loadFlowers={loadFlowers}
            />
          </div>

          <ConstructorCanvas
            canvasRef={canvasRef}
            monumentImage={monumentImage}
            elements={elements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            rotateMode={rotateMode}
            handleMouseDown={handleMouseDown}
            handleTouchStart={handleTouchStart}
            handleDoubleClick={handleDoubleClick}
            handleSingleClick={handleSingleClick}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            handleResizeMouseDown={handleResizeMouseDown}
            handleResizeTouchStart={handleResizeTouchStart}
            toggleRotateMode={toggleRotateMode}
            setElements={setElements}
            saveDesign={saveDesign}
            sendForCalculation={sendForCalculation}
            exportDesign={exportDesign}
            exportDesignAsPNG={exportDesignAsPNG}
            isSaving={isSaving}
            importDesign={importDesign}
            importInputRef={importInputRef}
            inlineEditingId={inlineEditingId}
            handleInlineTextChange={handleInlineTextChange}
            handleInlineEditBlur={handleInlineEditBlur}
            canvasZoom={canvasZoom}
            onCanvasDoubleClick={handleCanvasDoubleClick}
            onCanvasTouchStart={handleCanvasTouchStart}
            canvasPan={canvasPan}
            onCanvasMouseDown={handleCanvasMouseDown}
            updateElement={updateElement}
            onPrintOrder={handlePrintOrder}
          />

          <div className="lg:h-full lg:overflow-y-auto pb-4">
            <ConstructorProperties
              selectedEl={selectedEl}
              updateElement={updateElement}
              deleteElement={deleteElement}
              fonts={fonts}
              onEditImage={handleEditImage}
            />
          </div>
        </div>
        </div>
      </div>
      
      <TextEditorModal
        isOpen={isTextEditorOpen}
        onClose={() => {
          setIsTextEditorOpen(false);
          setEditingElement(null);
        }}
        editingElement={editingElement}
        setEditingElement={setEditingElement}
        onApply={(updates) => {
          if (editingElement) {
            updateElement(editingElement.id, updates);
            setIsTextEditorOpen(false);
            setEditingElement(null);
          }
        }}
        fonts={fonts}
      />

      <ImageEraser
        isOpen={isImageEraserOpen}
        onClose={() => {
          setIsImageEraserOpen(false);
          setEditingImageId(null);
        }}
        imageUrl={editingImageUrl}
        onSave={handleSaveEditedImage}
      />

      <MobileToolbar
        selectedEl={selectedEl}
        updateElement={updateElement}
        deleteElement={deleteElement}
        fonts={fonts}
        onOpenEraser={() => {
          if (selectedElement) {
            console.log('📝 MobileToolbar вызвал onOpenEraser для элемента:', selectedElement);
            handleEditImage(selectedElement);
          }
        }}
        canErase={!!selectedEl && (selectedEl.type === 'image' || selectedEl.type === 'photo' || selectedEl.type === 'cross' || selectedEl.type === 'flower')}
      />
    </div>
  );
};

export default Constructor;