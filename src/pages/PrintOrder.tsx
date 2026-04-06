import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface StoneRow {
  name: string;
  bold?: boolean;
  italic?: boolean;
  size: string;
  sum: string;
}

interface ArtRow {
  name: string;
  bold?: boolean;
  italic?: boolean;
  qty: string;
  sum: string;
}

interface ExtraBlock {
  id: string;
  type: "text" | "image";
  content: string;
  label: string;
}

const I = (props: React.InputHTMLAttributes<HTMLInputElement> & { bold?: boolean; ital?: boolean }) => {
  const { bold, ital, className, style, ...rest } = props;
  return (
    <input
      {...rest}
      className={`po-i ${bold ? "font-bold" : ""} ${ital ? "italic" : ""} ${className || ""}`}
      style={style}
    />
  );
};

const PrintOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sheetRef = useRef<HTMLDivElement>(null);
  const loadInputRef = useRef<HTMLInputElement>(null);
  const [isSavingPdf, setIsSavingPdf] = useState(false);

  const [orderNumber, setOrderNumber] = useState("");
  const [masterName, setMasterName] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [discount, setDiscount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [advance, setAdvance] = useState("");
  const [advanceAccepted, setAdvanceAccepted] = useState("");
  const [orderAccepted, setOrderAccepted] = useState("");
  const [sketchImage, setSketchImage] = useState<string | null>(null);
  const [showExtraSheet, setShowExtraSheet] = useState(false);
  const [extraBlocks, setExtraBlocks] = useState<ExtraBlock[]>([]);
  const extraSheetRef = useRef<HTMLDivElement>(null);

  const [stoneRows, setStoneRows] = useState<StoneRow[]>([
    { name: "Памятник (название)", bold: true, size: "", sum: "" },
    { name: "", bold: false, size: "", sum: "" },
    { name: "полировка", italic: true, size: "", sum: "" },
    { name: "Подставка", bold: true, size: "", sum: "" },
    { name: "полировка", italic: true, size: "", sum: "" },
    { name: "Цветник", bold: true, size: "", sum: "" },
    { name: "полировка", italic: true, size: "", sum: "" },
  ]);

  const [artRows, setArtRows] = useState<ArtRow[]>([
    { name: "Шрифт", qty: "", sum: "" },
    { name: "Крест", qty: "", sum: "" },
    { name: "Ретушь", qty: "", sum: "" },
    { name: "Портрет (гравировка)", italic: true, qty: "", sum: "" },
    { name: "Металлофото\\эмаль", qty: "", sum: "" },
    { name: "Покраска", qty: "", sum: "" },
    { name: "Технолог. отверстия", qty: "", sum: "" },
    { name: "Эпитафия", qty: "", sum: "" },
    { name: "Рисунок (гравировка)", italic: true, qty: "", sum: "" },
    { name: "", qty: "", sum: "" },
    { name: "Рисунок (пескоструйн.)", italic: true, qty: "", sum: "" },
    { name: "", qty: "", sum: "" },
    { name: "МАКЕТ", italic: true, qty: "", sum: "" },
  ]);

  useEffect(() => {
    const state = location.state as { previewImage?: string } | null;
    if (state?.previewImage) {
      setSketchImage(state.previewImage);
    }
  }, [location.state]);

  const parseNum = (v: string) => {
    const n = parseFloat(v.replace(/\s/g, "").replace(",", "."));
    return isNaN(n) ? 0 : n;
  };

  const stoneTotal = stoneRows.reduce((s, r) => s + parseNum(r.sum), 0);
  const artTotal = artRows.reduce((s, r) => s + parseNum(r.sum), 0);
  const grandTotal = stoneTotal + artTotal;
  const discountNum = parseNum(discount);
  const finalTotal = grandTotal - discountNum;

  const updateStoneRow = (i: number, field: keyof StoneRow, value: string) => {
    setStoneRows((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  };

  const updateArtRow = (i: number, field: keyof ArtRow, value: string) => {
    setArtRows((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  };

  const handlePrint = () => window.print();

  const handleSketchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSketchImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addExtraBlock = (type: "text" | "image") => {
    const id = Date.now().toString();
    setExtraBlocks((prev) => [
      ...prev,
      { id, type, content: "", label: type === "text" ? "Текстовый блок" : "Изображение" },
    ]);
    setShowExtraSheet(true);
  };

  const updateExtraBlock = (id: string, field: keyof ExtraBlock, value: string) => {
    setExtraBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const removeExtraBlock = (id: string) => {
    setExtraBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleExtraImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateExtraBlock(id, "content", reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveExtraPdf = async () => {
    if (!extraSheetRef.current) return;
    setIsSavingPdf(true);
    try {
      const canvas = await html2canvas(extraSheetRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pdfW) / canvas.width;
      if (imgH <= pdfH) {
        pdf.addImage(imgData, "JPEG", 0, 0, pdfW, imgH);
      } else {
        let yOffset = 0;
        while (yOffset < canvas.height) {
          const sliceH = Math.min((pdfH / pdfW) * canvas.width, canvas.height - yOffset);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;
          sliceCanvas.getContext("2d")!.drawImage(canvas, 0, -yOffset);
          pdf.addImage(sliceCanvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pdfW, (sliceH * pdfW) / canvas.width);
          yOffset += sliceH;
          if (yOffset < canvas.height) pdf.addPage();
        }
      }
      pdf.save(`Заказ_${orderNumber || "новый"}_доп.pdf`);
    } finally {
      setIsSavingPdf(false);
    }
  };

  const getFormData = () => ({
    orderNumber, masterName, orderDate, customerName, phone, address,
    discount, deadline, advance, advanceAccepted, orderAccepted,
    sketchImage, stoneRows, artRows, extraBlocks,
  });

  const handleSavePdf = async () => {
    if (!sheetRef.current) return;
    setIsSavingPdf(true);
    try {
      const canvas = await html2canvas(sheetRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pdfW) / canvas.width;
      if (imgH <= pdfH) {
        pdf.addImage(imgData, "JPEG", 0, 0, pdfW, imgH);
      } else {
        let yOffset = 0;
        while (yOffset < canvas.height) {
          const sliceH = Math.min((pdfH / pdfW) * canvas.width, canvas.height - yOffset);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;
          sliceCanvas.getContext("2d")!.drawImage(canvas, 0, -yOffset);
          pdf.addImage(sliceCanvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pdfW, (sliceH * pdfW) / canvas.width);
          yOffset += sliceH;
          if (yOffset < canvas.height) pdf.addPage();
        }
      }
      const jsonStr = JSON.stringify(getFormData());
      pdf.setProperties({ subject: jsonStr });
      pdf.save(`Заказ_${orderNumber || "новый"}.pdf`);
    } finally {
      setIsSavingPdf(false);
    }
  };

  const handleSaveJson = () => {
    const data = getFormData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Заказ_${orderNumber || "новый"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.orderNumber !== undefined) setOrderNumber(data.orderNumber);
        if (data.masterName !== undefined) setMasterName(data.masterName);
        if (data.orderDate !== undefined) setOrderDate(data.orderDate);
        if (data.customerName !== undefined) setCustomerName(data.customerName);
        if (data.phone !== undefined) setPhone(data.phone);
        if (data.address !== undefined) setAddress(data.address);
        if (data.discount !== undefined) setDiscount(data.discount);
        if (data.deadline !== undefined) setDeadline(data.deadline);
        if (data.advance !== undefined) setAdvance(data.advance);
        if (data.advanceAccepted !== undefined) setAdvanceAccepted(data.advanceAccepted);
        if (data.orderAccepted !== undefined) setOrderAccepted(data.orderAccepted);
        if (data.sketchImage !== undefined) setSketchImage(data.sketchImage);
        if (data.stoneRows !== undefined) setStoneRows(data.stoneRows);
        if (data.artRows !== undefined) setArtRows(data.artRows);
        if (data.extraBlocks !== undefined) { setExtraBlocks(data.extraBlocks); if (data.extraBlocks.length > 0) setShowExtraSheet(true); }
      } catch (err) {
        console.error("Ошибка загрузки файла", err);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="po-page">
      {/* Toolbar */}
      <div className="po-toolbar print:hidden flex flex-wrap gap-1 items-center px-2 py-1">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => navigate(-1)}>
          <Icon name="ArrowLeft" size={14} className="mr-1" />
          Назад
        </Button>
        <div style={{ flex: 1 }} />
        <label className="cursor-pointer">
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" asChild>
            <span>Загрузить эскиз</span>
          </Button>
          <input type="file" accept="image/*" className="hidden" onChange={handleSketchUpload} />
        </label>
        <label className="cursor-pointer">
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" asChild>
            <span>Загрузить бланк</span>
          </Button>
          <input ref={loadInputRef} type="file" accept=".json" className="hidden" onChange={handleLoadJson} />
        </label>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={handleSaveJson}>
          <Icon name="Save" size={13} className="mr-1" />
          Сохранить
        </Button>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={handleSavePdf} disabled={isSavingPdf}>
          <Icon name="FileDown" size={13} className="mr-1" />
          {isSavingPdf ? "PDF..." : "PDF"}
        </Button>
        <Button size="sm" className="h-7 px-2 text-xs" onClick={handlePrint}>
          <Icon name="Printer" size={13} className="mr-1" />
          Печать
        </Button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => addExtraBlock("text")}>
          <Icon name="AlignLeft" size={13} className="mr-1" />
          + Текст
        </Button>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => addExtraBlock("image")}>
          <Icon name="Image" size={13} className="mr-1" />
          + Фото
        </Button>
        {extraBlocks.length > 0 && (
          <>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setShowExtraSheet((v) => !v)}>
              <Icon name={showExtraSheet ? "ChevronUp" : "ChevronDown"} size={13} className="mr-1" />
              Доп. лист ({extraBlocks.length})
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={handleSaveExtraPdf} disabled={isSavingPdf}>
              <Icon name="FileDown" size={13} className="mr-1" />
              PDF доп.
            </Button>
          </>
        )}
      </div>

      {/* A4 Form */}
      <div className="po-sheet" ref={sheetRef}>
        {/* Заказ № */}
        <div className="po-center" style={{ marginBottom: 2 }}>
          <span className="po-title">Заказ №</span>
          <I style={{ width: "8%", fontSize: "2.8vw" }} className="po-title-input" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
        </div>

        {/* Мастер + дата */}
        <div className="po-row" style={{ marginBottom: 2 }}>
          <div>
            <div className="po-small">Мастер по установке</div>
            <div className="po-small">
              (участок)
              <I style={{ width: "50%", marginLeft: 4 }} value={masterName} onChange={(e) => setMasterName(e.target.value)} />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="po-small">(дата принятия)</div>
            <I style={{ width: "80%", textAlign: "right" }} value={orderDate} onChange={(e) => setOrderDate(e.target.value)} placeholder="__.__.____" />
          </div>
        </div>

        {/* Заказчик / Телефон / Адрес */}
        <div className="po-field"><b><i>Заказчик</i></b><I style={{ width: "calc(100% - 80px)", marginLeft: 4 }} value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
        <div className="po-field"><b><i>Телефон</i></b><I style={{ width: "calc(100% - 65px)", marginLeft: 4 }} value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="po-field" style={{ marginBottom: 6 }}><b><i>Адрес</i></b><I style={{ width: "calc(100% - 45px)", marginLeft: 4 }} value={address} onChange={(e) => setAddress(e.target.value)} /></div>

        {/* Таблицы + эскиз */}
        <div className="po-tables-area">
          <div className="po-tables-left">
            <table className="po-t po-t-stone">
              <thead>
                <tr>
                  <th className="po-t-name" style={{ textAlign: "left" }}>Работы по камню</th>
                  <th className="po-t-num">Размер</th>
                  <th className="po-t-num">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {stoneRows.map((row, i) => (
                  <tr key={i}>
                    <td><I bold={row.bold} ital={row.italic} className="w-full" value={row.name} onChange={(e) => updateStoneRow(i, "name", e.target.value)} /></td>
                    <td><I className="w-full text-center" value={row.size} onChange={(e) => updateStoneRow(i, "size", e.target.value)} /></td>
                    <td><I className="w-full text-center" value={row.sum} onChange={(e) => updateStoneRow(i, "sum", e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 3, marginBottom: 4 }}>
              <b>Итого:</b>
              <span className="po-underline" style={{ minWidth: "30%", marginLeft: 8 }}>
                {stoneTotal > 0 ? stoneTotal.toLocaleString("ru-RU") : ""}
              </span>
            </div>

            <table className="po-t po-t-art">
              <thead>
                <tr>
                  <th className="po-t-name" style={{ textAlign: "left" }}>Художественные<br />работы</th>
                  <th className="po-t-num">Кол-во</th>
                  <th className="po-t-num">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {artRows.map((row, i) => (
                  <tr key={i}>
                    <td><I bold={row.bold} ital={row.italic} className="w-full" value={row.name} onChange={(e) => updateArtRow(i, "name", e.target.value)} /></td>
                    <td><I className="w-full text-center" value={row.qty} onChange={(e) => updateArtRow(i, "qty", e.target.value)} /></td>
                    <td><I className="w-full text-center" value={row.sum} onChange={(e) => updateArtRow(i, "sum", e.target.value)} /></td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2}><b>Итого:</b></td>
                  <td className="text-center"><b>{artTotal > 0 ? artTotal.toLocaleString("ru-RU") : ""}</b></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="po-sketch-wrap">
            <div className="po-sketch-label">место для эскиза</div>
            <div className="po-sketch">
              {sketchImage ? (
                <img src={sketchImage} alt="Эскиз" />
              ) : null}
            </div>
          </div>
        </div>

        {/* ИТОГО общее */}
        <div style={{ marginTop: 6, marginBottom: 1 }}>
          <span className="po-grand">ИТОГО:</span>
          <span className="po-underline po-grand" style={{ minWidth: "30%", marginLeft: 8 }}>
            {grandTotal > 0 ? grandTotal.toLocaleString("ru-RU") : ""}
          </span>
        </div>
        <div className="po-field" style={{ marginTop: 2 }}>
          <b>Скидка:</b>
          <I style={{ width: "20%", marginLeft: 8, textAlign: "center" }} value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>
        <div style={{ marginTop: 2, marginBottom: 1 }}>
          <span className="po-grand">К оплате:</span>
          <span className="po-underline po-grand" style={{ minWidth: "30%", marginLeft: 8 }}>
            {finalTotal > 0 ? finalTotal.toLocaleString("ru-RU") : ""}
          </span>
        </div>
        <div className="po-hint" style={{ marginLeft: "10%", width: "30%" }}>(общая стоимость заказа)</div>

        {/* Сроки, аванс */}
        <div className="po-field" style={{ marginTop: 4 }}>Срок изготовления<I style={{ flex: 1, marginLeft: 4 }} value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
        <div className="po-field">Аванс внесен<I style={{ flex: 1, marginLeft: 4 }} value={advance} onChange={(e) => setAdvance(e.target.value)} /></div>
        <div className="po-hint" style={{ marginLeft: "16%", width: "30%" }}>(сумма прописью)</div>

        {/* Подписи */}
        <div style={{ borderTop: "1px solid #000", paddingTop: 2, marginTop: 4 }}>
          <div style={{ marginBottom: 1 }}>С эскизом согласен(на), материал осмотрен, претензий не имею</div>
          <div style={{ textAlign: "right" }}>
            <span className="po-sig-line">(подпись заказчика)</span>
          </div>
        </div>

        <div className="po-row" style={{ marginTop: 4 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap" }}>
              <span style={{ flexShrink: 0 }}>Аванс принял(а)</span>
              <I style={{ flex: 1, marginLeft: 4 }} value={advanceAccepted} onChange={(e) => setAdvanceAccepted(e.target.value)} />
            </div>
            <div className="po-hint" style={{ marginLeft: "55%" }}>(подпись)</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap" }}>
              <span style={{ flexShrink: 0 }}>Заказ принял(а)</span>
              <I style={{ flex: 1, marginLeft: 4 }} value={orderAccepted} onChange={(e) => setOrderAccepted(e.target.value)} />
            </div>
            <div className="po-hint" style={{ marginLeft: "55%" }}>(подпись)</div>
          </div>
        </div>

        <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", whiteSpace: "nowrap" }}>
          <span style={{ flexShrink: 0 }}>Окончательный расчет произвел(а)</span>
          <I style={{ flex: 1, marginLeft: 8 }} />
        </div>

        {/* Footer */}
        <div className="po-footer">
          <div style={{ fontWeight: 700 }}>+7 (996) 068-11-68</div>
          <div>09:00 - 21:00 (без обеда и выходных)</div>
          <div style={{ color: "#2563eb", textDecoration: "underline" }}>vekpam@mail.ru</div>
        </div>
      </div>

      {/* Дополнительный лист */}
      {showExtraSheet && extraBlocks.length > 0 && (
        <div className="po-sheet po-extra-sheet" ref={extraSheetRef}>
          <div className="po-center" style={{ marginBottom: 12 }}>
            <span className="po-title">Доп. лист к заказу №</span>
            <span className="po-title" style={{ marginLeft: 4 }}>{orderNumber || "___"}</span>
          </div>
          <div className="po-field" style={{ marginBottom: 12, fontSize: "inherit" }}>
            <b>Заказчик:</b> <span style={{ marginLeft: 6 }}>{customerName || "___"}</span>
          </div>

          <div className="po-extra-blocks">
            {extraBlocks.map((block) => (
              <div key={block.id} className="po-extra-block">
                <div className="po-extra-block-header print:hidden">
                  <input
                    className="po-i po-extra-label"
                    value={block.label}
                    onChange={(e) => updateExtraBlock(block.id, "label", e.target.value)}
                    placeholder="Подпись блока"
                  />
                  <button className="po-extra-remove" onClick={() => removeExtraBlock(block.id)}>×</button>
                </div>
                <div className="po-extra-label-print print:block hidden">{block.label}</div>

                {block.type === "text" ? (
                  <textarea
                    className="po-extra-textarea print:hidden"
                    value={block.content}
                    onChange={(e) => updateExtraBlock(block.id, "content", e.target.value)}
                    placeholder="Введите текст / информацию..."
                    rows={5}
                  />
                ) : (
                  <div className="po-extra-img-wrap">
                    {block.content ? (
                      <img src={block.content} alt={block.label} className="po-extra-img" />
                    ) : (
                      <label className="po-extra-img-placeholder print:hidden">
                        <Icon name="Upload" size={24} />
                        <span>Загрузить изображение</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleExtraImageUpload(block.id, e)} />
                      </label>
                    )}
                    {block.content && (
                      <button className="po-extra-img-remove print:hidden" onClick={() => updateExtraBlock(block.id, "content", "")}>
                        <Icon name="X" size={14} />
                      </button>
                    )}
                  </div>
                )}

                {block.type === "text" && block.content && (
                  <div className="po-extra-text-print print:block hidden" style={{ whiteSpace: "pre-wrap" }}>{block.content}</div>
                )}
              </div>
            ))}
          </div>

          <div className="po-footer" style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700 }}>+7 (996) 068-11-68</div>
          </div>
        </div>
      )}

      <style>{`
        .po-page {
          min-height: 100vh;
          background: #f3f4f6;
        }
        .po-toolbar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .po-sheet {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 5vw;
          font-family: 'Times New Roman', Times, serif;
          font-size: clamp(10px, 1.7vw, 13px);
          line-height: 1.3;
          color: #000;
        }
        @media (min-width: 840px) {
          .po-sheet {
            margin: 16px auto;
            padding: 40px;
            box-shadow: 0 2px 12px rgba(0,0,0,.12);
          }
        }
        .po-i {
          border: none;
          border-bottom: 1px solid #999;
          outline: none;
          background: transparent;
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          padding: 0 1px;
          margin: 0;
          color: inherit;
          display: inline-block;
          box-sizing: border-box;
        }
        .po-i:focus {
          border-bottom-color: #2563eb;
          background: #f0f7ff;
        }
        .po-center { text-align: center; }
        .po-title {
          font-size: clamp(16px, 2.8vw, 22px);
          font-weight: 700;
        }
        .po-title-input {
          font-size: clamp(16px, 2.8vw, 22px) !important;
          font-weight: 700;
          text-align: center;
        }
        .po-row {
          display: flex;
          justify-content: space-between;
        }
        .po-small { font-size: clamp(8px, 1.4vw, 11px); }
        .po-field {
          margin-bottom: 2px;
          display: flex;
          align-items: baseline;
        }
        .po-underline {
          border-bottom: 1px solid #000;
          display: inline-block;
          text-align: center;
        }
        .po-grand {
          font-size: clamp(12px, 2.1vw, 16px);
          font-weight: 700;
        }
        .po-hint {
          font-size: clamp(7px, 1.2vw, 10px);
          text-align: center;
        }
        .po-sig-line {
          font-size: clamp(7px, 1.2vw, 10px);
          border-top: 1px solid #000;
          display: inline-block;
          text-align: center;
        }
        .po-footer {
          text-align: center;
          margin-top: 12px;
          font-size: clamp(10px, 1.8vw, 14px);
        }

        /* Tables */
        .po-t { border-collapse: collapse; }
        .po-t th, .po-t td {
          border: 1px solid #000;
          padding: 1px 3px;
          font-size: inherit;
          vertical-align: middle;
        }
        .po-t th { font-weight: 700; text-align: center; }
        .po-t-name { width: 55%; text-align: left !important; }
        .po-t-num { width: 22.5%; }

        .po-tables-area {
          display: flex;
          gap: 0;
          margin-bottom: 4px;
        }
        .po-tables-left {
          flex: 1 1 50%;
        }
        .po-t-stone { width: 100%; }
        .po-t-art { width: 100%; }

        .po-sketch-wrap {
          flex: 0 0 50%;
          margin-left: -1px;
          display: flex;
          flex-direction: column;
        }
        .po-sketch-label {
          font-size: clamp(9px, 1.5vw, 12px);
          text-align: center;
          padding: 2px 0;
          border: 1px solid #000;
          border-bottom: none;
        }
        .po-sketch {
          flex: 1;
          border: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .po-sketch img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          padding: 3px;
        }

        /* Extra sheet */
        .po-extra-sheet {
          margin-top: 24px;
        }
        .po-extra-blocks {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .po-extra-block {
          border: 1px solid #000;
          padding: 8px 10px;
          page-break-inside: avoid;
        }
        .po-extra-block-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }
        .po-extra-label {
          flex: 1;
          font-weight: 700;
          font-size: inherit;
          width: auto !important;
        }
        .po-extra-label-print {
          font-weight: 700;
          margin-bottom: 6px;
        }
        .po-extra-remove {
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          font-size: 18px;
          line-height: 1;
          padding: 0 4px;
        }
        .po-extra-remove:hover { color: #e00; }
        .po-extra-textarea {
          width: 100%;
          border: 1px solid #ccc;
          font-family: inherit;
          font-size: inherit;
          padding: 4px 6px;
          resize: vertical;
          outline: none;
          box-sizing: border-box;
        }
        .po-extra-textarea:focus { border-color: #2563eb; }
        .po-extra-text-print { padding: 2px 0; }
        .po-extra-img-wrap {
          position: relative;
          min-height: 120px;
          border: 1px dashed #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .po-extra-img {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }
        .po-extra-img-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          color: #999;
          padding: 24px;
          font-size: clamp(10px, 1.6vw, 13px);
        }
        .po-extra-img-placeholder:hover { color: #2563eb; }
        .po-extra-img-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          padding: 2px 4px;
          display: flex;
          align-items: center;
        }
        .po-extra-img-remove:hover { border-color: #e00; color: #e00; }

        /* Print */
        @media print {
          .po-page { background: white; }
          .po-toolbar { display: none !important; }
          .po-sheet {
            max-width: none;
            margin: 0;
            padding: 8mm 10mm;
            box-shadow: none;
            font-size: 12px;
            line-height: 1.25;
          }
          .po-title { font-size: 20px; }
          .po-title-input { font-size: 20px !important; }
          .po-small { font-size: 10px; }
          .po-grand { font-size: 13px; }
          .po-hint, .po-sig-line { font-size: 9px; }
          .po-footer { font-size: 12px; margin-top: 2px; }
          .po-t th, .po-t td { padding: 1px 2px; }
          .po-t .po-i {
            border-bottom-color: transparent !important;
          }
          .po-i {
            background: transparent !important;
          }
          .po-i::placeholder { color: transparent !important; }
          @page { size: A4; margin: 0; }
          .po-extra-sheet { margin-top: 0; page-break-before: always; }
          .po-extra-block { page-break-inside: avoid; }
          .po-extra-textarea { display: none !important; }
          .po-extra-text-print { display: block !important; }
          .po-extra-label-print { display: block !important; }
          .po-extra-block-header { display: none !important; }
          .po-extra-img-placeholder { display: none !important; }
          .po-extra-img-remove { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PrintOrder;