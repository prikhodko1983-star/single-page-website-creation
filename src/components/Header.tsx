import Icon from "@/components/ui/icon";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-oswald font-bold text-2xl text-primary">ГРАНИТНЫЕ ПАМЯТНИКИ</h1>
            <p className="text-xs text-muted-foreground">Производство с 2008 года</p>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#catalog" className="hover:text-primary transition-colors">Каталог</a>
            <a href="/constructor" className="hover:text-primary transition-colors">Конструктор</a>
            <a href="#services" className="hover:text-primary transition-colors">Услуги</a>
            <a href="#prices" className="hover:text-primary transition-colors">Цены</a>
            <a href="#contact" className="hover:text-primary transition-colors">Контакты</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:+79960681168" className="flex items-center gap-1.5 font-oswald font-bold text-base hover:text-primary transition-colors whitespace-nowrap">
              <Icon name="Phone" size={18} />
              8 (996) 068-11-68
            </a>
            <a href="https://wa.me/79960681168" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors">
              <Icon name="MessageCircle" size={18} />
            </a>
            <a 
              href="https://t.me/otvetzakaz_bot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-[#0088cc] hover:bg-[#006699] text-white rounded-lg transition-colors"
              title="Написать в Telegram"
            >
              <Icon name="Send" size={18} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;