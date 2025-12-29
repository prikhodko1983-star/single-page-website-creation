import Icon from "@/components/ui/icon";

const Maintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Иконка */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="Wrench" size={48} className="text-primary" />
          </div>
        </div>

        {/* Заголовок */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Сайт на техобслуживании
          </h1>
          <p className="text-lg text-muted-foreground">
            Мы проводим технические работы для улучшения сервиса. 
            Скоро всё заработает!
          </p>
        </div>

        {/* Контакты */}
        <div className="pt-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            По вопросам обращайтесь:
          </p>
          <a 
            href="mailto:info@example.com" 
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Icon name="Mail" size={16} />
            info@example.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
