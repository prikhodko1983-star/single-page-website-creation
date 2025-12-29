import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { CartSheet } from "@/components/CartSheet";

interface IndexHeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
  onNavigateAdmin: () => void;
}

export default function IndexHeader({ mobileMenuOpen, setMobileMenuOpen, onNavigateAdmin }: IndexHeaderProps) {
  return (
    <>
      {/* Баннер о разработке */}
      <div className="bg-orange-500 text-white py-3 px-4 text-center text-sm font-medium shadow-md">
        <div className="flex items-center justify-center gap-2">
          <Icon name="AlertCircle" size={18} />
          <span>Сайт находится в разработке. Некоторые функции могут работать не полностью.</span>
        </div>
      </div>
      
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-oswald font-bold text-2xl text-primary">ГРАНИТНЫЕ ПАМЯТНИКИ</h1>
            <p className="text-xs text-muted-foreground">Производство с 2008 года</p>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#shop" className="hover:text-primary transition-colors">Каталог</a>
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
            <div className="hidden md:block">
              <CartSheet />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateAdmin}
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
                href="#shop" 
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
                  onNavigateAdmin();
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
    </>
  );
}