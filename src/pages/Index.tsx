import React, { useState, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const QRSenderForm = () => {
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обработка выбора файла
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Неверный формат",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "Файл слишком большой",
        description: "Максимальный размер файла: 10MB",
        variant: "destructive"
      });
      return;
    }

    setQrFile(file);
    
    // Создание превью
    const reader = new FileReader();
    reader.onload = (e) => {
      setQrPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    toast({
      title: "QR-код загружен!",
      description: `Файл: ${file.name}`
    });
  }, []);

  // Drag & Drop обработчики
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Валидация Telegram username
  const validateTelegramUsername = (username: string): boolean => {
    const cleanUsername = username.replace('@', '');
    const telegramRegex = /^[a-zA-Z0-9_]{5,32}$/;
    return telegramRegex.test(cleanUsername);
  };

  // Форматирование username
  const formatTelegramUsername = (value: string): string => {
    let formatted = value.replace(/[^a-zA-Z0-9_@]/g, '');
    if (formatted && !formatted.startsWith('@')) {
      formatted = '@' + formatted;
    }
    return formatted.slice(0, 33); // @username max 32 chars
  };

  // Обработка ввода username
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelegramUsername(e.target.value);
    setTelegramUsername(formatted);
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!qrFile) {
      toast({
        title: "QR-код не выбран",
        description: "Пожалуйста, загрузите QR-код",
        variant: "destructive"
      });
      return;
    }

    if (!telegramUsername || !validateTelegramUsername(telegramUsername)) {
      toast({
        title: "Неверный username",
        description: "Username должен содержать 5-32 символа (a-z, 0-9, _)",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Симуляция отправки
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast({
        title: "QR-код отправлен! 🚀",
        description: `Отправлено пользователю ${telegramUsername}`
      });

      // Сброс формы через 3 секунды
      setTimeout(() => {
        setIsSubmitted(false);
        setQrFile(null);
        setQrPreview('');
        setTelegramUsername('');
      }, 3000);

    } catch (error) {
      toast({
        title: "Ошибка отправки",
        description: "Попробуйте еще раз",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Очистка файла
  const clearFile = () => {
    setQrFile(null);
    setQrPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-qr-purple via-primary to-qr-green">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Icon name="Send" size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              QR Sender
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Отправьте QR-код с вашим Telegram username
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-white text-center justify-center">
                <Icon name="Upload" size={24} />
                Отправить QR-код
              </CardTitle>
            </CardHeader>

            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* File Upload Area */}
                  <div className="space-y-4">
                    <Label className="text-white/90 font-medium">
                      QR-код (изображение)
                    </Label>
                    
                    <div
                      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer hover:border-qr-green/50 ${
                        isDragging 
                          ? 'border-qr-green bg-qr-green/5 scale-105' 
                          : qrFile 
                            ? 'border-qr-green/50 bg-qr-green/5' 
                            : 'border-white/30 bg-white/5'
                      }`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                      />

                      {qrPreview ? (
                        <div className="text-center space-y-4">
                          <img 
                            src={qrPreview} 
                            alt="QR код превью" 
                            className="max-w-48 max-h-48 mx-auto rounded-xl bg-white p-2 shadow-lg"
                          />
                          <div className="flex items-center justify-center gap-2">
                            <Badge className="bg-qr-green text-white">
                              <Icon name="CheckCircle" size={14} className="mr-1" />
                              {qrFile?.name}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearFile();
                              }}
                              className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                              <Icon name="X" size={16} />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                            <Icon name="Upload" size={32} className="text-white/80" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-white font-medium">
                              {isDragging ? 'Отпустите файл здесь' : 'Перетащите QR-код сюда'}
                            </p>
                            <p className="text-white/60 text-sm">
                              или нажмите для выбора файла
                            </p>
                            <p className="text-white/50 text-xs">
                              PNG, JPG, GIF до 10MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Telegram Username Input */}
                  <div className="space-y-3">
                    <Label htmlFor="telegram" className="text-white/90 font-medium">
                      Ваш Telegram username
                    </Label>
                    <div className="relative">
                      <Input
                        id="telegram"
                        type="text"
                        value={telegramUsername}
                        onChange={handleUsernameChange}
                        placeholder="@username"
                        className="bg-white/10 border-white/30 text-white placeholder:text-white/50 pl-10"
                        maxLength={33}
                      />
                      <Icon 
                        name="AtSign" 
                        size={18} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" 
                      />
                      {telegramUsername && !validateTelegramUsername(telegramUsername) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Icon name="AlertCircle" size={18} className="text-red-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">
                        {telegramUsername.length}/33 символов
                      </span>
                      {telegramUsername && validateTelegramUsername(telegramUsername) && (
                        <Badge className="bg-qr-green/20 text-qr-green border-qr-green/30">
                          <Icon name="CheckCircle" size={12} className="mr-1" />
                          Валидный username
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!qrFile || !telegramUsername || !validateTelegramUsername(telegramUsername) || isSubmitting}
                    className="w-full bg-qr-orange hover:bg-qr-orange/90 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                        Отправляю...
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={20} className="mr-2" />
                        Отправить QR-код
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                // Success State
                <div className="text-center py-12 space-y-6">
                  <div className="w-24 h-24 mx-auto bg-qr-green/20 rounded-full flex items-center justify-center animate-scale-in">
                    <Icon name="CheckCircle" size={48} className="text-qr-green" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white">
                      QR-код отправлен! 🚀
                    </h3>
                    <p className="text-white/80">
                      Ваш QR-код успешно доставлен пользователю<br />
                      <span className="font-mono font-semibold text-qr-green">
                        {telegramUsername}
                      </span>
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
                      <Icon name="Clock" size={16} />
                      Форма будет сброшена через несколько секунд...
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center text-white space-y-3">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
              <Icon name="Upload" size={32} />
            </div>
            <h3 className="text-xl font-semibold">Drag & Drop</h3>
            <p className="text-white/70">Просто перетащите файл</p>
          </div>
          
          <div className="text-center text-white space-y-3">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
              <Icon name="Shield" size={32} />
            </div>
            <h3 className="text-xl font-semibold">Безопасно</h3>
            <p className="text-white/70">Защищенная передача данных</p>
          </div>
          
          <div className="text-center text-white space-y-3">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
              <Icon name="Zap" size={32} />
            </div>
            <h3 className="text-xl font-semibold">Мгновенно</h3>
            <p className="text-white/70">Быстрая отправка</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRSenderForm;