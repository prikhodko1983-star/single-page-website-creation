import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  addDatesElement: () => void;
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
}

type ToolPanel = 'fio' | 'dates' | 'epitaph' | 'text' | 'photo' | 'cross' | 'flower' | null;

const TOOLS = [
  { key: 'fio' as ToolPanel, icon: 'User', label: 'ФИО' },
  { key: 'dates' as ToolPanel, icon: 'Calendar', label: 'Даты' },
  { key: 'epitaph' as ToolPanel, icon: 'Quote', label: 'Эпитафия' },
  { key: 'text' as ToolPanel, icon: 'Type', label: 'Текст' },
  { key: 'photo' as ToolPanel, icon: 'Camera', label: 'Портрет' },
  { key: 'cross' as ToolPanel, icon: 'Cross', label: 'Крест' },
  { key: 'flower' as ToolPanel, icon: 'Flower2', label: 'Цветок' },
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
}: MobileElementsToolbarProps) => {
  const [activePanel, setActivePanel] = useState<ToolPanel>(null);
  const [mobileCustomText, setMobileCustomText] = useState('');
  const [mobileCustomTextFont, setMobileCustomTextFont] = useState('');

  const toggle = (key: ToolPanel) => {
    setActivePanel(prev => prev === key ? null : key);
  };

  const close = () => setActivePanel(null);

  if (typeof window !== 'undefined' && window.innerWidth >= 1024) return null;

  return (
    <>
      {/* Вертикальная панель иконок слева */}
      <div className="lg:hidden fixed left-0 z-40 flex flex-col items-center gap-1 py-2 bg-[#1a1a1a] border-r border-white/10 shadow-lg"
        style={{ top: '104px', bottom: '40px', width: '48px' }}
      >
        {TOOLS.map((tool) => (
          <button
            key={tool.key}
            onClick={() => toggle(tool.key)}
            className={`w-10 h-10 flex flex-col items-center justify-center rounded transition-colors gap-0.5 ${
              activePanel === tool.key
                ? 'bg-primary text-primary-foreground'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
            title={tool.label}
          >
            <Icon name={tool.icon as Parameters<typeof Icon>[0]['name']} size={18} />
            <span className="text-[7px] leading-none">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Затемнение фона при открытом панели */}
      {activePanel && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          style={{ top: '104px' }}
          onClick={close}
        />
      )}

      {/* Bottom sheet панель */}
      {activePanel && (
        <div className="lg:hidden fixed left-0 right-0 bottom-10 z-50 bg-[#1e1e1e] border-t border-white/10 rounded-t-2xl shadow-2xl max-h-[65vh] overflow-y-auto">
          {/* Хэндл */}
          <div className="flex items-center justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* ФИО */}
          {activePanel === 'fio' && (
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">ФИО</span>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
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
                <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
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
              <Button
                className="w-full"
                onClick={() => { addFIOElement(); close(); }}
                disabled={!surname && !name && !patronymic}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить ФИО
              </Button>
            </div>
          )}

          {/* Даты */}
          {activePanel === 'dates' && (
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Даты жизни</span>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-white/50">Дата рождения</Label>
                  <Input
                    placeholder="01.01.1950"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-white/50">Дата смерти</Label>
                  <Input
                    placeholder="01.01.2024"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-white/50">Шрифт дат</Label>
                <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
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
              <Button
                className="w-full"
                onClick={() => { addDatesElement(); close(); }}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить даты
              </Button>
            </div>
          )}

          {/* Эпитафия */}
          {activePanel === 'epitaph' && (
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Эпитафия</span>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              <p className="text-xs text-white/40">Выберите готовый текст или добавьте свой</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
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
              </div>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => { addEpitaphElement(); close(); }}
              >
                <Icon name="Edit3" size={16} className="mr-2" />
                Написать свою эпитафию
              </Button>
            </div>
          )}

          {/* Текст */}
          {activePanel === 'text' && (
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Свободный текст</span>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              <textarea
                placeholder="Введите текст..."
                value={mobileCustomText}
                onChange={(e) => setMobileCustomText(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded text-white placeholder:text-white/30 text-sm p-2 resize-none focus:outline-none focus:border-primary"
              />
              <div className="space-y-1">
                <Label className="text-xs text-white/50">Шрифт</Label>
                <div className="grid grid-cols-3 gap-1.5 max-h-28 overflow-y-auto">
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
          )}

          {/* Портрет */}
          {activePanel === 'photo' && (
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Портрет</span>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              <p className="text-xs text-white/40">Загрузите фотографию или выберите шаблон</p>
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
          )}

          {/* Кресты */}
          {activePanel === 'cross' && (
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Кресты</span>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              {isLoadingCrosses ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : crosses.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
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
          )}

          {/* Цветы */}
          {activePanel === 'flower' && (
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Цветы</span>
                <button onClick={close} className="text-white/40 hover:text-white">
                  <Icon name="X" size={16} />
                </button>
              </div>
              {isLoadingFlowers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : flowers.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {flowers.map((flower) => (
                    <button
                      key={flower.id}
                      onClick={() => { addImageElement(flower.image_url, 'flower'); close(); }}
                      className="aspect-square rounded border-2 border-white/10 hover:border-primary transition-all p-2 bg-white/5 hover:bg-primary/5 flex flex-col"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <img src={flower.image_url} alt={flower.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="text-[9px] text-center mt-1 text-white/40 truncate">{flower.name}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/40 text-center py-6">Цветы не найдены</p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MobileElementsToolbar;