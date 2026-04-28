import { useState, useEffect, useRef, Fragment } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
  lineHeight?: number;
  autoSize?: boolean;
}

interface MobileElementsToolbarProps {
  addTextElement: (customText?: string, customFont?: string) => void;
  addEpitaphElement: (customText?: string) => void;
  addFIOElement: () => void;
  addDatesElement: (preset?: 'inline' | 'stacked' | 'offset') => void;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  photoInputRef: React.RefObject<HTMLInputElement>;
  surname: string;
  setSurname: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  patronymic: string;
  setPatronymic: (v: string) => void;
  selectedFont: string;
  setSelectedFont: (v: string) => void;
  birthDate: string;
  setBirthDate: (v: string) => void;
  deathDate: string;
  setDeathDate: (v: string) => void;
  selectedDateFont: string;
  setSelectedDateFont: (v: string) => void;
  fonts: Array<{id: string; name: string; style: string; weight: string; example: string; fullStyle: string}>;
  crosses: Array<{id: number; name: string; image_url: string}>;
  isLoadingCrosses: boolean;
  flowers: Array<{id: number; name: string; image_url: string}>;
  isLoadingFlowers: boolean;
  addImageElement: (src: string, type: 'image' | 'cross' | 'flower') => void;
  monumentImage: string;
  setMonumentImage: (src: string) => void;
  catalogCategories: Array<{id: number; name: string}>;
  catalogProducts: Array<{id: number; name: string; category_id: number; image_url: string | null}>;
  selectedCategory: number | null;
  setSelectedCategory: (id: number) => void;
  isLoadingCatalog: boolean;
  loadCatalog: () => void;
}

type ToolPanel = '_catalog' | 'fio' | 'dates' | 'epitaph' | 'text' | 'photo' | 'cross' | 'imageCatalog' | null;

const TOOLS = [
  { key: '_catalog' as ToolPanel, icon: 'Milestone', label: 'Каталог\nпамятников' },
  { key: 'fio' as ToolPanel, icon: 'User', label: 'ФИО' },
  { key: 'dates' as ToolPanel, icon: 'Calendar', label: 'Даты' },
  { key: 'photo' as ToolPanel, icon: 'UserRound', label: 'Портрет' },
  { key: 'text' as ToolPanel, icon: 'Type', label: 'Текст' },
  { key: 'imageCatalog' as ToolPanel, icon: 'Images', label: 'Картинки' },
  { key: 'cross' as ToolPanel, icon: 'Cross', label: 'Крест' },
  { key: 'epitaph' as ToolPanel, icon: 'Quote', label: 'Эпитафия' },
];

