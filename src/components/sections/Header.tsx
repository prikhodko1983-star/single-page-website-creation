import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import MaxIcon from "@/components/ui/MaxIcon";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

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
            <a href="#services" className="hover:text-primary transition-colors">Услуги</a>
            <a href="#prices" className="hover:text-primary transition-colors">Цены</a>
            <a href="#contact" className="hover:text-primary transition-colors">Контакты</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:+79960681168" className="flex items-center gap-1.5 font-oswald font-bold text-base hover:text-primary transition-colors whitespace-nowrap">
              <Icon name="Phone" size={18} />
              8 (996) 068-11-68
            </a>
            <a href="https://vk.ru/vekpam" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-xl overflow-hidden hover:opacity-80 transition-opacity" title="ВКонтакте">
              <img src="https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/d013d239-bfaa-4a1b-a14c-18c8d933ee0d.png" alt="ВКонтакте" width={36} height={36} className="w-full h-full object-cover" />
            </a>
            <a href="https://t.me/79960681168" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-[#0088cc] hover:bg-[#006699] text-white rounded-xl transition-colors">
              <Icon name="Send" size={18} />
            </a>
            <a href="https://max.ru/im?phone=89960681168" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#4B8EF5] via-[#5B5BD6] to-[#9B3FC8] hover:opacity-80 transition-opacity" title="Написать в Max">
              <MaxIcon size={18} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;