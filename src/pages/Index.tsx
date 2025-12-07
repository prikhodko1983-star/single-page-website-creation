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
  const mockMonuments: Monument[] = [
    { id: 1, image_url: "https://cdn.poehali.dev/files/692de6e1-c8ae-42f8-ac61-0d8770aeb8ec.png", title: "Памятник вертикальный 100x50x5", price: "от 15 000 ₽", size: "100x50x5 см", category: "Вертикальные" },
    { id: 2, image_url: "https://cdn.poehali.dev/files/c80c1bd4-c413-425a-a1fc-91dbb36a8de4.jpg", title: "Памятник горизонтальный 120x60x8", price: "от 25 000 ₽", size: "120x60x8 см", category: "Горизонтальные" },
    { id: 3, image_url: "https://cdn.poehali.dev/files/a6e29eb2-0f18-47ca-917e-adac360db4c3.jpeg", title: "Эксклюзивный памятник", price: "от 45 000 ₽", size: "Индивидуально", category: "Эксклюзивные" },
  ];
  const [monuments, setMonuments] = useState<Monument[]>(mockMonuments);
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

  useEffect(() => {
    setSelectedImage(null);
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