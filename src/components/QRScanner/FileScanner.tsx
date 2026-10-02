import React, { useRef, useState } from 'react';
import { UploadCloud, FileImage, AlertCircle, CheckCircle2 } from 'lucide-react';
import { scanQRFromFile, playScanChirp } from '../../utils/qrScanner';

interface FileScannerProps {
  onScanSuccess: (data: string) => void;
}

export const FileScanner: React.FC<FileScannerProps> = ({ onScanSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP, etc.).');
      return;
    }

    setError(null);
    setScanning(true);

    try {
      const result = await scanQRFromFile(file);
      if (result) {
        playScanChirp();
        onScanSuccess(result);
      } else {
        setError('No se detectó ningún código QR legible en esta imagen. Intenta con una imagen más nítida o de mayor contraste.');
      }
    } catch (e) {
      setError('Error al procesar la imagen.');
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
        className="hidden"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-inner">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {scanning ? 'Analizando imagen...' : 'Selecciona o arrastra una imagen'}
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Sube una captura de pantalla, foto o archivo descargado (JPG, PNG, WebP) para leer el código QR al instante.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
