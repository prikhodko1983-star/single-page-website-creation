import Icon from "@/components/ui/icon";

const UnderDevelopment = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Иконка */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Icon name="Code" size={64} className="text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Icon name="Wrench" size={24} className="text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Заголовок */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Сайт в разработке
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Мы работаем над созданием чего-то особенного. 
            Скоро здесь появится крутой сервис!
          </p>
        </div>

        {/* Прогресс */}
        <div className="pt-6">
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Идёт разработка</span>
            </div>
          </div>
        </div>

        {/* Контакты */}
        <div className="pt-8 space-y-3 border-t">
          <p className="text-sm text-muted-foreground">
            Есть вопросы? Свяжитесь с нами:
          </p>
          <a 
            href="mailto:info@example.com" 
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            <Icon name="Mail" size={18} />
            info@example.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default UnderDevelopment;
