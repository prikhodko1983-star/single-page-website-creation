import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";

interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'cross' | 'flower' | 'epitaph' | 'fio' | 'dates' | 'photo';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string;
  fontSize?: number;
  color?: string;
  rotation?: number;
  fontFamily?: string;
  screenMode?: boolean;
  processedSrc?: string;
  lineHeight?: number;
  letterSpacing?: number;
}

interface ConstructorLibraryProps {
  monumentImage: string;
  setMonumentImage: (src: string) => void;
  addTextElement: () => void;
  addEpitaphElement: () => void;
  addImageElement: (src: string, type: 'image' | 'cross' | 'flower') => void;
  addFIOElement: () => void;
  addDatesElement: () => void;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  photoInputRef: React.RefObject<HTMLInputElement>;
  surname: string;
  setSurname: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  patronymic: string;
  setPatronymic: (value: string) => void;
  selectedFont: string;
  setSelectedFont: (value: string) => void;
  birthDate: string;
  setBirthDate: (value: string) => void;
  deathDate: string;
  setDeathDate: (value: string) => void;
  selectedDateFont: string;
  setSelectedDateFont: (value: string) => void;
  catalogCategories: Array<{id: number, name: string}>;
  catalogProducts: Array<{id: number, name: string, category_id: number, image_url: string | null}>;
  selectedCategory: number | null;
  setSelectedCategory: (id: number) => void;
  isLoadingCatalog: boolean;
  loadCatalog: () => void;
  monumentImages: Array<{id: string, src: string, name: string}>;
  fonts: Array<{id: string, name: string, style: string, weight: string, example: string, fullStyle: string}>;
}

export const ConstructorLibrary = ({
  monumentImage,
  setMonumentImage,
  addTextElement,
  addEpitaphElement,
  addImageElement,
  addFIOElement,
  addDatesElement,
  handlePhotoUpload,
  photoInputRef,
  surname,
  setSurname,
  name,
  setName,
  patronymic,
  setPatronymic,
  selectedFont,
  setSelectedFont,
  birthDate,
  setBirthDate,
  deathDate,
  setDeathDate,
  selectedDateFont,
  setSelectedDateFont,
  catalogCategories,
  catalogProducts,
  selectedCategory,
  setSelectedCategory,
  isLoadingCatalog,
  loadCatalog,
  monumentImages,
  fonts,
}: ConstructorLibraryProps) => {
  return (
    <Card className="h-fit">
      <CardContent className="p-4">
        <h2 className="font-oswald font-bold text-lg mb-4">Библиотека элементов</h2>
        
        <Tabs defaultValue="catalog" className="w-full" onValueChange={(value) => {
          if (value === 'catalog') loadCatalog();
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="catalog">Каталог</TabsTrigger>
            <TabsTrigger value="monuments">Шаблоны</TabsTrigger>
            <TabsTrigger value="elements">Элементы</TabsTrigger>
          </TabsList>
          
          <TabsContent value="catalog" className="space-y-3 mt-4">
            <Label>Памятники из каталога магазина</Label>
            
            {isLoadingCatalog ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {catalogCategories.length > 0 && (
                  <Tabs value={selectedCategory?.toString()} onValueChange={(val) => setSelectedCategory(parseInt(val))} className="w-full">
                    <TabsList className="w-full flex-wrap h-auto">
                      {catalogCategories.map(cat => (
                        <TabsTrigger key={cat.id} value={cat.id.toString()} className="text-xs">
                          {cat.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {catalogCategories.map(cat => (
                      <TabsContent key={cat.id} value={cat.id.toString()} className="mt-3">
                        <div className="grid grid-cols-2 gap-2">
                          {catalogProducts
                            .filter(p => p.category_id === cat.id && p.image_url)
                            .map(product => (
                              <button
                                key={product.id}
                                onClick={() => setMonumentImage(product.image_url!)}
                                className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                                  monumentImage === product.image_url ? 'border-primary' : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <img src={product.image_url!} alt={product.name} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                                  {product.name}
                                </div>
                              </button>
                            ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
                
                {catalogProducts.length === 0 && !isLoadingCatalog && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Каталог пуст
                  </p>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="monuments" className="space-y-3 mt-4">
            <Label>Выберите памятник</Label>
            <div className="grid grid-cols-2 gap-2">
              {monumentImages.map(img => (
                <button
                  key={img.id}
                  onClick={() => setMonumentImage(img.src)}
                  className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                    monumentImage === img.src ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                    {img.name}
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="elements" className="space-y-3 mt-4">
            <div className="space-y-3 p-3 bg-secondary/20 rounded-lg">
              <Label className="font-semibold">ФИО с выбором шрифта</Label>
              <Input 
                placeholder="Фамилия" 
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
              <Input 
                placeholder="Имя" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input 
                placeholder="Отчество" 
                value={patronymic}
                onChange={(e) => setPatronymic(e.target.value)}
              />
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {fonts.map(font => (
                  <button
                    key={font.id}
                    onClick={() => setSelectedFont(font.id)}
                    className={`w-full text-left p-2 rounded border transition-all ${
                      selectedFont === font.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-xs text-muted-foreground">{font.name}</div>
                    <div 
                      className="text-base"
                      style={{ fontFamily: font.style, fontWeight: font.weight }}
                    >
                      {font.example}
                    </div>
                  </button>
                ))}
              </div>
              
              <Button 
                onClick={addFIOElement} 
                className="w-full"
                disabled={!surname && !name && !patronymic}
              >
                <Icon name="ArrowRight" size={18} className="mr-2" />
                ДОБАВИТЬ
              </Button>
            </div>
            
            <div className="space-y-3 p-3 bg-secondary/20 rounded-lg">
              <Label className="font-semibold">Даты жизни</Label>
              <Input 
                placeholder="Дата рождения (01.01.1950)" 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              <Input 
                placeholder="Дата смерти (01.01.2020)" 
                value={deathDate}
                onChange={(e) => setDeathDate(e.target.value)}
              />
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {fonts.map(font => (
                  <button
                    key={font.id}
                    onClick={() => setSelectedDateFont(font.id)}
                    className={`w-full text-left p-2 rounded border transition-all ${
                      selectedDateFont === font.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-xs text-muted-foreground">{font.name}</div>
                    <div 
                      className="text-base"
                      style={{ fontFamily: font.style, fontWeight: font.weight }}
                    >
                      01.01.1950 — 01.01.2020
                    </div>
                  </button>
                ))}
              </div>
              
              <Button 
                onClick={addDatesElement} 
                className="w-full"
                disabled={!birthDate && !deathDate}
              >
                <Icon name="Calendar" size={18} className="mr-2" />
                ДОБАВИТЬ ДАТЫ
              </Button>
            </div>
            
            <div className="space-y-2">
              <input 
                ref={photoInputRef}
                type="file" 
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <Button 
                onClick={() => photoInputRef.current?.click()} 
                variant="default" 
                className="w-full justify-start bg-primary"
              >
                <Icon name="Image" size={18} className="mr-2" />
                Добавить фотографию
              </Button>
            </div>
            
            <Button onClick={addTextElement} variant="outline" className="w-full justify-start">
              <Icon name="Type" size={18} className="mr-2" />
              Добавить текст
            </Button>
            
            <Button onClick={addEpitaphElement} variant="outline" className="w-full justify-start">
              <Icon name="FileText" size={18} className="mr-2" />
              Добавить эпитафию
            </Button>
            
            <div className="space-y-2">
              <Label>Кресты</Label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => addImageElement('https://cdn.poehali.dev/files/d84cc9c9-aa3d-41ad-bc4c-ecf91a1ffa36.png', 'cross')} 
                  className="aspect-square rounded border-2 border-border hover:border-primary transition-all p-2 bg-secondary/20"
                  title="Классический крест"
                >
                  <img src="https://cdn.poehali.dev/files/d84cc9c9-aa3d-41ad-bc4c-ecf91a1ffa36.png" alt="Крест 1" className="w-full h-full object-contain" />
                </button>
                <button 
                  onClick={() => addImageElement('https://cdn.poehali.dev/files/9b0c4e1f-8d2a-4c3b-b5e6-7f8a9c0d1e2f.png', 'cross')} 
                  className="aspect-square rounded border-2 border-border hover:border-primary transition-all p-2 bg-secondary/20"
                  title="Православный крест"
                >
                  <div className="w-full h-full flex items-center justify-center text-4xl">☦</div>
                </button>
                <button 
                  onClick={() => addImageElement('https://cdn.poehali.dev/files/a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6.png', 'cross')} 
                  className="aspect-square rounded border-2 border-border hover:border-primary transition-all p-2 bg-secondary/20"
                  title="Кельтский крест"
                >
                  <div className="w-full h-full flex items-center justify-center text-4xl">✝</div>
                </button>
                <button 
                  onClick={() => addImageElement('https://cdn.poehali.dev/files/b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7.png', 'cross')} 
                  className="aspect-square rounded border-2 border-border hover:border-primary transition-all p-2 bg-secondary/20"
                  title="Византийский крест"
                >
                  <div className="w-full h-full flex items-center justify-center text-4xl">✚</div>
                </button>
                <button 
                  onClick={() => addImageElement('https://cdn.poehali.dev/files/c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8.png', 'cross')} 
                  className="aspect-square rounded border-2 border-border hover:border-primary transition-all p-2 bg-secondary/20"
                  title="Латинский крест"
                >
                  <div className="w-full h-full flex items-center justify-center text-4xl">†</div>
                </button>
                <button 
                  onClick={() => addImageElement('https://cdn.poehali.dev/files/d4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9.png', 'cross')} 
                  className="aspect-square rounded border-2 border-border hover:border-primary transition-all p-2 bg-secondary/20"
                  title="Крест с розами"
                >
                  <div className="w-full h-full flex items-center justify-center text-3xl">✟</div>
                </button>
              </div>
            </div>
            
            <Button 
              onClick={() => addImageElement('https://cdn.poehali.dev/files/flower-icon.png', 'flower')} 
              variant="outline" 
              className="w-full justify-start"
            >
              <Icon name="Flower" size={18} className="mr-2" />
              Добавить цветы
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};