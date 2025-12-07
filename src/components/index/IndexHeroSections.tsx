import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface Monument {
  id?: number;
  image_url: string;
  title: string;
  price: string;
  size: string;
  category?: string;
  description?: string;
}

interface IndexHeroSectionsProps {
  onNavigateCatalog: () => void;
  onNavigateConstructor: () => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  filteredMonuments: Monument[];
  categories: string[];
  designerSlideIndex: number;
  setDesignerSlideIndex: (index: number) => void;
  designerSlides: Array<{ image: string; title: string }>;
  children?: React.ReactNode;
}

export default function IndexHeroSections({
  onNavigateCatalog,
  onNavigateConstructor,
  activeCategory,
  setActiveCategory,
  filteredMonuments,
  categories,
  designerSlideIndex,
  setDesignerSlideIndex,
  designerSlides,
  children
}: IndexHeroSectionsProps) {
  const [blagoustroySlide, setBlagoustroySlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [designerTouchStart, setDesignerTouchStart] = useState(0);
  const [designerTouchEnd, setDesignerTouchEnd] = useState(0);

  const blagoustroySlides = [
    {
      image: 'https://cdn.poehali.dev/files/IMG_4105.jpeg',
      title: 'Укладка плитки',
      description: 'Профессиональная укладка гранитной плитки вокруг памятника'
    },
    {
      image: 'https://cdn.poehali.dev/files/bbcac88c-6deb-429e-b227-40488c7c5273.jpg',
      title: 'Мемориальные комплексы',
      description: 'Полное обустройство с плиткой, оградой и элементами благоустройства'
    },
    {
      image: 'https://cdn.poehali.dev/files/FE57E2C5-D14B-40E8-B4EA-977DE9871C04.png',
      title: 'Комплексное благоустройство',
      description: 'Памятник, плитка, ограда и цветник — всё в едином стиле'
    }
  ];

  const nextBlagoustroySlide = () => {
    setBlagoustroySlide((prev) => (prev + 1) % blagoustroySlides.length);
  };

  const prevBlagoustroySlide = () => {
    setBlagoustroySlide((prev) => (prev - 1 + blagoustroySlides.length) % blagoustroySlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (distance > minSwipeDistance) {
      nextBlagoustroySlide();
    }
    
    if (distance < -minSwipeDistance) {
      prevBlagoustroySlide();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleDesignerTouchStart = (e: React.TouchEvent) => {
    setDesignerTouchStart(e.targetTouches[0].clientX);
  };

  const handleDesignerTouchMove = (e: React.TouchEvent) => {
    setDesignerTouchEnd(e.targetTouches[0].clientX);
  };

  const handleDesignerTouchEnd = () => {
    if (!designerTouchStart || !designerTouchEnd) return;
    
    const distance = designerTouchStart - designerTouchEnd;
    const minSwipeDistance = 50;
    
    if (distance > minSwipeDistance) {
      setDesignerSlideIndex((prev) => (prev + 1) % designerSlides.length);
    }
    
    if (distance < -minSwipeDistance) {
      setDesignerSlideIndex((prev) => (prev - 1 + designerSlides.length) % designerSlides.length);
    }
    
    setDesignerTouchStart(0);
    setDesignerTouchEnd(0);
  };

  return (
    <>
      <section className="relative pt-2 pb-20 md:py-32 bg-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-90 flex justify-end items-end md:items-center">
          <img 
            src="https://cdn.poehali.dev/files/7c3f7bb6-620d-4495-bf82-0abd8136ff4b.png"
            alt="Гранитный памятник с художественной резьбой - производство в Великом Новгороде"
            className="w-[90%] md:w-full h-[80%] md:h-full object-contain object-right object-bottom"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/30 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col justify-between h-full">
          <div className="grid lg:grid-cols-[1fr,auto] gap-8 lg:gap-12 items-start">
            <div className="max-w-3xl flex flex-col md:block">
              <h1 className="font-oswald font-black text-4xl md:text-5xl lg:text-6xl mb-3 animate-fade-in uppercase leading-[0.9] bg-gradient-to-b from-white via-gray-200 to-gray-400 bg-clip-text text-transparent" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                Изготовление памятников из гранита
              </h1>
              <p className="text-sm md:text-base text-white mb-4 animate-fade-in leading-tight">
                Более 16 лет создаём памятники, которые сохраняют память о ваших близких
              </p>
              <div className="flex flex-col md:flex-row md:flex-wrap gap-2 mb-8 mt-6 md:mt-0">
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" className="text-primary" size={16} />
                  </div>
                  <span>Собственное производство</span>
                </div>
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" className="text-primary" size={16} />
                  </div>
                  <span>Гарантия до 10 лет</span>
                </div>
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" className="text-primary" size={16} />
                  </div>
                  <span>Доставка и установка</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:flex-wrap gap-3 mb-6 items-start mt-auto md:mt-0">
                <Button 
                  size="sm" 
                  className="bg-[#f59f0a] hover:bg-[#d88a09] text-white font-oswald text-sm px-4 py-2 w-auto"
                  onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Icon name="ShoppingBag" className="mr-2" size={16} />
                  КАТАЛОГ
                </Button>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-oswald text-sm px-4 py-2 w-auto"
                  onClick={onNavigateConstructor}
                >
                  <Icon name="Wrench" className="mr-2" size={16} />
                  СОЗДАТЬ ПРОЕКТ
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  className="font-oswald text-sm px-4 py-2 w-auto"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  ЗАКАЗАТЬ КОНСУЛЬТАЦИЮ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-16 bg-[#1a1a1a]">
        <div className="container mx-auto px-4">
          <div className="relative bg-white rounded-2xl overflow-hidden">
            <div className="absolute top-4 right-4 md:top-8 md:right-8 bg-[#E89C1F] text-white px-3 py-1 md:px-6 md:py-2 rounded-lg font-oswald font-semibold text-xs md:text-sm z-20">
              до 11 ноября
            </div>

            <div className="relative lg:grid lg:grid-cols-[300px,1fr] gap-0 items-center min-h-[200px]">
              {/* Изображение - на мобильном как фон */}
              <div className="absolute lg:relative inset-0 h-full min-h-[280px] lg:min-h-[200px]">
                <img 
                  src="https://cdn.poehali.dev/files/76878.jpg"
                  alt="Премиум памятники из гранита со скидкой до 25% - эксклюзивные модели"
                  className="w-full h-full object-cover"
                />
                {/* Затемнение для читаемости текста на мобильном */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent lg:hidden"></div>
              </div>

              {/* Контент - наезжает на изображение на мобильном */}
              <div className="relative z-10 space-y-4 p-6 lg:py-8 lg:px-12 text-center lg:text-left min-h-[280px] lg:min-h-0 flex flex-col justify-end lg:justify-center lg:bg-white">
                <h2 className="font-oswald font-bold text-2xl md:text-4xl lg:text-6xl text-white lg:text-zinc-900 leading-tight">
                  Премиум памятники из гранита со скидкой до 25%
                </h2>

                <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="bg-white/90 hover:bg-white text-zinc-900 border-2 border-white lg:bg-transparent lg:hover:bg-zinc-100 lg:border-zinc-900 font-oswald text-sm md:text-base px-6 md:px-8"
                    onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Посмотреть все памятники
                  </Button>
                  <Button 
                    size="lg"
                    className="bg-[#E89C1F] hover:bg-[#d88a09] text-white font-oswald text-sm md:text-base px-6 md:px-8"
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Выбрать с менеджером
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {children}

      <section id="catalog" className="hidden py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
              Каталог памятников
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Готовые решения для разных бюджетов
            </p>
          </div>

          <div className="flex justify-center mb-8 px-2">
            <div className="grid grid-cols-2 md:inline-flex bg-secondary rounded-lg p-1 gap-1 w-full md:w-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 md:px-12 py-2 md:py-3 rounded-md font-oswald font-medium text-xs md:text-base transition-all ${
                    activeCategory === category
                      ? 'bg-card text-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredMonuments.map((item, idx) => (
              <Card 
                key={item.id || idx}
                className="bg-card border-border hover:border-primary transition-all duration-300 overflow-hidden group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary flex items-center justify-center">
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-3 md:p-6">
                  <h3 className="font-oswald font-semibold text-base md:text-xl mb-1">{item.title}</h3>
                  <div className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">{item.size}</div>
                  <div className="flex flex-col gap-2 md:gap-3">
                    <span className="font-oswald text-lg md:text-2xl text-[#f59f0a]">{item.price}</span>
                    <Button 
                      size="lg"
                      className="w-full bg-[#f59f0a] hover:bg-[#d88a09] text-white font-oswald text-sm md:text-base py-2 md:py-3"
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Подробнее
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-oswald font-bold text-2xl md:text-3xl lg:text-5xl mb-3 md:mb-4 px-4">
              Помощь дизайнера в подборе гранитного памятника
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto px-4">
              Не знаете, какой памятник выбрать? Наш дизайнер поможет подобрать идеальный вариант
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="bg-card border-border shadow-xl overflow-hidden">
              <CardContent className="p-4 md:p-12">
                <div className="grid md:grid-cols-2 gap-5 md:gap-12 items-start md:items-center">
                  <div className="space-y-3 md:space-y-6 order-2 md:order-1">
                    <div className="space-y-2.5 md:space-y-4">
                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Palette" size={18} className="text-primary md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h3 className="font-oswald font-bold text-sm md:text-base lg:text-xl mb-1">Индивидуальный подход</h3>
                          <div className="text-muted-foreground text-xs md:text-sm lg:text-base">
                            Учтём все ваши пожелания: форму, размер, материал, декоративные элементы
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Image" size={18} className="text-primary md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h3 className="font-oswald font-bold text-sm md:text-base lg:text-xl mb-1">Визуализация</h3>
                          <div className="text-muted-foreground text-xs md:text-sm lg:text-base">
                            Покажем, как будет выглядеть памятник до начала работ
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Target" size={18} className="text-primary md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h3 className="font-oswald font-bold text-sm md:text-base lg:text-xl mb-1">Подбор в рамках бюджета</h3>
                          <div className="text-muted-foreground text-xs md:text-sm lg:text-base">
                            Предложим оптимальные варианты под ваш бюджет
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 md:pt-6 border-t border-border">
                      <div className="flex items-center gap-2 mb-2.5 md:mb-4">
                        <Icon name="Phone" size={16} className="text-primary md:w-5 md:h-5" />
                        <span className="font-oswald font-bold text-sm md:text-base lg:text-lg">Бесплатная консультация</span>
                      </div>
                      <Button 
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-oswald text-xs md:text-sm lg:text-lg py-2 md:py-3 lg:py-6"
                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        ПОЛУЧИТЬ КОНСУЛЬТАЦИЮ ДИЗАЙНЕРА
                      </Button>
                    </div>
                  </div>

                  <div className="relative group order-1 md:order-2">
                    <div 
                      className="relative overflow-hidden rounded-xl bg-secondary"
                      onTouchStart={handleDesignerTouchStart}
                      onTouchMove={handleDesignerTouchMove}
                      onTouchEnd={handleDesignerTouchEnd}
                    >
                      <div className="aspect-[4/3]">
                        <img 
                          src={designerSlides[designerSlideIndex].image}
                          alt={`Пример работы дизайнера: ${designerSlides[designerSlideIndex].title} - гранитные памятники`}
                          className="w-full h-full object-contain transition-all duration-500"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                          <p className="text-white font-oswald font-semibold text-base md:text-xl">{designerSlides[designerSlideIndex].title}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setDesignerSlideIndex((prev) => (prev - 1 + designerSlides.length) % designerSlides.length)}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 md:p-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Icon name="ChevronLeft" size={20} className="md:w-6 md:h-6" />
                      </button>
                      <button
                        onClick={() => setDesignerSlideIndex((prev) => (prev + 1) % designerSlides.length)}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 md:p-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Icon name="ChevronRight" size={20} className="md:w-6 md:h-6" />
                      </button>
                    </div>

                    <div className="flex justify-center gap-2 mt-3 md:mt-4">
                      {designerSlides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setDesignerSlideIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === designerSlideIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-gradient-to-br from-secondary via-background to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div 
                  className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-primary/20 group"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {blagoustroySlides.map((slide, index) => (
                    <div
                      key={index}
                      className={`transition-all duration-500 ease-in-out ${
                        index === blagoustroySlide
                          ? 'opacity-100 relative'
                          : 'opacity-0 absolute inset-0 pointer-events-none'
                      }`}
                    >
                      <img 
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-auto aspect-[4/3] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="font-oswald font-bold text-xl md:text-2xl mb-1">{slide.title}</h3>
                        <p className="text-xs md:text-sm opacity-90">{slide.description}</p>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevBlagoustroySlide}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 hover:bg-white border-0 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Icon name="ChevronLeft" size={20} className="text-zinc-900" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextBlagoustroySlide}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 hover:bg-white border-0 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Icon name="ChevronRight" size={20} className="text-zinc-900" />
                  </Button>

                  <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {blagoustroySlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setBlagoustroySlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === blagoustroySlide
                            ? 'w-6 bg-white'
                            : 'w-1.5 bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Перейти к слайду ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2 space-y-5 md:space-y-8">
                <div>
                  <div className="inline-block mb-3 md:mb-4">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs md:text-sm font-oswald px-3 py-1 md:px-4">
                      ПРОФЕССИОНАЛЬНОЕ РЕШЕНИЕ
                    </Badge>
                  </div>
                  <h2 className="font-oswald font-bold text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-3 md:mb-4 tracking-tight leading-tight">
                    Благоустройство могил
                    <span className="block text-primary mt-1 md:mt-2">и мемориальных участков</span>
                  </h2>
                  <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
                    Комплексное обустройство мемориального места с использованием качественных материалов
                  </p>
                </div>

                <div className="space-y-3 md:space-y-5">
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary/10">
                      <Icon name="Building2" size={22} className="text-primary md:w-7 md:h-7" />
                    </div>
                    <div>
                      <p className="text-base md:text-lg font-semibold mb-0.5 md:mb-1">Мемориальный комплекс</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Полное обустройство с плиткой, оградой и лавкой</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary/10">
                      <Icon name="Maximize2" size={22} className="text-primary md:w-7 md:h-7" />
                    </div>
                    <div>
                      <p className="text-base md:text-lg font-semibold mb-0.5 md:mb-1">Любые размеры</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Индивидуальный подход к каждому проекту</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary/10">
                      <Icon name="Shield" size={22} className="text-primary md:w-7 md:h-7" />
                    </div>
                    <div>
                      <p className="text-base md:text-lg font-semibold mb-0.5 md:mb-1">Гарантия качества</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Долговечные материалы и профессиональный монтаж</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 md:pt-4">
                  <Button 
                    size="lg"
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-oswald text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto shadow-lg hover:shadow-xl transition-all"
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Icon name="Phone" size={18} className="mr-2 md:w-5 md:h-5" />
                    Узнать подробнее
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}