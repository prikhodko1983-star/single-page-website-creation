import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  image_url?: string;
  category_name: string;
  is_price_from?: boolean;
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && products.length === 0) {
      loadProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://functions.poehali.dev/119b2e99-2f11-4608-9043-9aae1bf8500d");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error loading products for search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    const q = value.toLowerCase().trim();
    const filtered = products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.category_name || "").toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 8));
  };

  const goToProduct = (slug: string) => {
    setIsOpen(false);
    navigate(`/product/${slug}`);
  };

  const goToCatalog = () => {
    setIsOpen(false);
    navigate("/catalog");
  };

  const formatPrice = (price: string, isPriceFrom?: boolean) => {
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    const formatted = num.toLocaleString("ru-RU") + " ₽";
    return isPriceFrom ? `от ${formatted}` : formatted;
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        title="Поиск товаров"
      >
        <Icon name={isOpen ? "X" : "Search"} size={18} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[400px] bg-background border border-border rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Название или категория..."
                className="pl-9 pr-3"
              />
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            )}

            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Ничего не найдено
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="py-1">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => goToProduct(product.slug)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 object-contain rounded bg-secondary flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                        <Icon name="Image" size={16} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.category_name}</div>
                    </div>
                    <div className="text-sm font-oswald font-bold text-primary whitespace-nowrap">
                      {formatPrice(product.price, product.is_price_from)}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && query.trim().length < 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Введите минимум 2 символа
              </div>
            )}
          </div>

          <div className="p-2 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full" onClick={goToCatalog}>
              <Icon name="LayoutGrid" size={14} className="mr-2" />
              Открыть каталог
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}