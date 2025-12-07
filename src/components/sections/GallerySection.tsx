import { useState, useEffect } from 'react';

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  desc: string;
}

const defaultGalleryItems: GalleryItem[] = [
  { id: '1', type: 'image', url: 'https://cdn.poehali.dev/files/bbcac88c-6deb-429e-b227-40488c7c5273.jpg', title: 'Комплексное благоустройство', desc: 'Установка памятников и уход за территорией' },
  { id: '2', type: 'image', url: 'https://cdn.poehali.dev/files/58ba923f-a428-4ebd-a17d-2cd8e5b523a8.jpg', title: 'Художественная гравировка', desc: 'Индивидуальный дизайн и качественное исполнение' },
  { id: '3', type: 'image', url: 'https://cdn.poehali.dev/files/c80c1bd4-c413-425a-a1fc-91dbb36a8de4.jpg', title: 'Горизонтальные памятники', desc: 'Классический дизайн из чёрного гранита' },
  { id: '4', type: 'image', url: 'https://cdn.poehali.dev/files/6f5b52e2-08d6-473f-838f-e3ffd77bc1cf.jpg', title: 'Вертикальные стелы', desc: 'С профессиональной гравировкой портрета' },
  { id: '5', type: 'image', url: 'https://cdn.poehali.dev/files/a92e8f49-5be4-4b4b-939f-e97e69b14d55.jpg', title: 'Мемориальные комплексы', desc: 'С благоустройством и цветником' },
  { id: '6', type: 'image', url: 'https://cdn.poehali.dev/files/e4f88cd9-b74c-4b96-bf11-ab78a26bc19a.jpg', title: 'Элитные памятники', desc: 'Эксклюзивный дизайн по индивидуальному проекту' }
];

const GallerySection = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(defaultGalleryItems);

  useEffect(() => {
    const savedGallery = localStorage.getItem('galleryItems');
    if (savedGallery) {
      try {
        const parsed = JSON.parse(savedGallery);
        if (parsed.length > 0) {
          setGalleryItems(parsed);
        }
      } catch (e) {
        console.error('Error loading gallery items:', e);
      }
    }
  }, []);

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