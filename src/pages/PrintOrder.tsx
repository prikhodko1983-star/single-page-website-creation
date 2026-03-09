import { useState, useEffect } from "react";
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

const PrintOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <div className="po-page">
      {/* Toolbar */}
      <div className="po-toolbar print:hidden">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <Icon name="ArrowLeft" size={16} className="mr-1" />
          Назад
        </Button>
        <div style={{ flex: 1 }} />
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

      {/* A4 Form */}
      <div className="po-sheet">
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

        {/* Таблица камень + эскиз */}
        <div className="po-stone-area">
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
          <div className="po-sketch">
            {sketchImage ? (
              <img src={sketchImage} alt="Эскиз" />
            ) : (
              <span className="po-sketch-placeholder">место для эскиза</span>
            )}
          </div>
        </div>

        {/* Итого камень */}
        <div style={{ marginTop: 6, marginBottom: 8 }}>
          <b>Итого:</b>
          <span className="po-underline" style={{ minWidth: "30%", marginLeft: 8 }}>
            {stoneTotal > 0 ? stoneTotal.toLocaleString("ru-RU") : ""}
          </span>
        </div>

        {/* Таблица худ. работы */}
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

        {/* ИТОГО общее */}
        <div style={{ marginTop: 12, marginBottom: 2 }}>
          <span className="po-grand">ИТОГО:</span>
          <span className="po-underline po-grand" style={{ minWidth: "30%", marginLeft: 8 }}>
            {grandTotal > 0 ? grandTotal.toLocaleString("ru-RU") : ""}
          </span>
        </div>
        <div className="po-hint" style={{ marginLeft: "10%", width: "30%" }}>(общая стоимость заказа)</div>

        {/* Сроки, аванс */}
        <div className="po-field" style={{ marginTop: 10 }}>Срок изготовления<I style={{ flex: 1, marginLeft: 4 }} value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
        <div className="po-field">Аванс внесен<I style={{ flex: 1, marginLeft: 4 }} value={advance} onChange={(e) => setAdvance(e.target.value)} /></div>
        <div className="po-hint" style={{ marginLeft: "16%", width: "30%" }}>(сумма прописью)</div>

        {/* Подписи */}
        <div style={{ borderTop: "1px solid #000", paddingTop: 4, marginTop: 10 }}>
          <div style={{ marginBottom: 2 }}>С эскизом согласен(на), материал осмотрен, претензий не имею</div>
          <div style={{ textAlign: "right" }}>
            <span className="po-sig-line">(подпись заказчика)</span>
          </div>
        </div>

        <div className="po-row" style={{ marginTop: 10 }}>
          <div>
            Аванс принял(а)
            <span className="po-underline" style={{ width: "40%", marginLeft: 4 }}>&nbsp;</span>
            <div className="po-hint" style={{ marginLeft: "50%" }}>(подпись)</div>
          </div>
          <div>
            Заказ принял(а)
            <span className="po-underline" style={{ width: "40%", marginLeft: 4 }}>&nbsp;</span>
            <div className="po-hint" style={{ marginLeft: "50%" }}>(подпись)</div>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          Окончательный расчет произвел(а)
          <span className="po-underline" style={{ width: "15%", marginLeft: 8 }}>&nbsp;</span>
        </div>
        <div style={{ display: "flex", gap: "5%", marginLeft: "35%" }}>
          <span className="po-sig-line" style={{ width: "15%" }}>(дата)</span>
          <span className="po-sig-line" style={{ width: "25%" }}>(подпись менеджера)</span>
        </div>

        {/* Footer */}
        <div className="po-footer">
          <div style={{ fontWeight: 700 }}>+7 (996) 068-11-68</div>
          <div>09:00 - 21:00 (без обеда и выходных)</div>
          <div style={{ color: "#2563eb", textDecoration: "underline" }}>vekpam@mail.ru</div>
        </div>
      </div>

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
          line-height: 1.4;
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
          margin-top: 20px;
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

        .po-stone-area {
          display: flex;
          gap: 0;
          margin-bottom: 4px;
        }
        .po-t-stone { flex: 1 1 60%; }
        .po-t-art { width: 42%; }

        .po-sketch {
          flex: 0 0 35%;
          min-height: 120px;
          border: 1px solid #000;
          margin-left: -1px;
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
        .po-sketch-placeholder {
          font-size: clamp(8px, 1.4vw, 11px);
          color: #999;
          font-style: italic;
          text-align: center;
          padding: 6px;
        }

        /* Print */
        @media print {
          .po-page { background: white; }
          .po-toolbar { display: none !important; }
          .po-sheet {
            max-width: none;
            margin: 0;
            padding: 10mm;
            box-shadow: none;
            font-size: 13px;
          }
          .po-title { font-size: 22px; }
          .po-title-input { font-size: 22px !important; }
          .po-small { font-size: 11px; }
          .po-grand { font-size: 16px; }
          .po-hint, .po-sig-line { font-size: 10px; }
          .po-footer { font-size: 14px; }
          .po-i {
            border-bottom-color: transparent !important;
            background: transparent !important;
          }
          .po-i::placeholder { color: transparent !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default PrintOrder;
