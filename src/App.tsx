import React, { useState, useEffect, useMemo } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ContentInput } from './components/QRGenerator/ContentInput';
import { StyleCustomizer } from './components/QRGenerator/StyleCustomizer';
import { QRPreview } from './components/QRGenerator/QRPreview';
import { CameraScanner } from './components/QRScanner/CameraScanner';
import { FileScanner } from './components/QRScanner/FileScanner';
import { ScanResultModal } from './components/QRScanner/ScanResultModal';
import { ScanHistoryView } from './components/History/ScanHistoryView';
import { SavedCodesView } from './components/Gallery/SavedCodesView';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  QRContentType,
  QRStyleOptions,
  WifiData,
  VCardData,
  EmailData,
  WhatsAppData,
  CalendarData,
  ScannedQRItem,
  SavedQRCodeItem,
} from './types/qr';
import { formatQRContent } from './utils/qrGenerator';
import {
  getScanHistory,
  addScanToHistory,
  getSavedCodes,
} from './utils/storage';
import { Camera, FileUp, Sparkles, Layers, QrCode } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('qr_theme') === 'dark' ||
      (!('qr_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  // Aplicar la clase de modo oscuro al elemento raíz html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('qr_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('qr_theme', 'light');
    }
  }, [darkMode]);

  // Estado del Generador
  const [contentType, setContentType] = useState<QRContentType>('url');
  const [title, setTitle] = useState('Mi Código QR');
  const [urlValue, setUrlValue] = useState('https://google.com');
  const [textValue, setTextValue] = useState('¡Hola! Este código QR fue generado sin conexión a internet.');
  const [wifiData, setWifiData] = useState<WifiData>({
    ssid: 'MiRedWiFi',
    password: 'clave_segura_123',
    encryption: 'WPA',
    hidden: false,
  });
  const [vcardData, setVcardData] = useState<VCardData>({
    firstName: 'Carlos',
    lastName: 'Gómez',
    phone: '+34 600 123 456',
    email: 'carlos@empresa.com',
    company: 'Estudio Creativo',
    jobTitle: 'Diseñador UI/UX',
    website: 'https://carlosgomez.design',
    address: 'Madrid, España',
  });
  const [emailData, setEmailData] = useState<EmailData>({
    address: 'info@ejemplo.com',
    subject: 'Consulta de contacto',
    body: 'Hola, me gustaría más información.',
  });
  const [phoneValue, setPhoneValue] = useState('+34 910 000 000');
  const [whatsappData, setWhatsappData] = useState<WhatsAppData>({
    phoneNumber: '34600123456',
    message: 'Hola! Vi tu código QR y me interesa conocer más.',
  });
  const [calendarData, setCalendarData] = useState<CalendarData>({
    title: 'Presentación de Proyecto',
    startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 90000000).toISOString().slice(0, 16),
    location: 'Sala Principal & Online',
    description: 'Demostración de la nueva aplicación de códigos QR.',
  });

  // Opciones de estilo del código QR
  const [styleOptions, setStyleOptions] = useState<QRStyleOptions>({
    fgColor: '#000000',
    bgColor: '#ffffff',
    eyeColor: '#000000',
    moduleShape: 'rounded',
    eyeShape: 'rounded',
    errorCorrectionLevel: 'M',
    margin: 3,
    logoSizePercent: 20,
    logoBgColor: '#ffffff',
    logoBgShape: 'rounded',
    logoPadding: 8,
  });

  // Estado del escáner
  const [scannerMode, setScannerMode] = useState<'camera' | 'file'>('camera');
  const [activeScanModalData, setActiveScanModalData] = useState<string | null>(null);

  // Estado del almacenamiento local
  const [history, setHistory] = useState<ScannedQRItem[]>([]);
  const [savedCodes, setSavedCodes] = useState<SavedQRCodeItem[]>([]);

  // Inicializar almacenamiento local
  useEffect(() => {
    setHistory(getScanHistory());
    setSavedCodes(getSavedCodes());
  }, []);

  const refreshSavedCodes = () => {
    setSavedCodes(getSavedCodes());
  };

  const refreshHistory = () => {
    setHistory(getScanHistory());
  };

  // Formatear contenido para el motor del código QR
  const formattedContent = useMemo(() => {
    return formatQRContent(contentType, {
      url: urlValue,
      text: textValue,
      wifi: wifiData,
      vcard: vcardData,
      email: emailData,
      phone: phoneValue,
      whatsapp: whatsappData,
      calendar: calendarData,
    });
  }, [
    contentType,
    urlValue,
    textValue,
    wifiData,
    vcardData,
    emailData,
    phoneValue,
    whatsappData,
    calendarData,
  ]);

  // Manejar detección del código escaneado
  const handleScanDetected = (scannedRaw: string) => {
    const item = addScanToHistory(scannedRaw, contentType);
    setHistory(getScanHistory());
    setActiveScanModalData(scannedRaw);
  };

  // Cargar contenido escaneado o guardado en el generador
  const handleLoadInGenerator = (contentToLoad: string, detectedType?: string) => {
    if (detectedType === 'url' || /^https?:\/\//i.test(contentToLoad)) {
      setContentType('url');
      setUrlValue(contentToLoad);
      setTitle('Enlace Web');
    } else if (contentToLoad.startsWith('WIFI:')) {
      setContentType('wifi');
      const ssidMatch = contentToLoad.match(/S:([^;]+)/i);
      const passMatch = contentToLoad.match(/P:([^;]*)/i);
      setWifiData((prev) => ({
        ...prev,
        ssid: ssidMatch ? ssidMatch[1] : '',
        password: passMatch ? passMatch[1] : '',
      }));
      setTitle('Red Wi-Fi');
    } else if (contentToLoad.startsWith('tel:')) {
      setContentType('phone');
      setPhoneValue(contentToLoad.replace('tel:', ''));
      setTitle('Teléfono');
    } else if (contentToLoad.includes('wa.me')) {
      setContentType('whatsapp');
      setTitle('WhatsApp');
    } else {
      setContentType('text');
      setTextValue(contentToLoad);
      setTitle('Texto Escaneado');
    }
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cargar elemento guardado para su edición
  const handleEditSavedCode = (item: SavedQRCodeItem) => {
    setContentType(item.contentType);
    setTitle(item.title);
    if (item.contentType === 'url') setUrlValue(item.content);
    else if (item.contentType === 'text') setTextValue(item.content);
    setStyleOptions(item.styles);
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors pb-20 md:pb-12">
      {/* Barra de navegación del encabezado */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCount={savedCodes.length}
        historyCount={history.length}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Área principal de contenido */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        {/* PESTAÑA 1: GENERADOR */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Título y descripción principal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Generador de Códigos QR</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    Offline
                  </span>
                </h1>

              </div>

              {/* Campo para la etiqueta / nombre al guardar */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 shrink-0">Etiqueta:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nombre del código"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Diseño dividido: Controles a la izquierda, previsualización fija a la derecha */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Columna izquierda: Entrada de contenido y personalización de estilo (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <ContentInput
                  contentType={contentType}
                  onTypeChange={(t) => {
                    setContentType(t);
                    if (t === 'url') setTitle('Enlace Web');
                    else if (t === 'wifi') setTitle('Wi-Fi Invitados');
                    else if (t === 'vcard') setTitle('Tarjeta de Contacto');
                    else if (t === 'whatsapp') setTitle('Contacto WhatsApp');
                    else if (t === 'calendar') setTitle('Evento de Calendario');
                    else setTitle(`Código ${t.toUpperCase()}`);
                  }}
                  urlValue={urlValue}
                  onUrlChange={setUrlValue}
                  textValue={textValue}
                  onTextChange={setTextValue}
                  wifiData={wifiData}
                  onWifiChange={setWifiData}
                  vcardData={vcardData}
                  onVcardChange={setVcardData}
                  emailData={emailData}
                  onEmailChange={setEmailData}
                  phoneValue={phoneValue}
                  onPhoneChange={setPhoneValue}
                  whatsappData={whatsappData}
                  onWhatsappChange={setWhatsappData}
                  calendarData={calendarData}
                  onCalendarChange={setCalendarData}
                />

                <StyleCustomizer options={styleOptions} onChange={setStyleOptions} />
              </div>

              {/* Columna derecha: Previsualización en vivo y centro de exportación (5 cols) */}
              <div className="lg:col-span-5">
                <QRPreview
                  content={formattedContent}
                  contentType={contentType}
                  title={title}
                  options={styleOptions}
                  onCodeSaved={refreshSavedCodes}
                />
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: ESCÁNER */}
        {activeTab === 'scanner' && (
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Escáner de Códigos QR
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Escanea al instante con la cámara de tu dispositivo o sube una imagen desde tus archivos.
              </p>
            </div>

            {/* Selector de modo: Cámara en vivo vs Subir archivo */}
            <div className="flex justify-center">
              <div className="inline-flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setScannerMode('camera')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    scannerMode === 'camera'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Cámara en Vivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScannerMode('file')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    scannerMode === 'file'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileUp className="w-4 h-4" />
                  <span>Subir Imagen / Archivo</span>
                </button>
              </div>
            </div>

            {/* Área del componente de escaneo */}
            {scannerMode === 'camera' ? (
              <CameraScanner
                isActive={activeTab === 'scanner' && scannerMode === 'camera'}
                onScanSuccess={handleScanDetected}
              />
            ) : (
              <FileScanner onScanSuccess={handleScanDetected} />
            )}

            {/* Resumen del último escaneo */}
            {history.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Último escaneo
                  </h4>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    Ver todo el historial ({history.length})
                  </button>
                </div>
                <div
                  onClick={() => setActiveScanModalData(history[0].content)}
                  className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-400 transition shadow-sm"
                >
                  <div className="min-w-0 pr-3">
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                      {history[0].type}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                      {history[0].content}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(history[0].scannedAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: GALERÍA */}
        {activeTab === 'gallery' && (
          <SavedCodesView
            savedCodes={savedCodes}
            onSavedCodesChange={setSavedCodes}
            onEditCode={handleEditSavedCode}
          />
        )}

        {/* PESTAÑA 4: HISTORIAL DE ESCANEOS */}
        {activeTab === 'history' && (
          <ScanHistoryView
            history={history}
            onHistoryChange={setHistory}
            onSelectItem={(item) => setActiveScanModalData(item.content)}
          />
        )}
      </main>

      {/* Modal con el resultado del código escaneado */}
      {activeScanModalData && (
        <ScanResultModal
          rawContent={activeScanModalData}
          onClose={() => setActiveScanModalData(null)}
          onUseInGenerator={handleLoadInGenerator}
        />
      )}

      {/* Notificación flotante de modo sin conexión */}
      <OfflineIndicator />
    </div>
  );
}
