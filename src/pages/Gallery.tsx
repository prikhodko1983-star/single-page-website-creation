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

  const GALLERY_API = "https://functions.poehali.dev/16b2bcd1-9c80-4d3e-96c6-0aaaac12c483";

  useEffect(() => {
    // Загружаем галерею из API
    const loadGallery = () => {
      fetch(GALLERY_API)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setGalleryItems(data);
          }
        })
        .catch(err => {
          console.error('Error loading gallery items:', err);
        });
    };

    loadGallery();

    // Слушаем обновления галереи
    const handleGalleryUpdate = () => {
      loadGallery();
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