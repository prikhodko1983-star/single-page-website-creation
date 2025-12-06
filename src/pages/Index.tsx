import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RetouchForm from "@/components/RetouchForm";

interface Monument {
  id?: number;
  image_url: string;
  title: string;
  price: string;
  size: string;
  category?: string;
  description?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [designerSlideIndex, setDesignerSlideIndex] = useState(0);

  const designerSlides = [
    {
      image: "https://cdn.poehali.dev/files/ff61127a-f19b-45fb-a0b0-0de645b1e942.jpg",
      title: "Классический вертикальный памятник"
    },
    {
      image: "https://cdn.poehali.dev/files/a2c6a92c-4a27-4268-a9b2-25eac2f8dad9.jpg",
      title: "Эксклюзивный дизайн"
    },
    {
      image: "https://cdn.poehali.dev/files/a3bce19f-dfe6-4d50-b322-ddd2ed85257a.jpg",
      title: "Комплекс с оградой"
    }
  ];

  const API_URL = "https://functions.poehali.dev/92a4ea52-a3a0-4502-9181-ceeb714f2ad6";

  useEffect(() => {
    setSelectedImage(null);
    
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMonuments(data);
        } else {
          console.error("API returned non-array data:", data);
          setMonuments([]);
        }
      })
      .catch(err => {
        console.error("Error loading monuments:", err);
        setMonuments([]);
      });
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

  const categories = ["Все", "Вертикальные", "Горизонтальные", "Эксклюзивные", "С крестом"];

  const filteredMonuments = activeCategory === "Все" 
    ? monuments 
    : monuments.filter(m => m.category === activeCategory);

  const services = [
    { icon: "Hammer", title: "Изготовление памятников", desc: "От простых до эксклюзивных" },
    { icon: "Image", title: "Портреты и гравировка", desc: "Идеальное качество" },
    { icon: "Palette", title: "Художественная резьба", desc: "Ангелы, цветы, узоры" },
    { icon: "Truck", title: "Доставка и установка", desc: "По всей области" },
    { icon: "FileText", title: "Оформление документов", desc: "Все разрешения" },
    { icon: "Wrench", title: "Благоустройство могил", desc: "Полный комплекс работ" }
  ];

  const advantages = [
    { icon: "Award", title: "16 лет опыта", desc: "Работаем с 2008 года" },
    { icon: "Users", title: "2000+ клиентов", desc: "Положительные отзывы" },
    { icon: "Shield", title: "Гарантия качества", desc: "До 10 лет" },
    { icon: "Clock", title: "Точные сроки", desc: "Договор с датами" }
  ];

  const prices = [
    { name: "Памятник 100x50x5", price: "от 15 000 ₽" },
    { name: "Памятник 120x60x8", price: "от 25 000 ₽" },
    { name: "Эксклюзивный памятник", price: "от 45 000 ₽" },
    { name: "Портрет на памятник", price: "от 5 000 ₽" },
    { name: "Гравировка текста", price: "от 1 500 ₽" },
    { name: "Художественная резьба", price: "от 10 000 ₽" }
  ];

  const portfolioImages = [
    { url: "https://cdn.poehali.dev/files/bbcac88c-6deb-429e-b227-40488c7c5273.jpg", title: "Комплексное благоустройство", desc: "Установка памятников и уход за территорией" },
    { url: "https://cdn.poehali.dev/files/58ba923f-a428-4ebd-a17d-2cd8e5b523a8.jpg", title: "Художественная гравировка", desc: "Индивидуальный дизайн и качественное исполнение" },
    { url: "https://cdn.poehali.dev/files/c80c1bd4-c413-425a-a1fc-91dbb36a8de4.jpg", title: "Горизонтальные памятники", desc: "Классический дизайн из чёрного гранита" },
    { url: "https://cdn.poehali.dev/files/692de6e1-c8ae-42f8-ac61-0d8770aeb8ec.png", title: "Вертикальные памятники", desc: "Традиционная форма, проверенная временем" },
    { url: "https://cdn.poehali.dev/files/a6e29eb2-0f18-47ca-917e-adac360db4c3.jpeg", title: "Эксклюзивные проекты", desc: "Уникальный дизайн по индивидуальному заказу" },
    { url: "https://cdn.poehali.dev/files/e1b733d5-8a5c-4f60-9df4-9e05bb711cf9.jpeg", title: "Комплексы на могилу", desc: "Полное обустройство с оградой и цветником" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = `Новая заявка с сайта%0A%0AИмя: ${formData.name}%0AТелефон: ${formData.phone}%0AСообщение: ${formData.message || 'не указано'}`;
    const whatsappUrl = `https://wa.me/79960681168?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-roboto">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-oswald font-bold text-2xl text-primary">ГРАНИТНЫЕ ПАМЯТНИКИ</h1>
              <p className="text-xs text-muted-foreground">Производство с 2008 года</p>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#catalog" className="hover:text-primary transition-colors">Каталог</a>
              <a href="#portfolio" className="hover:text-primary transition-colors">Наши работы</a>
              <a href="#services" className="hover:text-primary transition-colors">Услуги</a>
              <a href="#retouch" className="hover:text-primary transition-colors">Ретушь</a>
              <a href="#prices" className="hover:text-primary transition-colors">Цены</a>
              <a href="#contact" className="hover:text-primary transition-colors">Контакты</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="tel:+79960681168" className="hidden lg:flex items-center gap-1.5 font-oswald font-bold text-base hover:text-primary transition-colors whitespace-nowrap">
                <Icon name="Phone" size={18} />
                8 (996) 068-11-68
              </a>
              <a href="https://wa.me/79960681168" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors">
                <Icon name="MessageCircle" size={18} />
              </a>
              <a href="https://t.me/79960681168" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#0088cc] hover:bg-[#006699] text-white rounded-lg transition-colors">
                <Icon name="Send" size={18} />
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="gap-2 hidden md:flex"
              >
                <Icon name="Lock" size={16} />
                <span className="hidden md:inline">Админ</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
              >
                <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-border animate-in slide-in-from-top-2">
              <nav className="flex flex-col gap-4">
                <a 
                  href="#catalog" 
                  className="text-base hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Каталог
                </a>
                <a 
                  href="#portfolio" 
                  className="text-base hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Наши работы
                </a>
                <a 
                  href="#services" 
                  className="text-base hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Услуги
                </a>
                <a 
                  href="#retouch" 
                  className="text-base hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ретушь
                </a>
                <a 
                  href="#prices" 
                  className="text-base hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Цены
                </a>
                <a 
                  href="#contact" 
                  className="text-base hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Контакты
                </a>
                <a 
                  href="tel:+79960681168" 
                  className="flex items-center gap-2 font-oswald font-bold text-base hover:text-primary transition-colors py-2"
                >
                  <Icon name="Phone" size={18} />
                  8 (996) 068-11-68
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="gap-2 w-full justify-start"
                >
                  <Icon name="Lock" size={16} />
                  Админка
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <section className="relative py-4 md:py-32 bg-secondary overflow-hidden">
        {/* Фоновое изображение */}
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
              <h2 className="font-oswald font-bold text-4xl md:text-6xl mb-6 animate-fade-in">
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
                  onClick={() => navigate('/catalog')}
                >
                  <Icon name="ShoppingBag" className="mr-2" size={20} />
                  ПЕРЕЙТИ В КАТАЛОГ
                </Button>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-oswald text-lg px-8 py-6"
                  onClick={() => navigate('/constructor')}
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

              {/* Баннер скидки - под кнопками */}
              <div className="w-full md:inline-block animate-fade-in">
                <div className="relative bg-gradient-to-br from-primary to-primary/90 rounded-lg md:rounded-xl p-3 md:p-4 shadow-xl overflow-hidden w-full md:w-[140px] h-[70px] md:h-[140px] flex items-center justify-center">
                  
                  <div className="relative z-10 text-primary-foreground flex md:flex-col items-center justify-between md:justify-center w-full md:w-auto gap-2 md:gap-0 px-2 md:px-0">
                    <div className="flex items-center gap-2 md:block md:mb-2">
                      <div className="font-oswald font-bold text-3xl md:text-3xl leading-none">25%</div>
                      <div className="text-xs md:text-[10px] font-bold md:mt-0.5 opacity-90">СКИДКА</div>
                    </div>
                    
                    <div className="text-right md:text-center">
                      <div className="font-oswald font-bold text-base md:text-sm md:mb-0.5">
                        АКЦИЯ!
                      </div>
                      
                      <div className="text-[10px] md:text-[9px] opacity-80">
                        До конца месяца
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Рекламный блок - Премиум модели */}
      <section className="py-16 bg-gradient-to-r from-secondary via-background to-secondary">
        <div className="container mx-auto px-4">
          <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
            <div className="absolute top-4 right-4 bg-[#f59f0a] text-white px-6 py-2 rounded-lg font-oswald font-semibold text-sm z-10">
              до 11 ноября
            </div>

            <div className="grid lg:grid-cols-[400px,1fr] gap-8 items-center p-8 lg:p-12">
              <div className="relative">
                <img 
                  src="https://cdn.poehali.dev/files/5c627d7b-3e9e-4df0-8207-179b8b81c683.png"
                  alt="Премиум памятники"
                  className="w-full h-auto"
                />
              </div>

              <div className="space-y-6">
                <h2 className="font-oswald font-bold text-3xl md:text-5xl">Премиум модели со скидкой до 25%</h2>

                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg"
                    variant="default"
                    className="bg-foreground hover:bg-foreground/90 text-background font-oswald text-base px-8"
                    onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Посмотреть все памятники
                  </Button>
                  <Button 
                    size="lg"
                    className="bg-[#f59f0a] hover:bg-[#d88a09] text-white font-oswald text-base px-8"
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

          {/* Категории фильтров */}
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

          {/* Карточки товаров - сетка 4 колонки */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

      {/* Помощь дизайнера */}
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

      <section className="py-20 bg-gradient-to-br from-secondary via-background to-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <img 
                  src="https://cdn.poehali.dev/files/9c81d552-1d36-4f04-a7a8-337893c61188.png"
                  alt="Комплексное благоустройство участка"
                  className="w-full h-auto"
                />
              </div>

              <div className="order-1 lg:order-2 space-y-8">
                <div>
                  <h2 className="font-oswald font-bold text-4xl md:text-5xl lg:text-6xl mb-4 tracking-tight">Благоустройство</h2>
                  <p className="text-xl md:text-2xl text-muted-foreground font-medium">УЧАСТКА</p>
                  <p className="text-xl md:text-2xl text-muted-foreground font-medium"></p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      <Icon name="Building2" size={32} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">Мемориальный комплекс</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      <Icon name="Maximize2" size={32} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">Решение для захоронения любых размеров</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    size="lg"
                    className="bg-[#f59f0a] hover:bg-[#d88a09] text-white font-oswald text-lg px-8 py-6 h-auto"
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Узнать подробнее
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
              Наши услуги
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Полный комплекс услуг от изготовления до установки
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, idx) => (
              <Card 
                key={idx}
                className="bg-card border-border hover:border-primary transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name={service.icon as any} className="text-primary" size={32} />
                  </div>
                  <h3 className="font-oswald font-semibold text-xl mb-2">
                    {service.title}
                  </h3>
                  <div className="text-muted-foreground text-sm">
                    {service.desc}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="retouch" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
              Ретушь фото для памятника
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Профессиональная обработка и восстановление фотографий
            </p>
          </div>

          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-8">
                <h3 className="font-oswald font-semibold text-2xl text-center mb-8">
                  Пример реставрации старой фотографии
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="relative aspect-[3/4] mb-4 rounded-lg overflow-hidden border-2 border-border bg-secondary">
                      <img 
                        src="https://cdn.poehali.dev/files/3e19395b-495c-4eef-91ce-74b56fbffe66.jpg"
                        alt="Фото до реставрации"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-secondary text-foreground px-4 py-2 rounded-lg font-oswald font-semibold text-sm border border-border">
                        ДО ОБРАБОТКИ
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="X" size={14} className="text-destructive" />
                        </div>
                        Трещины и повреждения
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="X" size={14} className="text-destructive" />
                        </div>
                        Низкая контрастность
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="X" size={14} className="text-destructive" />
                        </div>
                        Выцветшие участки
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="relative aspect-[3/4] mb-4 rounded-lg overflow-hidden border-2 border-primary bg-secondary">
                      <img 
                        src="https://cdn.poehali.dev/files/ed11db8d-2e82-4c44-a219-2b25cbe05cd3.jpg"
                        alt="Фото после реставрации"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-oswald font-semibold text-sm">
                        ПОСЛЕ ОБРАБОТКИ
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Check" size={14} className="text-primary" />
                        </div>
                        Устранены все повреждения
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Check" size={14} className="text-primary" />
                        </div>
                        Улучшена чёткость и детали
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Check" size={14} className="text-primary" />
                        </div>
                        Готово к гравировке
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[3/4] bg-secondary">
                  <img 
                    src="https://cdn.poehali.dev/files/a7e2b5c8-444e-4895-b70e-a11e197150b5.png"
                    alt="Ретушь мужского портрета"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-oswald font-semibold text-sm">
                    ПОСЛЕ ОБРАБОТКИ
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm text-center text-muted-foreground">Реставрация и улучшение качества</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[3/4] bg-secondary">
                  <img 
                    src="https://cdn.poehali.dev/files/7112f930-700c-4c99-a122-56bf0dbc2b2c.png"
                    alt="Ретушь женского портрета"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-oswald font-semibold text-sm">
                    ПОСЛЕ ОБРАБОТКИ
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm text-center text-muted-foreground">Цветокоррекция и детализация</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-3xl mx-auto">
            <RetouchForm />
          </div>
        </div>
      </section>

      {/* Наши работы - Галерея */}
      <section id="portfolio" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
              Наши работы
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Примеры выполненных проектов — качество, которому доверяют
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {portfolioImages.map((item, idx) => (
              <div 
                key={idx}
                className="relative group overflow-hidden rounded-lg shadow-lg aspect-[4/3] cursor-pointer"
                onClick={() => setSelectedImage(item.url)}
              >
                <img 
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-contain bg-secondary group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-oswald font-bold text-xl mb-2">{item.title}</h3>
                    <p className="text-sm opacity-90">{item.desc}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Icon name="ZoomIn" size={24} className="text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-oswald text-lg px-8"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Icon name="Phone" className="mr-2" size={20} />
              ОБСУДИТЬ ВАШ ПРОЕКТ
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
              Почему выбирают нас
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Профессионализм и качество проверенные временем
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {advantages.map((adv, idx) => (
              <div 
                key={idx} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={adv.icon as any} className="text-primary" size={40} />
                </div>
                <h3 className="font-oswald font-semibold text-xl mb-2">{adv.title}</h3>
                <div className="text-muted-foreground text-sm">{adv.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="prices" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
              Цены на памятники
            </h2>
            <div className="text-muted-foreground max-w-2xl mx-auto">
              Прозрачное ценообразование без скрытых платежей
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-card border-border mb-8">
              <CardContent className="p-0">
                {prices.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex justify-between items-center p-6 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="font-oswald text-xl text-primary">{item.price}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-secondary border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Info" className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold mb-3">Что входит в стоимость:</p>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Check" size={12} className="text-primary" />
                        </div>
                        Изготовление памятника из качественного гранита
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Check" size={12} className="text-primary" />
                        </div>
                        Полировка всех поверхностей
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Check" size={12} className="text-primary" />
                        </div>
                        Гравировка ФИО и дат
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Check" size={12} className="text-primary" />
                        </div>
                        Упаковка для транспортировки
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-4">
                      * Доставка и установка оплачиваются отдельно. Точная стоимость рассчитывается индивидуально.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-oswald text-lg px-8"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                РАССЧИТАТЬ СТОИМОСТЬ
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
                Оставьте заявку
              </h2>
              <p className="text-muted-foreground">
                Перезвоним в течение 15 минут и ответим на все вопросы
              </p>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ваше имя *</label>
                    <Input 
                      placeholder="Введите ваше имя"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-background border-border"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Телефон *</label>
                    <Input 
                      placeholder="+7 (___) ___-__-__"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="bg-background border-border"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Комментарий</label>
                    <Textarea 
                      placeholder="Опишите ваши пожелания"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="bg-background border-border"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-oswald text-lg py-6"
                  >
                    ОТПРАВИТЬ ЗАЯВКУ
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
                  </div>
                </form>

                <div className="mt-8 pt-8 border-t border-border">
                  <div className="flex flex-col items-center gap-4">
                    <a 
                      href="tel:+79960681168" 
                      className="flex items-center gap-2 text-2xl font-oswald font-bold hover:text-primary transition-colors"
                    >
                      <Icon name="Phone" size={28} />
                      8 (996) 068-11-68
                    </a>
                    <div className="text-sm text-muted-foreground">Звоните ежедневно с 9:00 до 20:00</div>
                    
                    <div className="flex items-center gap-3">
                      <a 
                        href="https://wa.me/79960681168" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors"
                      >
                        <Icon name="MessageCircle" size={20} />
                        <span className="font-medium">WhatsApp</span>
                      </a>
                      <a 
                        href="https://t.me/79960681168" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#006699] text-white rounded-lg transition-colors"
                      >
                        <Icon name="Send" size={20} />
                        <span className="font-medium">Telegram</span>
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="MapPin" size={16} />
                      <span>Великий Новгород, ул. Державина 17, стр. 3</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <iframe 
                  src="https://yandex.ru/map-widget/v1/?ll=31.273500%2C58.521800&z=17&l=map&pt=31.273500,58.521800,pm2rdm"
                  width="100%" 
                  height="400" 
                  frameBorder="0"
                  className="w-full"
                  title="Великий Новгород, ул. Державина 17, стр. 3"
                  allowFullScreen
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {selectedImage && typeof selectedImage === 'string' && selectedImage.trim() !== '' && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <Icon name="X" size={32} />
          </button>
          <img 
            src={selectedImage}
            alt="Увеличенное изображение"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={() => setSelectedImage(null)}
          />
        </div>
      )}

      <footer className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-oswald font-bold text-xl mb-4">О компании</h3>
              <p className="text-sm text-muted-foreground">
                Производство гранитных памятников с 2008 года. Собственное производство, гарантия качества.
              </p>
            </div>

            <div>
              <h3 className="font-oswald font-bold text-xl mb-4">Контакты</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="Phone" size={16} />
                  <a href="tel:+79960681168" className="hover:text-primary transition-colors">
                    8 (996) 068-11-68
                  </a>
                </div>
                <div className="text-muted-foreground">Ежедневно с 9:00 до 20:00</div>
                <div className="flex items-center gap-2">
                  <a href="https://wa.me/79960681168" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors text-xs">
                    <Icon name="MessageCircle" size={14} />
                    <span>WhatsApp</span>
                  </a>
                  <a href="https://t.me/79960681168" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-[#0088cc] hover:bg-[#006699] text-white rounded-lg transition-colors text-xs">
                    <Icon name="Send" size={14} />
                    <span>Telegram</span>
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="MapPin" size={16} />
                  <span>ул. Державина 17, стр. 3</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-oswald font-bold text-xl mb-4">Услуги</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Изготовление памятников
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Художественная резьба
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Портреты и гравировка
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Доставка и установка
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 Гранитные памятники. Все права защищены.</p>
            <p className="mt-2">Опыт и профессионализм — более 16 лет</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;