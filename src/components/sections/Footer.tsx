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
            <a href="https://vk.ru/vekpam" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80" title="ВКонтакте">
              <img src="https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/d013d239-bfaa-4a1b-a14c-18c8d933ee0d.png" alt="ВКонтакте" width={34} height={34} className="rounded-lg" />
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