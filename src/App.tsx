import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Constructor from "./pages/Constructor";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const NavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  if (location.pathname === '/login') {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Навигация по центру */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          <Button
            variant={location.pathname === "/" ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/")}
          >
            <Icon name="Home" size={16} className="mr-2" />
            Главная
          </Button>
          <Button
            variant={location.pathname === "/catalog" || location.pathname.startsWith("/product") ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/catalog")}
          >
            <Icon name="ShoppingBag" size={16} className="mr-2" />
            Каталог
          </Button>
          <Button
            variant={location.pathname === "/admin" ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/admin")}
          >
            <Icon name="Settings" size={16} className="mr-2" />
            Админка
          </Button>
          <Button
            variant={location.pathname === "/constructor" ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/constructor")}
          >
            <Icon name="Wrench" size={16} className="mr-2" />
            Конструктор
          </Button>
        </nav>

        {/* Мобильное меню */}
        <div className="md:hidden flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Icon name={isOpen ? "X" : "Menu"} size={20} />
          </Button>
        </div>

        {/* Кнопки справа (только на десктопе) */}
        <div className="hidden md:flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => window.open('https://docs.poehali.dev', '_blank')}>
            <Icon name="BookOpen" size={16} className="mr-2" />
            Документация
          </Button>
        </div>
      </div>

      {/* Мобильное выпадающее меню */}
      {isOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-2 flex flex-col gap-1">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              size="sm"
              onClick={() => { navigate("/"); setIsOpen(false); }}
              className="justify-start"
            >
              <Icon name="Home" size={16} className="mr-2" />
              Главная
            </Button>
            <Button
              variant={location.pathname === "/catalog" || location.pathname.startsWith("/product") ? "default" : "ghost"}
              size="sm"
              onClick={() => { navigate("/catalog"); setIsOpen(false); }}
              className="justify-start"
            >
              <Icon name="ShoppingBag" size={16} className="mr-2" />
              Каталог
            </Button>
            <Button
              variant={location.pathname === "/admin" ? "default" : "ghost"}
              size="sm"
              onClick={() => { navigate("/admin"); setIsOpen(false); }}
              className="justify-start"
            >
              <Icon name="Settings" size={16} className="mr-2" />
              Админка
            </Button>
            <Button
              variant={location.pathname === "/constructor" ? "default" : "ghost"}
              size="sm"
              onClick={() => { navigate("/constructor"); setIsOpen(false); }}
              className="justify-start"
            >
              <Icon name="Wrench" size={16} className="mr-2" />
              Конструктор
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const AppContent = () => {
  return (
    <>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/constructor" element={<Constructor />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/legal" element={<Legal />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;