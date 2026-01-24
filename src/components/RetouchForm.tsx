import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const RetouchForm = () => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    comment: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxSize = 1200;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.85);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Размер файла не должен превышать 10 МБ");
      e.target.value = "";
      return;
    }
    
    try {
      toast.info("Подготовка фото...");
      const compressedFile = await compressImage(file);
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const url = URL.createObjectURL(compressedFile);
      
      requestAnimationFrame(() => {
        setSelectedFile(compressedFile);
        setPreviewUrl(url);
        toast.success("Фото загружено");
      });
    } catch (error) {
      console.error("File processing error:", error);
      toast.error("Ошибка обработки файла");
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error("Заполните обязательные поля");
      return;
    }

    if (!selectedFile) {
      toast.error("Прикрепите фотографию");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("comment", formData.comment);
      formDataToSend.append("photo", selectedFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("https://functions.poehali.dev/839640cf-1008-4c5d-8be3-81a7d9db548e", {
        method: "POST",
        body: formDataToSend
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok && result.success) {
        // GTM event
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'retouch_form_submit',
            form_name: 'Заказ ретуши фото'
          });
        }
        
        toast.success("Заявка отправлена! Мы свяжемся с вами в течение 30 минут");
        setFormData({ name: "", phone: "", comment: "" });
        setSelectedFile(null);
        setPreviewUrl("");
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        toast.error(result.error || "Ошибка при отправке заявки");
        setUploadProgress(0);
      }
    } catch (error) {
      toast.error("Ошибка при отправке заявки. Попробуйте позже");
      console.error("Submit error:", error);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-8 md:p-12 shadow-lg">
        <h3 className="font-oswald font-bold text-3xl md:text-4xl text-center mb-8">
          Заказать ретушь фото
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Загрузка фото */}
          <div>
            <label className="block font-semibold mb-3 text-lg">
              Загрузите фото
            </label>
            <div className="relative">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-primary/50 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all p-8"
              >
                {previewUrl ? (
                  <div className="relative w-full">
                    <img
                      src={previewUrl}
                      alt="Предпросмотр"
                      className="max-h-[300px] mx-auto rounded-lg object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (previewUrl) {
                          URL.revokeObjectURL(previewUrl);
                        }
                        const input = document.getElementById('photo-upload') as HTMLInputElement;
                        if (input) input.value = "";
                        requestAnimationFrame(() => {
                          setSelectedFile(null);
                          setPreviewUrl("");
                        });
                      }}
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Icon name="Upload" size={48} className="text-primary mb-4" />
                    <p className="font-oswald font-semibold text-xl text-foreground mb-2">
                      Выбрать фото
                    </p>
                    <p className="text-muted-foreground text-center">
                      с телефона или компьютера
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Имя */}
          <div>
            <label className="block font-semibold mb-3 text-lg">
              Ваше имя <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="Как к вам обращаться?"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-14 text-base"
              required
            />
          </div>

          {/* Телефон */}
          <div>
            <label className="block font-semibold mb-3 text-lg">
              Телефон <span className="text-destructive">*</span>
            </label>
            <Input
              type="tel"
              placeholder="+7 (___) __-__-__"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-14 text-base"
              required
            />
          </div>

          {/* Комментарий */}
          <div>
            <label className="block font-semibold mb-3 text-lg">
              Комментарий
            </label>
            <Textarea
              placeholder="Опишите пожелания к ретуши (необязательно)"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="min-h-[120px] text-base resize-none"
            />
          </div>

          {/* Прогресс загрузки */}
          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                Загрузка: {uploadProgress}%
              </p>
            </div>
          )}

          {/* Кнопка отправки */}
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-oswald text-xl h-16"
          >
            {loading ? (
              <>
                <Icon name="Loader2" className="animate-spin mr-2" size={24} />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="Send" className="mr-2" size={24} />
                Отправить заявку
              </>
            )}
          </Button>

          <p className="text-center text-muted-foreground text-sm">
            Мы свяжемся с вами в течение 30 минут
          </p>
        </form>
      </div>
    </div>
  );
};

export default RetouchForm;