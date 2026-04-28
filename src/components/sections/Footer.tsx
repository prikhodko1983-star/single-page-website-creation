import Icon from "@/components/ui/icon";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <div className="font-oswald font-bold text-xl text-primary mb-1">ГРАНИТНЫЕ ПАМЯТНИКИ</div>
            <p className="text-sm text-muted-foreground">© 2024 Все права защищены</p>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="tel:+79960681168" className="text-sm hover:text-primary transition-colors">
              8 (996) 068-11-68
            </a>
            <a href="https://vk.ru/vekpam" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#0077FF] hover:bg-[#0060CC] text-white rounded-lg transition-colors" title="ВКонтакте">
              <Icon name="Users" size={18} />
            </a>
            <a href="https://t.me/79960681168" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#0088cc] hover:bg-[#006699] text-white rounded-lg transition-colors">
              <Icon name="Send" size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;