import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface FormData {
  name: string;
  phone: string;
  message: string;
}

interface IndexContactFooterProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  handleSubmit: (e: React.FormEvent) => void;
  selectedImage: string | null;
  setSelectedImage: (url: string | null) => void;
}

export default function IndexContactFooter({
  formData,
  setFormData,
  handleSubmit,
  selectedImage,
  setSelectedImage
}: IndexContactFooterProps) {
  return (
    <>
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

            <Card className="overflow-hidden mt-6">
              <CardContent className="p-0">
                <iframe 
                  src="https://yandex.ru/map-widget/v1/?ll=31.322484%2C58.545862&z=17&l=map&pt=31.322484,58.545862,pm2rdm"
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
            <div className="mt-3">
              <Link 
                to="/legal" 
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <Icon name="FileText" size={14} />
                Правовая информация и условия оказания услуг
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}