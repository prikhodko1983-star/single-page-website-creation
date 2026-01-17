import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  desc: string;
}

const Gallery = () => {
  const navigate = useNavigate();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const defaultGalleryItems: GalleryItem[] = [
    { id: '1', type: 'image', url: 'https://cdn.poehali.dev/files/bbcac88c-6deb-429e-b227-40488c7c5273.jpg', title: 'Комплексное благоустройство', desc: 'Установка памятников и уход за территорией' },
    { id: '2', type: 'image', url: 'https://cdn.poehali.dev/files/58ba923f-a428-4ebd-a17d-2cd8e5b523a8.jpg', title: 'Художественная гравировка', desc: 'Индивидуальный дизайн и качественное исполнение' },
    { id: '3', type: 'image', url: 'https://cdn.poehali.dev/files/c80c1bd4-c413-425a-a1fc-91dbb36a8de4.jpg', title: 'Горизонтальные памятники', desc: 'Классический дизайн из чёрного гранита' },
    { id: '4', type: 'image', url: 'https://cdn.poehali.dev/files/692de6e1-c8ae-42f8-ac61-0d8770aeb8ec.png', title: 'Вертикальные памятники', desc: 'Традиционная форма, проверенная временем' },
    { id: '5', type: 'image', url: 'https://cdn.poehali.dev/files/a6e29eb2-0f18-47ca-917e-adac360db4c3.jpeg', title: 'Эксклюзивные проекты', desc: 'Уникальный дизайн по индивидуальному заказу' },
    { id: '6', type: 'image', url: 'https://cdn.poehali.dev/files/e1b733d5-8a5c-4f60-9df4-9e05bb711cf9.jpeg', title: 'Комплексы на могилу', desc: 'Полное обустройство с оградой и цветником' }
  ];

  useEffect(() => {
    const savedGallery = localStorage.getItem('galleryItems');
    if (savedGallery) {
      try {
        const parsed = JSON.parse(savedGallery);
        if (parsed.length > 0) {
          setGalleryItems(parsed);
        } else {
          setGalleryItems(defaultGalleryItems);
        }
      } catch (e) {
        console.error('Error loading gallery items:', e);
        setGalleryItems(defaultGalleryItems);
      }
    } else {
      setGalleryItems(defaultGalleryItems);
    }

    const handleGalleryUpdate = () => {
      const updated = localStorage.getItem('galleryItems');
      if (updated) {
        try {
          const parsed = JSON.parse(updated);
          setGalleryItems(parsed.length > 0 ? parsed : defaultGalleryItems);
        } catch (e) {
          setGalleryItems(defaultGalleryItems);
        }
      }
    };

    window.addEventListener('galleryUpdated', handleGalleryUpdate);
    return () => window.removeEventListener('galleryUpdated', handleGalleryUpdate);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedImage]);

  useEffect(() => {
    document.title = "Галерея работ - Гранит Мастер";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад на главную
            </Button>
            
            <h1 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
              Галерея наших работ
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Полная коллекция выполненных проектов — качество, которому доверяют
            </p>
          </div>

          <div className="masonry-gallery max-w-7xl mx-auto">
            {galleryItems.map((item, idx) => (
              <img 
                key={idx}
                src={item.url}
                alt={item.title}
                onClick={() => setSelectedImage(item.url)}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-oswald text-lg px-8"
              onClick={() => navigate('/')}
            >
              <Icon name="Phone" className="mr-2" size={20} />
              ОБСУДИТЬ ВАШ ПРОЕКТ
            </Button>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-primary transition-colors z-10"
          >
            <Icon name="X" size={32} />
          </button>
          <img 
            src={selectedImage}
            alt="Полноэкранный просмотр"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;
