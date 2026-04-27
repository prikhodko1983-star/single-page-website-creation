import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

const RetouchForm = () => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", comment: "" });
  const [honeypot, setHoneypot] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      toast.error("Можно загружать только изображения (JPEG, PNG, WEBP, GIF)");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Размер файла не должен превышать 10 МБ");
      e.target.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (inputRef.current) inputRef.current.value = "";
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Заполните обязательные поля");
      return;
    }

    if (!selectedFile) {
      toast.error("Прикрепите фотографию");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => prev >= 85 ? 85 : prev + 10);
    }, 200);

    try {
      const photoBase64 = await toBase64(selectedFile);

      const response = await fetch("https://functions.poehali.dev/e1ebea09-647f-4074-8e3d-0fe6662857df", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          comment: formData.comment,
          photo: photoBase64,
          filename: selectedFile.name,
          fileType: selectedFile.type,
          website: honeypot,
        }),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok && result.success) {
        if (window.dataLayer) {
          window.dataLayer.push({ event: 'retouch_form_submit', form_name: 'Заказ ретуши фото' });
        }
        toast.success("Заявка отправлена! Мы свяжемся с вами в течение 30 минут");
        setFormData({ name: "", email: "", comment: "" });
        setHoneypot("");
        setSelectedFile(null);
        setPreviewUrl("");
        if (inputRef.current) inputRef.current.value = "";
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        toast.error(result.error || "Ошибка при отправке заявки");
        setUploadProgress(0);
      }
    } catch {
      clearInterval(progressInterval);
      toast.error("Ошибка при отправке заявки. Попробуйте позже");
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border border-primary/20 rounded-xl p-6 shadow-lg">
        <h3 className="font-oswald font-bold text-2xl text-center mb-5">
          Заказать ретушь фото
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot — скрыто от людей, видно ботам */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Загрузка фото */}
          <div>
            <label className="block font-semibold mb-2 text-sm">
              Загрузите фото
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center min-h-[130px] border-2 border-dashed border-primary/50 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all p-4"
              >
                {previewUrl ? (
                  <div className="relative w-full">
                    <img
                      src={previewUrl}
                      alt="Предпросмотр"
                      className="max-h-[260px] mx-auto rounded-lg object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={clearFile}
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Icon name="Upload" size={32} className="text-primary mb-2" />
                    <p className="font-oswald font-semibold text-base text-foreground mb-1">
                      Выбрать фото
                    </p>
                    <p className="text-muted-foreground text-sm text-center">
                      JPEG, PNG, WEBP · до 10 МБ
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Имя + Email в ряд */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1.5 text-sm">
                Ваше имя <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="Как к вам обращаться?"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 text-sm"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1.5 text-sm">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-10 text-sm"
                required
              />
            </div>
          </div>

          {/* Комментарий */}
          <div>
            <label className="block font-semibold mb-1.5 text-sm">
              Комментарий
            </label>
            <Textarea
              placeholder="Опишите пожелания к ретуши (необязательно)"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="min-h-[80px] text-sm resize-none"
            />
          </div>

          {/* Прогресс */}
          {loading && uploadProgress > 0 && (
            <div className="space-y-1.5">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-center text-xs text-muted-foreground">
                Отправка: {uploadProgress}%
              </p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-oswald text-lg h-12"
          >
            {loading ? (
              <>
                <Icon name="Loader2" className="animate-spin mr-2" size={20} />
                Отправка...
              </>
            ) : (
              "Отправить заявку"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Мы свяжемся с вами в течение 30 минут
          </p>
        </form>
      </div>
    </div>
  );
};

export default RetouchForm;