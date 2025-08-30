import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const QRTextSender = () => {
  const [inputText, setInputText] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Генерация QR-кода
  const generateQR = useCallback(() => {
    if (!inputText.trim()) {
      toast({
        title: "Введите текст",
        description: "Пожалуйста, введите текст для генерации QR-кода",
        variant: "destructive"
      });
      return;
    }

    const encodedText = encodeURIComponent(inputText);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedText}`;
    setQrCodeUrl(qrUrl);
    
    toast({
      title: "QR-код создан!",
      description: "Ваш QR-код готов к использованию"
    });
  }, [inputText]);

  // Запуск камеры для сканирования
  const startScanning = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      toast({
        title: "Камера запущена",
        description: "Наведите на QR-код для сканирования"
      });
    } catch (error) {
      console.error('Ошибка доступа к камере:', error);
      toast({
        title: "Ошибка камеры",
        description: "Не удалось получить доступ к камере",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  // Остановка сканирования
  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Симуляция сканирования (для демо)
  const simulateScan = () => {
    const demoData = "Привет! Это демо QR-код с текстом.";
    setScannedData(demoData);
    stopScanning();
    toast({
      title: "QR-код отсканирован!",
      description: "Данные успешно извлечены"
    });
  };

  // Копирование в буфер обмена
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано!",
      description: "Текст скопирован в буфер обмена"
    });
  };

  // Скачивание QR-кода
  const downloadQR = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR-код сохранён!",
      description: "Файл загружен на ваше устройство"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-qr-purple via-primary to-qr-green">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Icon name="QrCode" size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              QR Text Sender
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Создавайте QR-коды из текста и сканируйте их через камеру
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Generator */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-white">
                <Icon name="Type" size={24} />
                Создать QR-код
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-white/90 font-medium block">
                  Введите текст
                </label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Напишите ваш текст здесь..."
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60 min-h-[120px] resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>{inputText.length}/500 символов</span>
                </div>
              </div>

              <Button 
                onClick={generateQR}
                disabled={!inputText.trim()}
                className="w-full bg-qr-green hover:bg-qr-green/90 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <Icon name="QrCode" size={20} className="mr-2" />
                Создать QR-код
              </Button>

              {qrCodeUrl && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center space-y-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="Generated QR Code" 
                    className="mx-auto rounded-xl shadow-lg bg-white p-4"
                  />
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={downloadQR}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Icon name="Download" size={16} className="mr-2" />
                      Скачать
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(qrCodeUrl)}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Icon name="Link" size={16} className="mr-2" />
                      Ссылка
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Scanner */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-white">
                <Icon name="ScanLine" size={24} />
                Сканировать QR-код
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isScanning ? (
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                    <Icon name="Camera" size={40} className="text-white/80" />
                  </div>
                  <p className="text-white/80">
                    Нажмите кнопку ниже, чтобы запустить камеру и отсканировать QR-код
                  </p>
                  <Button 
                    onClick={startScanning}
                    className="w-full bg-qr-orange hover:bg-qr-orange/90 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Icon name="Camera" size={20} className="mr-2" />
                    Запустить камеру
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-qr-gray rounded-2xl overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      playsInline
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                    />
                    <div className="absolute inset-0 border-2 border-qr-green/50 rounded-2xl pointer-events-none">
                      <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-qr-green"></div>
                      <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-qr-green"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-qr-green"></div>
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-qr-green"></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={simulateScan}
                      className="flex-1 bg-qr-green hover:bg-qr-green/90 text-white"
                    >
                      <Icon name="Scan" size={16} className="mr-2" />
                      Демо сканирование
                    </Button>
                    <Button
                      onClick={stopScanning}
                      variant="outline"
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {scannedData && (
                <div className="bg-qr-green/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-qr-green text-white">
                      <Icon name="CheckCircle" size={14} className="mr-1" />
                      Отсканировано
                    </Badge>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-white font-mono break-words">{scannedData}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => copyToClipboard(scannedData)}
                      variant="outline"
                      className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Icon name="Copy" size={16} className="mr-2" />
                      Копировать
                    </Button>
                    <Button
                      onClick={() => setScannedData('')}
                      variant="outline"
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
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
              <Icon name="Zap" size={32} />
            </div>
            <h3 className="text-xl font-semibold">Мгновенно</h3>
            <p className="text-white/70">Создание QR-кодов за секунды</p>
          </div>
          
          <div className="text-center text-white space-y-3">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
              <Icon name="Camera" size={32} />
            </div>
            <h3 className="text-xl font-semibold">Сканирование</h3>
            <p className="text-white/70">Используйте камеру устройства</p>
          </div>
          
          <div className="text-center text-white space-y-3">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
              <Icon name="Shield" size={32} />
            </div>
            <h3 className="text-xl font-semibold">Безопасно</h3>
            <p className="text-white/70">Всё работает в браузере</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRTextSender;