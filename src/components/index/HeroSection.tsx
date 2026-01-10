import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface HeroSectionProps {
  onNavigateConstructor: () => void;
}

export default function HeroSection({ onNavigateConstructor }: HeroSectionProps) {
  return (
    <section className="relative pt-2 pb-4 md:py-32 bg-secondary overflow-hidden">
      <div className="absolute inset-0 opacity-90 flex justify-end items-end md:items-center md:justify-end md:pr-[8%]">
        <img 
          src="https://cdn.poehali.dev/files/7c3f7bb6-620d-4495-bf82-0abd8136ff4b.png"
          alt="Гранитный памятник с художественной резьбой - производство в Великом Новгороде"
          className="w-[90%] md:w-[50%] h-[80%] md:h-full object-contain object-right object-bottom"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/40 to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col justify-between h-full">
        <div className="grid lg:grid-cols-[1fr,auto] gap-8 lg:gap-12 items-start">
          <div className="max-w-[280px] md:max-w-3xl flex flex-col h-full md:h-auto md:block">
            <div>
              <h1 className="font-oswald font-black text-3xl md:text-5xl lg:text-6xl mb-2 md:mb-3 animate-fade-in uppercase leading-[0.9] bg-gradient-to-b from-white via-gray-200 to-gray-400 bg-clip-text text-transparent" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                Изготовление памятников из гранита
              </h1>
              <p className="text-xs md:text-base text-white mb-3 md:mb-4 animate-fade-in leading-tight">
                Создаём памятники, которые сохраняют память о ваших близких
              </p>
            </div>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-8 md:mt-0">
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
            <div className="flex flex-col md:flex-row md:flex-wrap gap-3 mb-2 items-start mt-auto md:mt-0 md:mb-6">
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
  );
}
