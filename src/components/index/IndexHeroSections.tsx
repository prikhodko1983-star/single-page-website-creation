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
  designerSlides
}: IndexHeroSectionsProps) {
  return (
    <>
      <section className="relative py-4 md:py-32 bg-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <img 
            src="https://cdn.poehali.dev/files/7c3f7bb6-620d-4495-bf82-0abd8136ff4b.png"
            alt="Памятник фон"
            className="w-full h-full object-contain object-right"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/50 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-[1fr,auto] gap-8 lg:gap-12 items-start">
            <div className="max-w-3xl">
              <h2 className="font-oswald font-black text-5xl md:text-7xl lg:text-8xl mb-6 animate-fade-in uppercase leading-none bg-gradient-to-b from-white via-gray-200 to-gray-400 bg-clip-text text-transparent" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                Изготовление памятников из гранита
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in">
                Более 16 лет создаём памятники, которые сохраняют память о ваших близких
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
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
              <div className="flex flex-wrap gap-4 mb-6">
                <Button 
                  size="lg" 
                  className="bg-[#f59f0a] hover:bg-[#d88a09] text-white font-oswald text-lg px-8 py-6"
                  onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Icon name="ShoppingBag" className="mr-2" size={20} />
                  КАТАЛОГ
                </Button>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-oswald text-lg px-8 py-6"
                  onClick={onNavigateConstructor}
                >
                  <Icon name="Wrench" className="mr-2" size={20} />
                  СОЗДАТЬ ПРОЕКТ
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="font-oswald text-lg px-8 py-6"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  ЗАКАЗАТЬ КОНСУЛЬТАЦИЮ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#1a1a1a]">
        <div className="container mx-auto px-4">
          <div className="relative bg-white rounded-2xl overflow-hidden">
            <div className="absolute top-8 right-8 bg-[#E89C1F] text-white px-6 py-2 rounded-lg font-oswald font-semibold text-sm z-10">
              до 11 ноября
            </div>

            <div className="grid lg:grid-cols-[300px,1fr] gap-0 items-center">
              <div className="relative h-full">
                <img 
                  src="https://cdn.poehali.dev/files/76878.jpg"
                  alt="Премиум памятники"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-6 p-8 lg:p-16 text-center lg:text-left">
                <h2 className="font-oswald font-bold text-4xl md:text-6xl text-zinc-900 whitespace-nowrap">Премиум модели со скидкой до 25%</h2>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="bg-transparent hover:bg-zinc-100 text-zinc-900 border-2 border-zinc-900 font-oswald text-base px-8"
                    onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Посмотреть все памятники
                  </Button>
                  <Button 
                    size="lg"
                    className="bg-[#E89C1F] hover:bg-[#d88a09] text-white font-oswald text-base px-8"
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

      <section id="catalog" className="py-20 bg-background">
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

      <section className="py-20 bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
              Помощь дизайнера в подборе памятника
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Не знаете, какой памятник выбрать? Наш дизайнер поможет подобрать идеальный вариант
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="bg-card border-border shadow-xl overflow-hidden">
              <CardContent className="p-4 md:p-12">
                <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                  <div className="space-y-4 md:space-y-6">
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Palette" size={20} className="text-primary md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h3 className="font-oswald font-bold text-base md:text-xl mb-1 md:mb-2">Индивидуальный подход</h3>
                          <div className="text-muted-foreground text-sm md:text-base">
                            Учтём все ваши пожелания: форму, размер, материал, декоративные элементы
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Image" size={20} className="text-primary md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h3 className="font-oswald font-bold text-base md:text-xl mb-1 md:mb-2">Визуализация</h3>
                          <div className="text-muted-foreground text-sm md:text-base">
                            Покажем, как будет выглядеть памятник до начала работ
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Target" size={20} className="text-primary md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h3 className="font-oswald font-bold text-base md:text-xl mb-1 md:mb-2">Подбор в рамках бюджета</h3>
                          <div className="text-muted-foreground text-sm md:text-base">
                            Предложим оптимальные варианты под ваш бюджет
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 md:pt-6 border-t border-border">
                      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <Icon name="Phone" size={18} className="text-primary md:w-5 md:h-5" />
                        <span className="font-oswald font-bold text-base md:text-lg">Бесплатная консультация</span>
                      </div>
                      <Button 
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-oswald text-sm md:text-lg py-3 md:py-6"
                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        ПОЛУЧИТЬ КОНСУЛЬТАЦИЮ ДИЗАЙНЕРА
                      </Button>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="relative overflow-hidden rounded-xl bg-secondary">
                      <div className="aspect-[4/3]">
                        <img 
                          src={designerSlides[designerSlideIndex].image}
                          alt={"Пример работы"}
                          className="w-full h-full object-contain transition-all duration-500"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <p className="text-white font-oswald font-semibold text-xl">{designerSlides[designerSlideIndex].title}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setDesignerSlideIndex((prev) => (prev - 1 + designerSlides.length) % designerSlides.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Icon name="ChevronLeft" size={24} />
                      </button>
                      <button
                        onClick={() => setDesignerSlideIndex((prev) => (prev + 1) % designerSlides.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Icon name="ChevronRight" size={24} />
                      </button>
                    </div>

                    <div className="flex justify-center gap-2 mt-4">
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

      <section className="py-20 bg-gradient-to-br from-secondary via-background to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary/20">
                  <img 
                    src="https://cdn.poehali.dev/files/IMG_4105.jpeg"
                    alt="Комплексное благоустройство участка"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              </div>

              <div className="order-1 lg:order-2 space-y-8">
                <div>
                  <div className="inline-block mb-4">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-sm font-oswald px-4 py-1">
                      ПРОФЕССИОНАЛЬНОЕ РЕШЕНИЕ
                    </Badge>
                  </div>
                  <h2 className="font-oswald font-bold text-4xl md:text-5xl lg:text-6xl mb-4 tracking-tight leading-tight">
                    Благоустройство
                    <span className="block text-primary mt-2">участка</span>
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Комплексное обустройство мемориального места с использованием качественных материалов
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary/10">
                      <Icon name="Building2" size={28} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-1">Мемориальный комплекс</p>
                      <p className="text-sm text-muted-foreground">Полное обустройство с плиткой, оградой и лавкой</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary/10">
                      <Icon name="Maximize2" size={28} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-1">Любые размеры</p>
                      <p className="text-sm text-muted-foreground">Индивидуальный подход к каждому проекту</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary/10">
                      <Icon name="Shield" size={28} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-1">Гарантия качества</p>
                      <p className="text-sm text-muted-foreground">Долговечные материалы и профессиональный монтаж</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 my-2.5">
                  <Button 
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-oswald text-lg px-6 py-4 h-auto shadow-lg hover:shadow-xl transition-all"
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Icon name="Phone" size={20} className="mr-2" />
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