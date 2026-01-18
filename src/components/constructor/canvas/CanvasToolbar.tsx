import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import React from "react";

interface CanvasToolbarProps {
  rotateMode: boolean;
  toggleRotateMode: () => void;
  saveDesign: () => void;
  sendForCalculation: () => void;
  exportDesign: () => void;
  exportDesignAsPNG: () => void;
  importDesign: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importInputRef: React.RefObject<HTMLInputElement>;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  rotateMode,
  toggleRotateMode,
  saveDesign,
  sendForCalculation,
  exportDesign,
  exportDesignAsPNG,
  importDesign,
  importInputRef,
}) => {
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        <Button variant="outline" size="sm" onClick={saveDesign}>
          <Icon name="Save" size={16} className="mr-2" />
          Сохранить
        </Button>
        <Button variant="outline" size="sm" onClick={sendForCalculation}>
          <Icon name="Send" size={16} className="mr-2" />
          Отправить на расчет
        </Button>
        <Button variant="outline" size="sm" onClick={exportDesign}>
          <Icon name="Download" size={16} className="mr-2" />
          Экспорт JSON
        </Button>
        <Button variant="outline" size="sm" onClick={exportDesignAsPNG}>
          <Icon name="Image" size={16} className="mr-2" />
          Экспорт PNG
        </Button>
        <Button variant="outline" size="sm" onClick={() => importInputRef.current?.click()}>
          <Icon name="Upload" size={16} className="mr-2" />
          Импорт
        </Button>
      </div>

      <div className="hidden md:flex gap-2 mb-4 justify-center">
        <Button 
          variant={rotateMode ? "default" : "outline"} 
          size="sm" 
          onClick={toggleRotateMode}
        >
          <Icon name="RotateCw" size={16} className="mr-2" />
          {rotateMode ? 'Режим поворота ВКЛ' : 'Режим поворота ВЫКЛ'}
        </Button>
      </div>

      <input 
        ref={importInputRef}
        type="file" 
        accept=".json,.png"
        onChange={importDesign}
        className="hidden"
      />
    </>
  );
};
