import React from "react";
import Icon from "@/components/ui/icon";

interface CanvasElementData {
  id: string;
  type: 'text' | 'image' | 'cross' | 'flower' | 'epitaph' | 'fio' | 'dates' | 'photo';
  content?: string;
  src?: string;
  processedSrc?: string;
}

interface ConstructorLayersProps {
  elements: CanvasElementData[];
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onMoveToFront: (id: string) => void;
  onMoveToBack: (id: string) => void;
  onDelete: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  text: 'Текст',
  image: 'Изображение',
  cross: 'Крест',
  flower: 'Цветок',
  epitaph: 'Эпитафия',
  fio: 'ФИО',
  dates: 'Даты',
  photo: 'Портрет',
};

const TYPE_ICONS: Record<string, string> = {
  text: 'Type',
  image: 'Image',
  cross: 'Cross',
  flower: 'Flower2',
  epitaph: 'Quote',
  fio: 'User',
  dates: 'Calendar',
  photo: 'Camera',
};

function getLayerLabel(el: CanvasElementData): string {
  if (el.type === 'fio' || el.type === 'text' || el.type === 'epitaph' || el.type === 'dates') {
    if (el.content && el.content.trim()) {
      const short = el.content.replace(/\n/g, ' ').trim();
      return short.length > 22 ? short.slice(0, 22) + '…' : short;
    }
  }
  return TYPE_LABELS[el.type] ?? el.type;
}

const ConstructorLayers: React.FC<ConstructorLayersProps> = ({
  elements,
  selectedElement,
  setSelectedElement,
  onMoveUp,
  onMoveDown,
  onMoveToFront,
  onMoveToBack,
  onDelete,
}) => {
  const reversed = [...elements].reverse();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
        <Icon name="Layers" size={14} className="text-white/50" />
        <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Слои</span>
        <span className="ml-auto text-xs text-white/30">{elements.length}</span>
      </div>

      {elements.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-xs text-white/30 text-center px-4">
          Добавьте элементы на макет
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {reversed.map((el, reversedIdx) => {
          const originalIdx = elements.length - 1 - reversedIdx;
          const isSelected = selectedElement === el.id;
          const isTop = originalIdx === elements.length - 1;
          const isBottom = originalIdx === 0;

          return (
            <div
              key={el.id}
              onClick={() => setSelectedElement(el.id)}
              className={`group flex items-center gap-2 px-2 py-1.5 cursor-pointer border-b border-white/5 transition-colors ${
                isSelected
                  ? 'bg-primary/20 border-l-2 border-l-primary'
                  : 'hover:bg-white/5'
              }`}
            >
              {/* Превью */}
              <div className="w-7 h-7 flex-shrink-0 rounded overflow-hidden bg-white/5 flex items-center justify-center">
                {(el.type === 'image' || el.type === 'cross' || el.type === 'flower' || el.type === 'photo') && (el.processedSrc || el.src) ? (
                  <img
                    src={el.processedSrc || el.src}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Icon
                    name={TYPE_ICONS[el.type] as Parameters<typeof Icon>[0]['name']}
                    fallback="Square"
                    size={14}
                    className={isSelected ? 'text-primary' : 'text-white/40'}
                  />
                )}
              </div>

              {/* Лейбл */}
              <span className={`flex-1 text-xs truncate ${isSelected ? 'text-white' : 'text-white/60'}`}>
                {getLayerLabel(el)}
              </span>

              {/* Кнопки управления — показываем при наведении или выборе */}
              <div className={`flex items-center gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveToFront(el.id); }}
                  disabled={isTop}
                  title="На передний план"
                  className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-default"
                >
                  <Icon name="ChevronsUp" size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveUp(el.id); }}
                  disabled={isTop}
                  title="Выше"
                  className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-default"
                >
                  <Icon name="ChevronUp" size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveDown(el.id); }}
                  disabled={isBottom}
                  title="Ниже"
                  className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-default"
                >
                  <Icon name="ChevronDown" size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveToBack(el.id); }}
                  disabled={isBottom}
                  title="На задний план"
                  className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-default"
                >
                  <Icon name="ChevronsDown" size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}
                  title="Удалить"
                  className="p-1 rounded hover:bg-red-500/20 text-white/30 hover:text-red-400"
                >
                  <Icon name="Trash2" size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConstructorLayers;