export const MobileElementsToolbar = ({
  addTextElement,
  addEpitaphElement,
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
  fonts,
  crosses,
  isLoadingCrosses,
  flowers,
  isLoadingFlowers,
  addImageElement,
  monumentImage,
  setMonumentImage,
  catalogCategories,
  catalogProducts,
  selectedCategory,
  setSelectedCategory,
  isLoadingCatalog,
  loadCatalog,
}: MobileElementsToolbarProps) => {
  const formatDateInput = (value: string, prev: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
  };

  const [activePanel, setActivePanel] = useState<ToolPanel>(null);
  const [selectedDatePreset, setSelectedDatePreset] = useState<'inline' | 'stacked' | 'offset'>('inline');
  const [mobileCustomText, setMobileCustomText] = useState('');
  const [mobileCustomTextFont, setMobileCustomTextFont] = useState('');
  const [imageCategories, setImageCategories] = useState<Array<{id: number, name: string, slug: string}>>([]);
  const [categoryImages, setCategoryImages] = useState<Array<{id: number, category_id: number, name: string, image_url: string}>>([]);
  const [selectedImageCategory, setSelectedImageCategory] = useState<number | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await fetch('https://functions.poehali.dev/dee0114f-9dc3-4783-87b7-346a133d7c73?type=categories');
        if (!res.ok) return;
        const cats = await res.json();
        setImageCategories(cats);
        if (cats.length > 0) {
          setSelectedImageCategory(cats[0].id);
          setIsLoadingImages(true);
          const results = await Promise.all(
            cats.map(async (c: {id: number}) => {
              const r = await fetch(`https://functions.poehali.dev/dee0114f-9dc3-4783-87b7-346a133d7c73?type=images&category_id=${c.id}`);
              return r.ok ? r.json() : [];
            })
          );
          setCategoryImages(results.flat());
          setIsLoadingImages(false);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadImages();
  }, []);

  const [sheetHeight, setSheetHeight] = useState(65);
  const dragStartY = useRef<number | null>(null);
  const dragStartHeight = useRef<number>(65);

  const toggle = (key: ToolPanel) => {
    if (key === '_catalog') loadCatalog();
    setActivePanel(prev => {
      if (prev !== key) setSheetHeight(65);
      return prev === key ? null : key;
    });
  };

  const close = () => { setActivePanel(null); setSheetHeight(65); };

  const onHandleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragStartHeight.current = sheetHeight;
  };

  const onHandleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = dragStartY.current - e.touches[0].clientY;
    const newH = Math.min(92, Math.max(25, dragStartHeight.current + (dy / window.innerHeight) * 100));
    setSheetHeight(newH);
  };

  const onHandleTouchEnd = () => {
    dragStartY.current = null;
    setSheetHeight(prev => {
      if (prev < 35) { close(); return 65; }
      if (prev < 55) return 40;
      if (prev < 75) return 65;
      return 90;
    });
  };

  if (typeof window !== 'undefined' && window.innerWidth >= 1024) return null;

  return (
    <>
      {/* Вертикальная панель иконок слева */}
      <div className="lg:hidden fixed left-0 z-40 flex flex-col items-center gap-1 pt-4 pb-2 bg-[#1a1a1a] border-r border-white/10 shadow-lg"
        style={{ top: '48px', bottom: '0px', width: '48px' }}
      >
        {TOOLS.map((tool, idx) => (
          <Fragment key={tool.key}>
            <button
              onClick={() => toggle(tool.key)}
              className={`w-10 h-10 flex flex-col items-center justify-center rounded transition-colors gap-0.5 ${
                activePanel === tool.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title={tool.label}
            >
              {tool.key === '_catalog' ? (
                <svg width="17" height="17" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <rect x="0" y="88" width="80" height="12" rx="1" fill="currentColor"/>
                  <rect x="8" y="78" width="64" height="12" rx="1" fill="currentColor"/>
                  <path d="M20 78 L20 30 Q20 6 40 6 Q60 6 60 30 L60 78 Z" fill="currentColor"/>
                </svg>
              ) : tool.key === 'cross' ? (
                <svg width="18" height="18" viewBox="0 0 90 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <rect x="38" y="0" width="14" height="160" fill="currentColor"/>
                  <rect x="28" y="8" width="34" height="14" fill="currentColor"/>
                  <rect x="0" y="44" width="90" height="14" fill="currentColor"/>
                  <polygon points="10,98 10,112 38,118 38,106" fill="currentColor"/>
                  <polygon points="52,106 52,118 80,112 80,98" fill="currentColor"/>
                </svg>
              ) : (
                <Icon name={tool.icon as Parameters<typeof Icon>[0]['name']} size={18} />
              )}
              <span className="text-[7px] leading-tight text-center whitespace-pre-wrap">{tool.label}</span>
            </button>
            {idx === 0 && <div className="w-8 border-t border-white/10 my-0.5" />}
          </Fragment>
        ))}
      </div>

      {/* Затемнение фона при открытом панели */}
      {activePanel && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          style={{ top: '64px' }}
          onClick={close}
        />
      )}

      {/* Bottom sheet панель */}
      {activePanel && (
        <div
          className="lg:hidden fixed left-0 right-0 bottom-0 z-50 bg-[#1e1e1e] border-t border-white/10 rounded-t-2xl shadow-2xl flex flex-col"
          style={{ height: `${sheetHeight}vh`, transition: dragStartY.current !== null ? 'none' : 'height 0.25s ease' }}
        >
          {/* Хэндл — тяни для изменения размера */}
          <div
            className="flex items-center justify-center pt-3 pb-1 touch-none cursor-grab active:cursor-grabbing"
            onTouchStart={onHandleTouchStart}
            onTouchMove={onHandleTouchMove}
            onTouchEnd={onHandleTouchEnd}
          >
            <div className="w-12 h-1.5 rounded-full bg-white/30" />
          </div>

          {/* Каталог памятников */}
          {activePanel === '_catalog' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                <span className="text-sm font-semibold text-white">Каталог памятников</span>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              {isLoadingCatalog ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : catalogCategories.length > 0 ? (
                <div className="flex flex-col flex-1 min-h-0 px-4 pb-4">
                  <div className="flex flex-wrap gap-1 shrink-0 mb-3 bg-white/5 rounded-lg p-1">
                    {catalogCategories.map(cat => {
                      const count = catalogProducts.filter(p => p.category_id === cat.id && p.image_url).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex-1 min-w-[80px] px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                            selectedCategory === cat.id
                              ? 'bg-primary text-primary-foreground'
                              : 'text-white/50 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          <Badge variant="secondary" className="ml-1 h-4 text-[10px] px-1 shrink-0">{count}</Badge>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {(() => {
                      const categoryProducts = catalogProducts.filter(p => p.category_id === selectedCategory && p.image_url);
                      return categoryProducts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 pb-2">
                          {categoryProducts.map(product => (
                            <button
                              key={product.id}
                              onClick={() => { setMonumentImage(product.image_url!); close(); }}
                              className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all bg-black/40 ${
                                monumentImage === product.image_url ? 'border-primary ring-2 ring-primary/20' : 'border-white/10 hover:border-primary/50'
                              }`}
                            >
                              <img src={product.image_url!} alt={product.name} className="w-full h-full object-contain p-2" />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent text-white text-xs p-2 text-center">
                                <div className="font-medium">{product.name}</div>
                              </div>
                              {monumentImage === product.image_url && (
                                <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                                  <Icon name="Check" size={12} className="text-primary-foreground" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-white/30">
                          <p className="text-sm">Нет памятников в этой категории</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-white/30 px-3">
                  <Icon name="Package" size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-medium">Каталог пуст</p>
                </div>
              )}
            </div>
          )}

          {/* ФИО */}
          {activePanel === 'fio' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                <span className="text-sm font-semibold text-white">ФИО</span>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              {/* Превью ФИО в выбранном шрифте */}
              <div className="px-4 pb-2 flex-shrink-0">
                <div className="rounded-lg bg-black/40 border border-white/20 flex flex-col items-center justify-center py-3 px-4 min-h-[64px]">
                  {(() => {
                    const f = fonts.find(f => f.id === selectedFont);
                    const lines = [surname, name, patronymic].filter(Boolean);
                    const preview = lines.length > 0 ? lines : ['Фамилия', 'Имя', 'Отчество'];
                    return preview.map((line, i) => (
                      <span
                        key={i}
                        className="text-white text-base text-center leading-tight"
                        style={{ fontFamily: f?.style, fontWeight: f?.weight, opacity: lines.length === 0 ? 0.3 : 1 }}
                      >
                        {line}
                      </span>
                    ));
                  })()}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3 min-h-0">
              <div className="space-y-2">
                <Input
                  placeholder="Фамилия"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
                <Input
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
                <Input
                  placeholder="Отчество"
                  value={patronymic}
                  onChange={(e) => setPatronymic(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-white/50">Шрифт</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setSelectedFont(font.id)}
                      className={`px-2 py-1.5 rounded border text-left transition-all ${
                        selectedFont === font.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-white/10 hover:border-primary/50 text-white/70'
                      }`}
                    >
                      <div className="text-[9px] text-white/40 truncate">{font.name}</div>
                      <div className="text-xs truncate" style={{ fontFamily: font.style, fontWeight: font.weight }}>
                        {font.example.slice(0, 8)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              </div>
              <div className="px-4 pb-4 flex-shrink-0">
                <Button
                  className="w-full"
                  onClick={() => { addFIOElement(); close(); }}
                  disabled={!surname && !name && !patronymic}
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить ФИО
                </Button>
              </div>
            </div>
          )}

          {/* Даты */}
          {activePanel === 'dates' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                <span className="text-sm font-semibold text-white">Даты жизни</span>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              {/* Превью — фиксировано, не скроллится */}
              <div className="px-4 pt-1 flex-shrink-0">
                <div className="rounded-lg bg-black/40 border border-white/20 flex items-center justify-center py-3 px-4 min-h-[64px]">
                  {(() => {
                    const f = fonts.find(f => f.id === selectedDateFont);
                    const b = birthDate || '15.03.1950';
                    const d = deathDate || '07.11.2024';
                    const isEmpty = !birthDate && !deathDate;
                    const previewText =
                      selectedDatePreset === 'inline' ? `${b} – ${d}` :
                      selectedDatePreset === 'stacked' ? `${b}\n${d}` :
                      `${b}\n      ${d}`;
                    const previewAlign = selectedDatePreset === 'offset' ? 'left' : 'center';
                    return (
                      <span
                        className="text-white text-base whitespace-pre"
                        style={{
                          fontFamily: f?.style,
                          fontWeight: f?.weight,
                          opacity: isEmpty ? 0.3 : 1,
                          lineHeight: 1.3,
                          textAlign: previewAlign,
                          display: 'block',
                        }}
                      >
                        {previewText}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3 min-h-0">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-white/50">Дата рождения</Label>
                  <Input
                    placeholder="01.01.1950"
                    value={birthDate}
                    onChange={(e) => setBirthDate(formatDateInput(e.target.value, birthDate))}
                    inputMode="numeric"
                    maxLength={10}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-white/50">Дата смерти</Label>
                  <Input
                    placeholder="01.01.2024"
                    value={deathDate}
                    onChange={(e) => setDeathDate(formatDateInput(e.target.value, deathDate))}
                    inputMode="numeric"
                    maxLength={10}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-white/50">Шрифт дат</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setSelectedDateFont(font.id)}
                      className={`px-2 py-1.5 rounded border text-left transition-all ${
                        selectedDateFont === font.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-white/10 hover:border-primary/50 text-white/70'
                      }`}
                    >
                      <div className="text-[9px] text-white/40 truncate">{font.name}</div>
                      <div className="text-xs truncate" style={{ fontFamily: font.style, fontWeight: font.weight }}>
                        1950–2024
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Пресеты расположения */}
              <div className="space-y-1">
                <Label className="text-xs text-white/50">Расположение</Label>
                {(() => {
                  const f = fonts.find(f => f.id === selectedDateFont);
                  const b = birthDate || '15.03.1950';
                  const d = deathDate || '07.11.2024';
                  const presets: Array<{ key: 'inline' | 'stacked' | 'offset'; label: string; preview: string; align: 'center' | 'left' }> = [
                    { key: 'inline', label: 'В строку', preview: `${b} – ${d}`, align: 'center' },
                    { key: 'stacked', label: 'Столбцом', preview: `${b}\n${d}`, align: 'center' },
                    { key: 'offset', label: 'Со сдвигом', preview: `${b}\n      ${d}`, align: 'left' },
                  ];
                  return (
                    <div className="grid grid-cols-3 gap-2">
                      {presets.map(p => {
                        const isActive = selectedDatePreset === p.key;
                        return (
                          <button
                            key={p.key}
                            onClick={() => setSelectedDatePreset(p.key)}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded border transition-all ${
                              isActive
                                ? 'border-primary bg-primary/15 ring-1 ring-primary'
                                : 'border-white/10 hover:border-primary/60 hover:bg-primary/10'
                            }`}
                          >
                            <div className={`rounded w-full flex items-center justify-center py-2 px-1 min-h-[40px] ${isActive ? 'bg-black/60' : 'bg-black/50'}`}>
                              <span
                                className={`text-white leading-tight whitespace-pre ${p.key === 'inline' ? 'whitespace-nowrap' : 'whitespace-pre'}`}
                                style={{
                                  fontFamily: f?.style,
                                  fontWeight: f?.weight,
                                  fontSize: p.key === 'inline' ? '6px' : '9px',
                                  textAlign: p.align,
                                  display: 'block',
                                  width: '100%',
                                  lineHeight: 1.3,
                                }}
                              >
                                {p.preview}
                              </span>
                            </div>
                            <span className={`text-[10px] text-center leading-tight ${isActive ? 'text-primary' : 'text-white/50'}`}>{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
              </div>
              <div className="px-4 pb-4 flex-shrink-0">
              <Button
                className="w-full"
                onClick={() => { addDatesElement(selectedDatePreset); close(); }}
                disabled={!birthDate && !deathDate}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить даты
              </Button>
              </div>
            </div>
          )}

          {/* Эпитафия */}
          {activePanel === 'epitaph' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                <div>
                  <span className="text-sm font-semibold text-white">Эпитафия</span>
                  <p className="text-xs text-white/40">Выберите готовый текст или добавьте свой</p>
                </div>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                {[
                  'Помним. Любим. Скорбим.',
                  'Ты всегда в нашей памяти.',
                  'Спасибо за все.',
                  'Вечная память о тебе в сердцах близких.',
                  'Покойся с миром в Царствии Небесном.',
                  'Вечная память.',
                  'Помним, скорбим…',
                  'Опустела без тебя земля.',
                  'Любим и помним.',
                  'Память сильнее смерти.',
                  'Рождение – не начало, смерть – не конец.',
                ].map((text, idx) => (
                  <button
                    key={idx}
                    onClick={() => { addEpitaphElement(text); close(); }}
                    className="w-full text-left px-3 py-2.5 rounded-lg border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <p className="text-sm italic text-white/70">{text}</p>
                  </button>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  onClick={() => { addEpitaphElement(); close(); }}
                >
                  <Icon name="Edit3" size={16} className="mr-2" />
                  Написать свою эпитафию
                </Button>
              </div>
            </div>
          )}

          {/* Текст */}
          {activePanel === 'text' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                <span className="text-sm font-semibold text-white">Свободный текст</span>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pt-1 pb-2 space-y-3 min-h-0">
                <textarea
                  placeholder="Введите текст..."
                  value={mobileCustomText}
                  onChange={(e) => setMobileCustomText(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded text-white placeholder:text-white/30 text-sm p-2 resize-none focus:outline-none focus:border-primary"
                />
                <div className="space-y-1">
                  <Label className="text-xs text-white/50">Шрифт</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {fonts.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setMobileCustomTextFont(font.fullStyle)}
                        className={`px-2 py-1.5 rounded border text-left transition-all ${
                          mobileCustomTextFont === font.fullStyle
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-white/10 hover:border-primary/50 text-white/70'
                        }`}
                      >
                        <div className="text-[9px] text-white/40 truncate">{font.name}</div>
                        <div className="text-xs truncate" style={{ fontFamily: font.style, fontWeight: font.weight }}>
                          {font.example.slice(0, 8)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4 flex-shrink-0">
                <Button
                  className="w-full"
                  onClick={() => {
                    addTextElement(mobileCustomText || undefined, mobileCustomTextFont || undefined);
                    setMobileCustomText('');
                    close();
                  }}
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить текст
                </Button>
              </div>
            </div>
          )}

          {/* Портрет */}
          {activePanel === 'photo' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                <div>
                  <span className="text-sm font-semibold text-white">Портрет</span>
                  <p className="text-xs text-white/40">Загрузите фото или выберите шаблон</p>
                </div>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 text-center">Мужские</p>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      'https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/5be3255b-1f30-4759-8daf-1c364342e4e7.jpg',
                      'https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/1a839d6b-b217-4729-bfc9-58961b033575.jpg',
                    ].map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => { addImageElement(src, 'image'); close(); }}
                        className="aspect-[3/4] rounded overflow-hidden border-2 border-white/10 hover:border-primary transition-all"
                      >
                        <img src={src} alt="Портрет" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 text-center">Женские</p>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      'https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/e1a552a7-32c5-4385-99b6-143f6b05e8b7.jpg',
                      'https://cdn.poehali.dev/projects/522c6aad-08c3-4e8e-ac23-7f70b446ea53/bucket/81e2b99f-4600-4a07-8bd0-9387efad0f57.jpg',
                    ].map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => { addImageElement(src, 'image'); close(); }}
                        className="aspect-[3/4] rounded overflow-hidden border-2 border-white/10 hover:border-primary transition-all"
                      >
                        <img src={src} alt="Портрет" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => { handlePhotoUpload(e); close(); }}
                className="hidden"
              />
              <Button
                className="w-full"
                onClick={() => photoInputRef.current?.click()}
              >
                <Icon name="Upload" size={16} className="mr-2" />
                Загрузить свой портрет
              </Button>
              </div>
            </div>
          )}

          {/* Кресты */}
          {activePanel === 'cross' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                <span className="text-sm font-semibold text-white">Кресты</span>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4">
              {isLoadingCrosses ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : crosses.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {crosses.map((cross) => (
                    <button
                      key={cross.id}
                      onClick={() => { addImageElement(cross.image_url, 'cross'); close(); }}
                      className="aspect-square rounded border-2 border-white/10 hover:border-primary transition-all p-2 bg-white/5 hover:bg-primary/5 flex flex-col"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <img src={cross.image_url} alt={cross.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="text-[9px] text-center mt-1 text-white/40 truncate">{cross.name}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/40 text-center py-6">Кресты не найдены</p>
              )}
              </div>
            </div>
          )}

          {/* Каталог изображений */}
          {activePanel === 'imageCatalog' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                <span className="text-sm font-semibold text-white">Каталог изображений</span>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
              {isLoadingImages ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : imageCategories.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-1 bg-white/5 rounded-lg p-1">
                    {imageCategories.map(cat => {
                      const count = categoryImages.filter(img => img.category_id === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedImageCategory(cat.id)}
                          className={`px-1.5 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 w-full ${
                            selectedImageCategory === cat.id
                              ? 'bg-primary text-primary-foreground'
                              : 'text-white/50 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span className="truncate max-w-[60px]">{cat.name}</span>
                          <span className="shrink-0 bg-white/20 rounded-full text-[10px] px-1 leading-4">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pb-2">
                    {categoryImages.filter(img => img.category_id === selectedImageCategory).map(image => (
                      <button
                        key={image.id}
                        onClick={() => { addImageElement(image.image_url, 'image'); close(); }}
                        className="rounded border-2 border-white/10 hover:border-primary transition-all bg-black/40 hover:bg-primary/5 overflow-hidden flex flex-col"
                      >
                        <div className="flex items-center justify-center p-2" style={{ height: '110px' }}>
                          <img src={image.image_url} alt={image.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="bg-black/60 text-white text-[9px] px-1 py-1 text-center truncate w-full">
                          {image.name}
                        </div>
                      </button>
                    ))}
                    {categoryImages.filter(img => img.category_id === selectedImageCategory).length === 0 && (
                      <p className="col-span-3 text-sm text-white/40 text-center py-6">Нет изображений</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/40 text-center py-6">Категории не найдены</p>
              )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MobileElementsToolbar;