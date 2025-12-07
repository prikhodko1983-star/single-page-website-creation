import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import RetouchForm from "@/components/RetouchForm";
import BlagoustroySection from "@/components/sections/BlagoustroySection";

interface Service {
  icon: string;
  title: string;
  desc: string;
}

interface Advantage {
  icon: string;
  title: string;
  desc: string;
}

interface Price {
  name: string;
  price: string;
}

interface PortfolioImage {
  url: string;
  title: string;
  desc: string;
}

interface IndexContentSectionsProps {
  services: Service[];
  advantages: Advantage[];
  prices: Price[];
  portfolioImages: PortfolioImage[];
  setSelectedImage: (url: string) => void;
}

export default function IndexContentSections({
  services,
  advantages,
  prices,
  portfolioImages,
  setSelectedImage
}: IndexContentSectionsProps) {
  return (
    <>
      <section id="services" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
              Услуги по изготовлению памятников
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Полный комплекс услуг от изготовления до установки
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3 max-w-6xl mx-auto">
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
                        alt="Старое фото до реставрации - поврежденная фотография для памятника"
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
                        alt="Отреставрированное фото для памятника - профессиональная ретушь в Великом Новгороде"
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

      <BlagoustroySection />

      <section id="portfolio" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-4">
              Наши работы
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Примеры выполненных проектов — качество, которому доверяют
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-7xl mx-auto">
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

      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-oswald font-bold text-3xl md:text-5xl mb-3">
              Почему выбирают нас
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Профессионализм и качество проверенные временем
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {advantages.map((adv, idx) => (
              <div 
                key={idx} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name={adv.icon as any} className="text-primary" size={32} />
                </div>
                <h3 className="font-oswald font-semibold text-lg mb-2">{adv.title}</h3>
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
    </>
  );
}