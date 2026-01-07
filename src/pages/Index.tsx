import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IndexHeader from "@/components/index/IndexHeader";
import IndexHeroSections from "@/components/index/IndexHeroSections";
import IndexShopSection from "@/components/index/IndexShopSection";
import IndexContentSections from "@/components/index/IndexContentSections";
import IndexContactFooter from "@/components/index/IndexContactFooter";

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

  // Устанавливаем og:url для главной страницы
  useEffect(() => {
    const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    if (ogUrlMeta) {
      ogUrlMeta.setAttribute('content', 'https://мастер-гранит.рф/');
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      meta.setAttribute('content', 'https://мастер-гранит.рф/');
      document.head.appendChild(meta);
    }
  }, []);

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
      <IndexHeader 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onNavigateAdmin={() => navigate('/admin')}
      />

      {/* Уведомление о разработке */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-4">
        <div className="container mx-auto text-center">
          <p className="text-lg font-semibold">
            ⚠️ Сайт находится в разработке
          </p>
          <p className="text-sm mt-1 opacity-90">
            Некоторые функции могут работать не полностью. Спасибо за понимание!
          </p>
        </div>
      </div>

      <IndexHeroSections 
        onNavigateCatalog={() => navigate('/catalog')}
        onNavigateConstructor={() => navigate('/constructor')}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        filteredMonuments={filteredMonuments}
        categories={categories}
        designerSlideIndex={designerSlideIndex}
        setDesignerSlideIndex={setDesignerSlideIndex}
        designerSlides={designerSlides}
      >
        <IndexShopSection />
      </IndexHeroSections>

      {/* Баннер конструктора */}
      <section className="py-8 md:py-16 bg-[#1a1a1a]">
        <div className="container mx-auto px-4">
          <div 
            className="relative rounded-2xl overflow-hidden cursor-pointer group max-w-7xl mx-auto"
            onClick={() => navigate('/constructor')}
            style={{
              backgroundImage: 'url(https://cdn.poehali.dev/files/Фон%20копия.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center min-h-[400px] lg:min-h-[500px] p-8 md:p-12 lg:p-16">
              <div className="space-y-6">
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal text-white leading-tight">
                  Онлайн-конструктор<br />памятников
                </h2>
                
                <p className="text-base md:text-lg text-white/90">
                  Создайте макет за несколько минут
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white/90">
                    <svg className="w-5 h-5 text-[#D4A855] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm md:text-base">Выберите форму и дизайн</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <svg className="w-5 h-5 text-[#D4A855] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm md:text-base">Добавьте фото и надпись</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <svg className="w-5 h-5 text-[#D4A855] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm md:text-base">Посмотрите, как будет выглядеть памятник</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <svg className="w-5 h-5 text-[#D4A855] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm md:text-base">Без регистрации и бесплатно</span>
                  </div>
                </div>
                
                <button className="bg-[#D4A855] hover:bg-[#C49745] text-black font-medium px-8 py-4 rounded-lg text-base md:text-lg transition-all duration-300 group-hover:scale-105 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Собрать макет памятника
                </button>
                
                <p className="text-white/70 text-sm md:text-base italic">
                  Наглядно. Удобно. Без лишних звонков.
                </p>
              </div>
              
              <div className="hidden lg:block">
                <img 
                  src="https://cdn.poehali.dev/files/73624E06-523F-4A9E-B89D-9858B866B845.png"
                  alt="Конструктор памятников на мобильном"
                  className="w-full max-w-md ml-auto group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <IndexContentSections 
        services={services}
        advantages={advantages}
        prices={prices}
        portfolioImages={portfolioImages}
        setSelectedImage={setSelectedImage}
      />

      <IndexContactFooter 
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </div>
  );
};

export default Index;