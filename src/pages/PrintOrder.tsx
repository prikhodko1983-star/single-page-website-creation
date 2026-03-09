import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

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

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

const PrintOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const [orderNumber, setOrderNumber] = useState("");
  const [masterName, setMasterName] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deadline, setDeadline] = useState("");
  const [advance, setAdvance] = useState("");
  const [sketchImage, setSketchImage] = useState<string | null>(null);

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

  const calcScale = useCallback(() => {
    if (!containerRef.current) return;
    const pad = 16;
    const availW = containerRef.current.clientWidth - pad * 2;
    const s = Math.min(availW / A4_WIDTH, 1);
    setScale(s);
  }, []);

  useEffect(() => {
    calcScale();
    window.addEventListener("resize", calcScale);
    return () => window.removeEventListener("resize", calcScale);
  }, [calcScale]);

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

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      <div className="print:hidden sticky top-0 z-40 bg-background border-b px-4 py-2 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <Icon name="ArrowLeft" size={16} className="mr-1" />
          Назад
        </Button>
        <div className="flex-1" />
        <label className="cursor-pointer">
          <Button variant="outline" size="sm" asChild>
            <span>
              <Icon name="Image" size={16} className="mr-1" />
              Эскиз
            </span>
          </Button>
          <input type="file" accept="image/*" className="hidden" onChange={handleSketchUpload} />
        </label>
        <Button size="sm" onClick={handlePrint}>
          <Icon name="Printer" size={16} className="mr-1" />
          Печать
        </Button>
      </div>

      <div ref={containerRef} className="flex justify-center py-4 print:py-0 overflow-hidden">
        <div
          className="bg-white shadow-lg print:shadow-none origin-top"
          style={{
            width: A4_WIDTH,
            minHeight: A4_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            marginBottom: `${(scale - 1) * A4_HEIGHT}px`,
          }}
        >
          <div
            className="p-[40px] text-black"
            style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: 13, lineHeight: 1.35 }}
          >
            {/* Header */}
            <div className="text-center mb-[2px]">
              <span style={{ fontSize: 22, fontWeight: 700 }}>Заказ №</span>
              <input className="pi" style={{ width: 50, fontSize: 22, fontWeight: 700, textAlign: "center" }} value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
            </div>

            <div className="flex justify-between mb-[2px]">
              <div>
                <div style={{ fontSize: 11 }}>Мастер по установке</div>
                <div style={{ fontSize: 11 }}>
                  (участок)
                  <input className="pi" style={{ width: 140, marginLeft: 4 }} value={masterName} onChange={(e) => setMasterName(e.target.value)} />
                </div>
              </div>
              <div className="text-right">
                <div style={{ fontSize: 11 }}>(дата принятия)</div>
                <input className="pi" style={{ width: 120, textAlign: "right" }} value={orderDate} onChange={(e) => setOrderDate(e.target.value)} placeholder="__.__.____" />
              </div>
            </div>

            {/* Client info */}
            <div className="mb-[2px]">
              <b><i>Заказчик</i></b>
              <input className="pi" style={{ width: "calc(100% - 75px)", marginLeft: 4 }} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="mb-[2px]">
              <b><i>Телефон</i></b>
              <input className="pi" style={{ width: "calc(100% - 65px)", marginLeft: 4 }} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="mb-[6px]">
              <b><i>Адрес</i></b>
              <input className="pi" style={{ width: "calc(100% - 45px)", marginLeft: 4 }} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            {/* Stone table + sketch */}
            <div className="flex mb-[6px]" style={{ gap: 0 }}>
              <table className="ot" style={{ flex: "1 1 auto" }}>
                <thead>
                  <tr>
                    <th style={{ width: 155, textAlign: "left" }}>Работы по камню</th>
                    <th style={{ width: 65 }}>Размер</th>
                    <th style={{ width: 65 }}>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {stoneRows.map((row, i) => (
                    <tr key={i}>
                      <td>
                        <input className={`pi w-full ${row.bold ? "font-bold" : ""} ${row.italic ? "italic" : ""}`} value={row.name} onChange={(e) => updateStoneRow(i, "name", e.target.value)} />
                      </td>
                      <td><input className="pi w-full text-center" value={row.size} onChange={(e) => updateStoneRow(i, "size", e.target.value)} /></td>
                      <td><input className="pi w-full text-center" value={row.sum} onChange={(e) => updateStoneRow(i, "sum", e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ width: 200, minHeight: 180, border: "1px solid #000", marginLeft: -1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {sketchImage ? (
                  <img src={sketchImage} alt="Эскиз" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: 4 }} />
                ) : (
                  <span style={{ fontSize: 11, color: "#999", fontStyle: "italic", textAlign: "center", padding: 8 }}>место для эскиза</span>
                )}
              </div>
            </div>

            {/* Stone total */}
            <div className="mb-[8px]">
              <b>Итого:</b>
              <span style={{ borderBottom: "1px solid #000", display: "inline-block", minWidth: 200, marginLeft: 8, textAlign: "center" }}>
                {stoneTotal > 0 ? stoneTotal.toLocaleString("ru-RU") : ""}
              </span>
            </div>

            {/* Art table */}
            <table className="ot" style={{ width: 295, marginBottom: 4 }}>
              <thead>
                <tr>
                  <th style={{ width: 155, textAlign: "left" }}>Художественные<br />работы</th>
                  <th style={{ width: 65 }}>Кол-во</th>
                  <th style={{ width: 65 }}>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {artRows.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <input className={`pi w-full ${row.bold ? "font-bold" : ""} ${row.italic ? "italic" : ""}`} value={row.name} onChange={(e) => updateArtRow(i, "name", e.target.value)} />
                    </td>
                    <td><input className="pi w-full text-center" value={row.qty} onChange={(e) => updateArtRow(i, "qty", e.target.value)} /></td>
                    <td><input className="pi w-full text-center" value={row.sum} onChange={(e) => updateArtRow(i, "sum", e.target.value)} /></td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2}><b>Итого:</b></td>
                  <td className="text-center"><b>{artTotal > 0 ? artTotal.toLocaleString("ru-RU") : ""}</b></td>
                </tr>
              </tbody>
            </table>

            {/* Grand total */}
            <div className="mt-[12px] mb-[2px]">
              <span style={{ fontSize: 16, fontWeight: 700 }}>ИТОГО:</span>
              <span style={{ fontSize: 16, fontWeight: 700, borderBottom: "1px solid #000", display: "inline-block", minWidth: 200, marginLeft: 8, textAlign: "center" }}>
                {grandTotal > 0 ? grandTotal.toLocaleString("ru-RU") : ""}
              </span>
            </div>
            <div style={{ fontSize: 10, textAlign: "center", width: 200, marginLeft: 65 }}>(общая стоимость заказа)</div>

            {/* Deadline & advance */}
            <div className="mt-[10px] mb-[2px] flex items-end">
              <span>Срок изготовления</span>
              <input className="pi" style={{ flex: 1, marginLeft: 4 }} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="mb-[2px] flex items-end">
              <span>Аванс внесен</span>
              <input className="pi" style={{ flex: 1, marginLeft: 4 }} value={advance} onChange={(e) => setAdvance(e.target.value)} />
            </div>
            <div style={{ fontSize: 10, textAlign: "center", width: 200, marginLeft: 100 }}>(сумма прописью)</div>

            {/* Signatures */}
            <div style={{ borderTop: "1px solid #000", paddingTop: 4, marginTop: 10, marginBottom: 4 }}>
              <div style={{ fontSize: 12, marginBottom: 2 }}>С эскизом согласен(на), материал осмотрен, претензий не имею</div>
              <div className="text-right">
                <span style={{ fontSize: 10, borderTop: "1px solid #000", display: "inline-block", width: 160, textAlign: "center" }}>(подпись заказчика)</span>
              </div>
            </div>

            <div className="flex justify-between" style={{ marginTop: 10, marginBottom: 4 }}>
              <div>
                <span style={{ fontSize: 12 }}>Аванс принял(а)</span>
                <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: 100, marginLeft: 4 }}>&nbsp;</span>
                <div style={{ fontSize: 10, textAlign: "center", marginLeft: 100 }}>(подпись)</div>
              </div>
              <div>
                <span style={{ fontSize: 12 }}>Заказ принял(а)</span>
                <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: 100, marginLeft: 4 }}>&nbsp;</span>
                <div style={{ fontSize: 10, textAlign: "center", marginLeft: 100 }}>(подпись)</div>
              </div>
            </div>

            <div style={{ marginTop: 10, marginBottom: 2 }}>
              <span style={{ fontSize: 12 }}>Окончательный расчет произвел(а)</span>
              <span style={{ borderBottom: "1px solid #000", display: "inline-block", width: 80, marginLeft: 8 }}>&nbsp;</span>
            </div>
            <div className="flex" style={{ gap: 30, marginLeft: 220 }}>
              <span style={{ fontSize: 10, borderTop: "1px solid #000", width: 80, textAlign: "center", display: "inline-block" }}>(дата)</span>
              <span style={{ fontSize: 10, borderTop: "1px solid #000", width: 120, textAlign: "center", display: "inline-block" }}>(подпись менеджера)</span>
            </div>

            {/* Footer */}
            <div className="text-center" style={{ marginTop: 20, fontSize: 14 }}>
              <div style={{ fontWeight: 700 }}>+7 (996) 068-11-68</div>
              <div>09:00 - 21:00 (без обеда и выходных)</div>
              <div style={{ color: "#2563eb", textDecoration: "underline" }}>vekpam@mail.ru</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .pi {
          border: none;
          border-bottom: 1px solid #999;
          outline: none;
          background: transparent;
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          padding: 0 2px;
          margin: 0;
          color: inherit;
          display: inline-block;
        }
        .pi:focus {
          border-bottom-color: #2563eb;
          background: #f0f7ff;
        }
        .ot {
          border-collapse: collapse;
        }
        .ot th, .ot td {
          border: 1px solid #000;
          padding: 1px 3px;
          font-size: 13px;
          vertical-align: middle;
        }
        .ot th {
          font-weight: 700;
          text-align: center;
        }
        @media print {
          .pi {
            border-bottom-color: transparent !important;
            background: transparent !important;
          }
          .pi::placeholder { color: transparent !important; }
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
};

export default PrintOrder;
