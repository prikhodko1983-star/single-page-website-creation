import { useState, useEffect } from 'react';

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  desc: string;
}

const GALLERY_API = 'https://functions.poehali.dev/16b2bcd1-9c80-4d3e-96c6-0aaaac12c483';

const GallerySection = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await fetch(GALLERY_API);
        if (response.ok) {
          const items = await response.json();
          setGalleryItems(items);
        }
      } catch (e) {
        console.error('Error loading gallery items:', e);
      } finally {
        setLoading(false);
      }
    };

    loadGallery();

    const handleCustomEvent = () => {
      loadGallery();
    };
    
    window.addEventListener('galleryUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('galleryUpdated', handleCustomEvent);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
                Наши работы
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Загрузка галереи...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
              Наши работы
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Примеры выполненных проектов — качество, которому доверяют
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-7xl mx-auto">
            {galleryItems.map((item) => (
              <div key={item.id} className="relative group overflow-hidden rounded-lg shadow-lg aspect-[4/3]">
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img 
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.error-placeholder')) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'error-placeholder w-full h-full flex items-center justify-center bg-secondary text-muted-foreground';
                        placeholder.innerHTML = '<div class="text-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><p class="mt-2 text-sm">Изображение недоступно</p></div>';
                        parent.insertBefore(placeholder, parent.firstChild);
                      }
                    }}
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-oswald font-bold text-xl mb-2">{item.title}</h3>
                    <p className="text-sm opacity-90">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;