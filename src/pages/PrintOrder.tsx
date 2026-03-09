import { useState, useEffect, useRef } from "react";
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
  const formRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = () => {
    window.print();
  };

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
              Загрузить эскиз
            </span>
          </Button>
          <input type="file" accept="image/*" className="hidden" onChange={handleSketchUpload} />
        </label>
        <Button size="sm" onClick={handlePrint}>
          <Icon name="Printer" size={16} className="mr-1" />
          Печать
        </Button>
      </div>

      <div className="flex justify-center py-6 print:py-0">
        <div
          ref={formRef}
          className="bg-white w-[210mm] min-h-[297mm] p-[12mm] shadow-lg print:shadow-none print:p-[10mm] text-black"
          style={{ fontFamily: "Times New Roman, serif", fontSize: "13px", lineHeight: "1.3" }}
        >
          <div className="flex justify-between items-start mb-1">
            <div />
            <div className="text-center">
              <span className="text-[22px] font-bold">Заказ №</span>
              <input
                className="print-input w-[60px] text-[22px] font-bold text-center"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="___"
              />
            </div>
            <div />
          </div>

          <div className="flex justify-between mb-1">
            <div>
              <span className="text-[11px]">Мастер по установке</span>
              <br />
              <span className="text-[11px]">(участок)</span>
              <input
                className="print-input w-[140px] ml-1"
                value={masterName}
                onChange={(e) => setMasterName(e.target.value)}
              />
            </div>
            <div className="text-right">
              <span className="text-[11px]">(дата принятия)</span>
              <br />
              <input
                className="print-input w-[120px] text-right"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                placeholder="__.__.____"
              />
            </div>
          </div>

          <div className="mb-0.5">
            <span className="font-bold italic">Заказчик</span>
            <input
              className="print-input flex-1 ml-1"
              style={{ width: "calc(100% - 80px)", display: "inline-block" }}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="mb-0.5">
            <span className="font-bold italic">Телефон</span>
            <input
              className="print-input flex-1 ml-1"
              style={{ width: "calc(100% - 70px)", display: "inline-block" }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <span className="font-bold italic">Адрес</span>
            <input
              className="print-input flex-1 ml-1"
              style={{ width: "calc(100% - 50px)", display: "inline-block" }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex gap-0 mb-2">
            <div className="flex-1">
              <table className="order-table w-full">
                <thead>
                  <tr>
                    <th className="w-[160px] text-left">Работы по камню</th>
                    <th className="w-[70px]">Размер</th>
                    <th className="w-[70px]">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {stoneRows.map((row, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          className={`print-input w-full ${row.bold ? "font-bold" : ""} ${row.italic ? "italic" : ""}`}
                          value={row.name}
                          onChange={(e) => updateStoneRow(i, "name", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="print-input w-full text-center"
                          value={row.size}
                          onChange={(e) => updateStoneRow(i, "size", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="print-input w-full text-center"
                          value={row.sum}
                          onChange={(e) => updateStoneRow(i, "sum", e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="w-[180px] border border-black flex items-center justify-center relative ml-[-1px]">
              {sketchImage ? (
                <img
                  src={sketchImage}
                  alt="Эскиз"
                  className="max-w-full max-h-full object-contain p-1"
                />
              ) : (
                <span className="text-[11px] text-gray-400 italic text-center px-2">
                  место для эскиза
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center mb-3">
            <span className="font-bold mr-2">Итого:</span>
            <span className="border-b border-black flex-1 min-h-[18px] text-center">
              {stoneTotal > 0 ? stoneTotal.toLocaleString("ru-RU") : ""}
            </span>
          </div>

          <table className="order-table w-[300px] mb-1">
            <thead>
              <tr>
                <th className="w-[160px] text-left">
                  Художественные
                  <br />
                  работы
                </th>
                <th className="w-[70px]">Кол-во</th>
                <th className="w-[70px]">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {artRows.map((row, i) => (
                <tr key={i}>
                  <td>
                    <input
                      className={`print-input w-full ${row.bold ? "font-bold" : ""} ${row.italic ? "italic" : ""}`}
                      value={row.name}
                      onChange={(e) => updateArtRow(i, "name", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="print-input w-full text-center"
                      value={row.qty}
                      onChange={(e) => updateArtRow(i, "qty", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="print-input w-full text-center"
                      value={row.sum}
                      onChange={(e) => updateArtRow(i, "sum", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2}>
                  <span className="font-bold">Итого:</span>
                </td>
                <td className="text-center font-bold">
                  {artTotal > 0 ? artTotal.toLocaleString("ru-RU") : ""}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 mb-1">
            <span className="text-[16px] font-bold">ИТОГО:</span>
            <span className="border-b border-black inline-block min-w-[200px] ml-2 text-center text-[16px] font-bold">
              {grandTotal > 0 ? grandTotal.toLocaleString("ru-RU") : ""}
            </span>
          </div>
          <div className="text-[10px] text-center mb-4" style={{ marginLeft: "70px", width: "200px" }}>
            (общая стоимость заказа)
          </div>

          <div className="flex items-end mb-1">
            <span>Срок изготовления</span>
            <input
              className="print-input flex-1 ml-1"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="flex items-end mb-0.5">
            <span>Аванс внесен</span>
            <input
              className="print-input flex-1 ml-1"
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
            />
          </div>
          <div className="text-[10px] text-center mb-3" style={{ marginLeft: "100px", width: "200px" }}>
            (сумма прописью)
          </div>

          <div className="border-t border-black pt-1 mb-1">
            <div className="mb-0.5 text-[12px]">
              С эскизом согласен(на), материал осмотрен, претензий не имею
            </div>
            <div className="flex justify-end">
              <div className="text-[10px] border-t border-black w-[160px] text-center">
                (подпись заказчика)
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-3 mb-1">
            <div>
              <span className="text-[12px]">Аванс принял(а)</span>
              <div className="border-b border-black w-[120px] inline-block ml-1 min-h-[16px]" />
              <div className="text-[10px] text-center" style={{ marginLeft: "100px" }}>
                (подпись)
              </div>
            </div>
            <div>
              <span className="text-[12px]">Заказ принял(а)</span>
              <div className="border-b border-black w-[120px] inline-block ml-1 min-h-[16px]" />
              <div className="text-[10px] text-center" style={{ marginLeft: "100px" }}>
                (подпись)
              </div>
            </div>
          </div>

          <div className="mt-3 mb-0.5">
            <span className="text-[12px]">Окончательный расчет произвел(а)</span>
            <div className="border-b border-black w-[100px] inline-block mx-2 min-h-[16px]" />
          </div>
          <div className="flex gap-8 ml-[230px]">
            <div className="text-[10px] text-center w-[80px] border-t border-black">(дата)</div>
            <div className="text-[10px] text-center w-[120px] border-t border-black">
              (подпись менеджера)
            </div>
          </div>

          <div className="mt-6 text-center text-[14px]">
            <div className="font-bold">+7 (996) 068-11-68</div>
            <div>09:00 - 21:00 (без обеда и выходных)</div>
            <div className="text-blue-600 underline">vekpam@mail.ru</div>
          </div>
        </div>
      </div>

      <style>{`
        .print-input {
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
        }
        .print-input:focus {
          border-bottom-color: #2563eb;
          background: #f0f7ff;
        }
        .order-table {
          border-collapse: collapse;
        }
        .order-table th,
        .order-table td {
          border: 1px solid black;
          padding: 2px 4px;
          font-size: 13px;
          vertical-align: middle;
        }
        .order-table th {
          font-weight: bold;
          text-align: center;
        }
        @media print {
          .print-input {
            border-bottom-color: transparent !important;
            background: transparent !important;
          }
          .print-input::placeholder {
            color: transparent !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintOrder;