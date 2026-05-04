import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ImageCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface CatalogImage {
  id: number;
  category_id: number;
  name: string;
  image_url: string;
  category_name: string;
}

const API = "https://functions.poehali.dev/dee0114f-9dc3-4783-87b7-346a133d7c73";

export default function ImageCatalog() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ImageCategory[]>([]);
  const [images, setImages] = useState<CatalogImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState<CatalogImage | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const catRes = await fetch(`${API}?type=categories`);
      const cats: ImageCategory[] = catRes.ok ? await catRes.json() : [];
      setCategories(cats);

      const results = await Promise.all(
        cats.map(async (c) => {
          const r = await fetch(`${API}?type=images&category_id=${c.id}`);
          return r.ok ? r.json() : [];
        })
      );
      setImages(results.flat());
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = images.filter((img) => {
    const matchCat = selectedCategory === null || img.category_id === selectedCategory;
    const matchSearch = search === "" || img.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Шапка */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Каталог изображений</h1>
          <p className="text-muted-foreground mb-6">
            Декоративные элементы для оформления памятников — орнаменты, символы, цветы и другое
          </p>
          <div className="relative max-w-md">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Боковая панель категорий */}
        <aside className="hidden md:block w-52 shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Категории</p>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              Все изображения
              <span className="ml-1 text-xs opacity-60">({images.length})</span>
            </button>
            {categories.map((cat) => {
              const count = images.filter((i) => i.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {cat.name}
                  <span className="ml-1 text-xs opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Хотите использовать изображение?</p>
            <p className="text-xs text-muted-foreground mb-3">Перейдите в конструктор и добавьте любой элемент на памятник</p>
            <Button size="sm" className="w-full" onClick={() => navigate("/constructor")}>
              <Icon name="Wrench" size={14} className="mr-2" />
              Открыть конструктор
            </Button>
          </div>
        </aside>

        {/* Основная область */}
        <div className="flex-1 min-w-0">
          {/* Мобильные категории */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              Все
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Icon name="ImageOff" size={48} className="mx-auto mb-4 opacity-30" />
              <p>Изображения не найдены</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Найдено: {filtered.length} изображений
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtered.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setLightbox(img)}
                    className="group relative bg-muted rounded-lg overflow-hidden aspect-square hover:ring-2 hover:ring-primary transition-all"
                  >
                    <img
                      src={img.image_url}
                      alt={img.name}
                      className="w-full h-full object-contain p-3 transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                      <p className="w-full text-white text-xs px-2 py-1.5 bg-black/50 translate-y-full group-hover:translate-y-0 transition-transform leading-tight">
                        {img.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Лайтбокс */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="bg-card rounded-xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{lightbox.name}</h3>
                <p className="text-sm text-muted-foreground">{lightbox.category_name}</p>
              </div>
              <button onClick={() => setLightbox(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="bg-muted rounded-lg p-6 mb-4 flex items-center justify-center" style={{ minHeight: 200 }}>
              <img
                src={lightbox.image_url}
                alt={lightbox.name}
                className="max-w-full max-h-60 object-contain"
              />
            </div>
            <Button className="w-full" onClick={() => { navigate("/constructor"); setLightbox(null); }}>
              <Icon name="Wrench" size={16} className="mr-2" />
              Добавить на памятник в конструкторе
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
