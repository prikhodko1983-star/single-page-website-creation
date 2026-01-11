import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ConstructorLibrary } from "@/components/constructor/ConstructorLibrary";
import { ConstructorCanvas } from "@/components/constructor/ConstructorCanvas";
import { ConstructorProperties } from "@/components/constructor/ConstructorProperties";
import { TextEditorModal } from "@/components/constructor/TextEditorModal";
import { MobileToolbar } from "@/components/constructor/MobileToolbar";

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
  const [monumentImageBase64, setMonumentImageBase64] = useState<string | null>(null);
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

  const handleSetMonumentImage = async (src: string, base64?: string | null) => {
    setMonumentImage(src);
    
    if (base64) {
      setMonumentImageBase64(base64);
    } else if (src.startsWith('data:')) {
      setMonumentImageBase64(src);
    } else {
      // URL изображения - конвертируем в base64 для экспорта
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const promise = new Promise<string | null>((resolve) => {
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                const base64Data = canvas.toDataURL('image/png');
                resolve(base64Data);
              } else {
                resolve(null);
              }
            } catch (error) {
              console.warn('⚠️ Не удалось конвертировать в base64:', error);
              resolve(null);
            }
          };
          
          img.onerror = () => {
            console.warn('⚠️ Не удалось загрузить изображение для base64');
            resolve(null);
          };
          
          img.src = src;
        });
        
        const base64Data = await promise;
        if (base64Data) {
          console.log('✅ URL конвертирован в base64 для экспорта, размер:', Math.round(base64Data.length / 1024), 'KB');
          setMonumentImageBase64(base64Data);
          toast({
            title: "Памятник готов к экспорту",
            description: "Base64 версия создана успешно",
          });
        } else {
          console.warn('⚠️ Не удалось создать base64, экспорт может не сработать');
          setMonumentImageBase64(null);
          toast({
            title: "Предупреждение",
            description: "Не удалось подготовить памятник для экспорта",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('❌ Ошибка конвертации:', error);
        setMonumentImageBase64(null);
      }
    }
  };

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
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
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
      
      const rotation = rotateStart.rotation + (angle - startAngle);
      
      setElements(elements.map(el => 
        el.id === selectedElement 
          ? { ...el, rotation: Math.round(rotation) }
          : el
      ));
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = Math.max(30, resizeStart.height + deltaY);
      
      const element = elements.find(el => el.id === selectedElement);
      if (element && (element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates')) {
        // Используем минимальное соотношение, чтобы текст всегда помещался
        const scaleRatio = Math.min(newWidth / resizeStart.width, newHeight / resizeStart.height);
        const newFontSize = Math.max(8, Math.min(72, Math.round(resizeStart.fontSize * scaleRatio)));
        
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
      
      const rotation = rotateStart.rotation + (angle - startAngle);
      
      setElements(elements.map(el => 
        el.id === selectedElement 
          ? { ...el, rotation: Math.round(rotation) }
          : el
      ));
    } else if (isResizing) {
      const deltaX = touch.clientX - resizeStart.x;
      const deltaY = touch.clientY - resizeStart.y;
      const newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = Math.max(30, resizeStart.height + deltaY);
      
      const element = elements.find(el => el.id === selectedElement);
      if (element && (element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates')) {
        // Используем минимальное соотношение, чтобы текст всегда помещался
        const scaleRatio = Math.min(newWidth / resizeStart.width, newHeight / resizeStart.height);
        const newFontSize = Math.max(8, Math.min(72, Math.round(resizeStart.fontSize * scaleRatio)));
        
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
    if (elements.length === 0) {
      toast({
        title: "Пустой дизайн",
        description: "Добавьте элементы на памятник",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('📦 Начинаем экспорт в PNG с метаданными (ComfyUI style)');
      
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
      
      console.log('💾 Скачиваем PNG с метаданными:', fileName);
      
      // Пробуем Web Share API для мобильных (сохранение в галерею)
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], fileName)] })) {
        try {
          await navigator.share({
            files: [new File([blob], fileName, { type: 'image/png' })],
            title: 'Мой памятник',
            text: 'Сохраните это изображение'
          });
          console.log('✅ Поделились через Share API');
          toast({
            title: "Готово!",
            description: "Сохраните изображение в галерею",
          });
          return;
        } catch (shareError) {
          console.log('⚠️ Share API отменен/недоступен:', shareError);
          // Fallback на обычную загрузку
        }
      }
      
      // Fallback: обычная загрузка в папку Downloads
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      try {
        link.click();
        console.log('✅ PNG: click() вызван');
      } catch (clickError) {
        console.error('❌ Ошибка click():', clickError);
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        link.dispatchEvent(event);
        console.log('✅ PNG: dispatchEvent() вызван');
      }
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 1000);
      
      toast({
        title: "PNG с метаданными готов",
        description: "Данные встроены в изображение",
      });
      
      console.log('🎉 Экспорт в PNG завершен');
    } catch (error) {
      console.error('❌ Export error:', error);
      toast({
        title: "Ошибка экспорта PNG",
        description: String(error),
        variant: "destructive",
      });
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
      
      const rect = canvasRef.current.getBoundingClientRect();
      
      // Черный фон
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, previewWidth, previewHeight);
      
      // Загружаем изображение памятника
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
            const fontWeight = parts[1] === 'custom' ? 'normal' : (parts[1] || '400');
            const scaledFontSize = (element.fontSize || 24) * fontScale;
            const fontStyle = element.italic ? 'italic' : 'normal';
            
            const actualFontSize = scaledFontSize;
            
            ctx.font = `${fontStyle} ${fontWeight} ${actualFontSize}px "${fontFamily}"`;
            ctx.fillStyle = element.color || '#FFFFFF';
            
            // OpenType features для декоративных шрифтов
            if (parts[1] === 'custom') {
              (ctx as any).fontVariantLigatures = 'common-ligatures discretionary-ligatures';
              (ctx as any).fontFeatureSettings = "'ss01', 'calt', 'swsh', 'liga', 'dlig'";
            }
            
            // Применяем letterSpacing
            if (element.letterSpacing) {
              ctx.letterSpacing = `${element.letterSpacing * fontScale}px`;
            } else {
              ctx.letterSpacing = '0px';
            }
            
            // Поддержка выравнивания текста
            // Тень для читаемости
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4 * fontScale;
            ctx.shadowOffsetX = 2 * fontScale;
            ctx.shadowOffsetY = 2 * fontScale;
            
            // Поддержка многострочного текста с автопереносом
            const content = element.content || '';
            
            // Разные дефолтные lineHeight для разных типов
            let defaultLineHeight = 1.2;
            if (element.type === 'fio') defaultLineHeight = 1.05;
            else if (element.type === 'epitaph') defaultLineHeight = 1.4;
            
            const lh = element.lineHeight || defaultLineHeight;
            const lineHeight = scaledFontSize * lh;
            
            // Обрабатываем многострочный текст с переносами
            const paragraphs = content.split('\n');
            const allLines: string[] = [];
            
            paragraphs.forEach(paragraph => {
              if (paragraph.trim() === '') {
                allLines.push('');
              } else {
                const wrappedLines = wrapText(ctx, paragraph, scaledWidth);
                allLines.push(...wrappedLines);
              }
            });
            
            // Измеряем ширину строк и позиционируем
            const textAlign = element.textAlign || 'center';
            
            // Для autoSize используем максимальную ширину строки
            let effectiveWidth = scaledWidth;
            if (element.autoSize) {
              const maxLineWidth = Math.max(...allLines.map(line => ctx.measureText(line).width));
              effectiveWidth = maxLineWidth;
            }
            
            const linePositions = allLines.map(line => {
              const lineWidth = ctx.measureText(line).width;
              let lineX = scaledX;
              
              if (textAlign === 'center') {
                lineX = scaledX + (effectiveWidth - lineWidth) / 2;
              } else if (textAlign === 'right') {
                lineX = scaledX + effectiveWidth - lineWidth;
              }
              
              return { x: lineX, width: lineWidth };
            });
            
            // Применяем вращение если есть
            if (element.rotation) {
              const centerX = scaledX + scaledWidth / 2;
              const centerY = scaledY + scaledHeight / 2;
              ctx.translate(centerX, centerY);
              ctx.rotate(element.rotation * Math.PI / 180);
              ctx.translate(-centerX, -centerY);
            }
            
            // Рисуем строки с предварительно рассчитанными координатами
            ctx.textBaseline = 'alphabetic';
            
            const initialScale = element.initialScale || 1.0;
            
            // Рисуем от верхнего края (контейнер уже отцентрован)
            allLines.forEach((line, index) => {
              // Для alphabetic baseline добавляем высоту шрифта к Y
              const lineY = Math.round(scaledY + scaledFontSize + index * lineHeight);
              let currentX = Math.round(linePositions[index].x);
              
              // Если есть увеличение первой буквы (для FIO)
              if (element.type === 'fio' && initialScale > 1.0 && line.length > 0) {
                const words = line.split(/\s+/);
                
                words.forEach((word, wordIdx) => {
                  if (wordIdx > 0) {
                    // Рисуем пробел
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
                    
                    // Возвращаем обычный размер для остального текста
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
    
    const fontPromises = Array.from(uniqueFonts).map(async ([family, url]) => {
      try {
        if (url) {
          const fontFace = new FontFace(family, `url(${url})`, {
            featureSettings: "'ss01', 'calt', 'swsh', 'liga', 'dlig'"
          });
          await fontFace.load();
          document.fonts.add(fontFace);
          console.log(`✅ Загружен кастомный шрифт с OpenType: ${family}`);
        } else {
          await document.fonts.load(`400 24px "${family}"`);
          console.log(`✅ Загружен системный шрифт: ${family}`);
        }
      } catch (error) {
        console.warn(`⚠️ Не удалось загрузить шрифт ${family}:`, error);
      }
    });
    
    await Promise.all(fontPromises);
    console.log('✅ Все шрифты загружены для экспорта');
  };

  const loadImageWithCORS = async (src: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      
      if (!src.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onload = () => {
        console.log('✅ Изображение загружено успешно:', src);
        resolve(img);
      };
      
      img.onerror = (error) => {
        console.error('❌ Ошибка загрузки изображения:', src, error);
        resolve(null);
      };
      
      img.src = src;
    });
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

      if (!canvasRef.current) {
        console.error('❌ canvasRef не найден');
        return;
      }
      
      // Загружаем шрифты перед экспортом
      await loadFonts(elements);
      
      // Получаем реальные размеры canvas на экране
      const rect = canvasRef.current.getBoundingClientRect();
      
      // Экспорт с увеличенным разрешением (3:4 пропорции)
      const exportWidth = 1200;
      const exportHeight = 1600;
      
      const canvasElement = document.createElement('canvas');
      canvasElement.width = exportWidth;
      canvasElement.height = exportHeight;
      
      const ctx = canvasElement.getContext('2d');
      if (!ctx) return;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, exportWidth, exportHeight);
      
      // Попытка 1: Используем base64 версию (если есть - для загруженных изображений)
      let monumentImg: HTMLImageElement | null = null;
      
      if (monumentImageBase64) {
        console.log('✅ Используем base64 версию памятника');
        monumentImg = await loadImageWithCORS(monumentImageBase64);
      } else {
        // Попытка 2: Берём изображение из canvas напрямую
        const canvasImg = document.querySelector('.relative.w-full.h-full.overflow-hidden img') as HTMLImageElement;
        
        if (canvasImg && canvasImg.complete && canvasImg.naturalWidth > 0) {
          console.log('✅ Используем изображение из DOM');
          monumentImg = canvasImg;
        } else {
          // Попытка 3: Загружаем через loadImageWithCORS
          console.log('📥 Загружаем изображение памятника:', monumentImage);
          monumentImg = await loadImageWithCORS(monumentImage);
        }
      }
      
      if (!monumentImg) {
        console.error('❌ Не удалось загрузить изображение памятника');
        toast({
          title: "Ошибка загрузки памятника",
          description: "Изображение недоступно, попробуйте другое",
          variant: "destructive",
        });
        return;
      }
      
      console.log('✅ Изображение памятника готово к экспорту');
      
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
        
        // Координаты элемента нормализуем к ВСЕМУ CANVAS, а не только к памятнику
        const relativeX = element.x / rect.width;  // 0..1 от всей ширины canvas
        const relativeY = element.y / rect.height; // 0..1 от всей высоты canvas
        const relativeWidth = element.width / rect.width;
        const relativeHeight = element.height / rect.height;
        
        // Применяем проценты к ЭКСПОРТНОМУ canvas
        let scaledX, scaledY, scaledWidth, scaledHeight;
        
        if ((element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates') && !element.autoSize) {
          // Для текста с фиксированной шириной: позиционируем по центру контейнера
          const relativeCenterX = (element.x + element.width / 2) / rect.width;
          const relativeCenterY = (element.y + element.height / 2) / rect.height;
          
          scaledWidth = Math.round(relativeWidth * exportWidth);
          scaledHeight = Math.round(relativeHeight * exportHeight);
          
          scaledX = Math.round(relativeCenterX * exportWidth - scaledWidth / 2);
          scaledY = Math.round(relativeCenterY * exportHeight - scaledHeight / 2);
        } else {
          // Для изображений и autoSize текста: позиционируем по левому краю
          scaledX = Math.round(relativeX * exportWidth);
          scaledY = Math.round(relativeY * exportHeight);
          scaledWidth = Math.round(relativeWidth * exportWidth);
          scaledHeight = Math.round(relativeHeight * exportHeight);
        }
        
        // Масштабируем fontSize пропорционально изменению размера ВСЕГО canvas
        const fontScale = exportWidth / rect.width;
        
        if (element.type === 'text' || element.type === 'epitaph' || element.type === 'fio' || element.type === 'dates') {
          const parts = element.fontFamily?.split('|') || ['serif', '400'];
          const fontFamily = parts[0];
          const fontWeight = parts[1] === 'custom' ? 'normal' : (parts[1] || '400');
          const scaledFontSize = (element.fontSize || 24) * fontScale;
          const fontStyle = element.italic ? 'italic' : 'normal';
          ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px "${fontFamily}"`;
          ctx.fillStyle = element.color || '#FFFFFF';
          
          // Применяем letterSpacing
          if (element.letterSpacing) {
            ctx.letterSpacing = `${element.letterSpacing * fontScale}px`;
          } else {
            ctx.letterSpacing = '0px';
          }
          
          // Разные дефолтные lineHeight для разных типов
          let defaultLineHeight = 1.2;
          if (element.type === 'fio') defaultLineHeight = 1.05;
          else if (element.type === 'epitaph') defaultLineHeight = 1.4;
          
          const lh = element.lineHeight || defaultLineHeight;
          const lineHeight = scaledFontSize * lh;
          
          // Обрабатываем многострочный текст с переносами
          const paragraphs = element.content?.split('\n') || [];
          const allLines: string[] = [];
          
          paragraphs.forEach(paragraph => {
            // Просто добавляем каждый параграф как отдельную строку
            // НЕ делаем автоматический перенос по ширине
            allLines.push(paragraph);
          });
          
          // Измеряем ширину строк и позиционируем
          const textAlign = element.textAlign || 'center';
          
          // Используем максимальную ширину строки для выравнивания
          const maxLineWidth = Math.max(...allLines.map(line => ctx.measureText(line).width), 1);
          const effectiveWidth = element.autoSize ? maxLineWidth : scaledWidth;
          
          const linePositions = allLines.map((line) => {
            const lineWidth = ctx.measureText(line).width;
            let lineX = scaledX;
            
            if (textAlign === 'center') {
              lineX = scaledX + (effectiveWidth - lineWidth) / 2;
            } else if (textAlign === 'right') {
              lineX = scaledX + effectiveWidth - lineWidth;
            }
            
            return { x: lineX, width: lineWidth };
          });
          
          // Рисуем строки с предварительно рассчитанными координатами
          ctx.textBaseline = 'alphabetic';
          
          // Применяем вращение ПЕРЕД отрисовкой текста
          if (element.rotation) {
            // Вращаем вокруг центра контейнера элемента
            const centerX = scaledX + scaledWidth / 2;
            const centerY = scaledY + scaledHeight / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(element.rotation * Math.PI / 180);
            ctx.translate(-centerX, -centerY);
          }
          
          // Применяем shadow ТОЛЬКО перед отрисовкой
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 8 * fontScale;
          ctx.shadowOffsetX = 2 * fontScale;
          ctx.shadowOffsetY = 2 * fontScale;
          
          const initialScale = element.initialScale || 1.0;
          
          // Измеряем метрики шрифта для точного позиционирования
          const metrics = ctx.measureText('ЙЦШЩФ');
          const ascent = metrics.actualBoundingBoxAscent || scaledFontSize * 0.8;
          
          // Браузер добавляет половину inter-line spacing сверху первой строки
          const halfLeading = (lineHeight - scaledFontSize) / 2;
          
          // Рисуем строки с учетом реальных метрик DOM
          allLines.forEach((line, idx) => {
            // Baseline = верх контейнера + половина leading + ascent + смещение на lineHeight для следующих строк
            const lineY = Math.round(scaledY + halfLeading + ascent + idx * lineHeight);
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

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="grid lg:grid-cols-[320px,1fr,320px] gap-6 items-start">
          <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <ConstructorLibrary
            monumentImage={monumentImage}
            setMonumentImage={handleSetMonumentImage}
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
          />

          <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <ConstructorProperties
              selectedEl={selectedEl}
              updateElement={updateElement}
              deleteElement={deleteElement}
              fonts={fonts}
            />
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
      />

      <MobileToolbar
        selectedEl={selectedEl}
        updateElement={updateElement}
        deleteElement={deleteElement}
        fonts={fonts}
      />
    </div>
  );
};

export default Constructor;