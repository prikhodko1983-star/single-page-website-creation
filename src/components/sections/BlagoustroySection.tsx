import { useState } from 'react';
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const BlagoustroySection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: 'https://cdn.poehali.dev/files/bbcac88c-6deb-429e-b227-40488c7c5273.jpg',
      title: 'Укладка плитки',
      description: 'Профессиональная укладка гранитной плитки вокруг памятника'
    },
    {
      id: 2,
      image: 'https://cdn.poehali.dev/files/a92e8f49-5be4-4b4b-939f-e97e69b14d55.jpg',
      title: 'Цветники и ограды',
      description: 'Установка металлических оград и оформление цветников'
    },
    {
      id: 3,
      image: 'https://cdn.poehali.dev/files/e4f88cd9-b74c-4b96-bf11-ab78a26bc19a.jpg',
      title: 'Полный комплекс',
      description: 'Комплексное благоустройство с установкой памятника и оформлением территории'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
              Благоустройство могил
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Комплексные работы по облагораживанию места захоронения — от укладки плитки до установки оград
            </p>
          </div>

          <div className="relative">
            {/* Слайдер */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl aspect-[16/9] md:aspect-[21/9] bg-secondary">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    index === currentSlide
                      ? 'opacity-100 translate-x-0'
                      : index < currentSlide
                      ? 'opacity-0 -translate-x-full'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Градиент для текста */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Текст слайда */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
                    <h3 className="font-oswald font-bold text-2xl md:text-4xl mb-2 md:mb-4">
                      {slide.title}
                    </h3>
                    <p className="text-sm md:text-lg opacity-90 max-w-2xl">
                      {slide.description}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Кнопки навигации */}
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white border-0 shadow-lg z-10"
              >
                <Icon name="ChevronLeft" size={24} className="text-zinc-900" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white border-0 shadow-lg z-10"
              >
                <Icon name="ChevronRight" size={24} className="text-zinc-900" />
              </Button>
            </div>

            {/* Индикаторы */}
            <div className="flex justify-center gap-2 mt-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Перейти к слайду ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Список услуг */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 bg-secondary rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon name="Square" size={32} className="text-primary" />
              </div>
              <h3 className="font-oswald font-semibold text-xl mb-2">Укладка плитки</h3>
              <p className="text-sm text-muted-foreground">
                Гранитная и тротуарная плитка любых размеров
              </p>
            </div>

            <div className="text-center p-6 bg-secondary rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon name="Fence" size={32} className="text-primary" fallback="Box" />
              </div>
              <h3 className="font-oswald font-semibold text-xl mb-2">Установка оград</h3>
              <p className="text-sm text-muted-foreground">
                Металлические ограды с покраской и гарантией
              </p>
            </div>

            <div className="text-center p-6 bg-secondary rounded-lg">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon name="Flower2" size={32} className="text-primary" fallback="Heart" />
              </div>
              <h3 className="font-oswald font-semibold text-xl mb-2">Цветники</h3>
              <p className="text-sm text-muted-foreground">
                Оформление цветников с бордюрами из гранита
              </p>
            </div>
          </div>

          {/* Кнопка заказа */}
          <div className="text-center mt-10">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 font-oswald text-lg px-8"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Icon name="Phone" className="mr-2" size={20} />
              ЗАКАЗАТЬ БЛАГОУСТРОЙСТВО
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlagoustroySection;
