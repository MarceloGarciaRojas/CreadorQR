import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Zap, AlertCircle, StopCircle, Play } from 'lucide-react';
import jsQR from 'jsqr';
import { playScanChirp } from '../../utils/qrScanner';

interface CameraScannerProps {
  onScanSuccess: (data: string) => void;
  isActive: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onScanSuccess, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  // Detener pistas y transmisión de la cámara
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setTorchOn(false);
  }, []);

  // Bucle de procesamiento de fotogramas
  const scanLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;
    const video = videoRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data && code.data.trim()) {
          playScanChirp();
          onScanSuccess(code.data.trim());
          return; // Pausar bucle de escaneo hasta procesar el resultado
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanLoop);
  }, [isScanning, onScanSuccess]);

  // Iniciar transmisión de la cámara
  const startCamera = useCallback(async () => {
    stopCamera();
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('La cámara no está disponible en este navegador o contexto.');
      setHasPermission(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setHasPermission(true);

      // Comprobar si la linterna es compatible
      const track = stream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
      setTorchSupported(Boolean(capabilities && capabilities.torch));

      // Iniciar bucle de escaneo
      animFrameRef.current = requestAnimationFrame(scanLoop);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Permiso de cámara denegado. Permite el acceso a la cámara en los ajustes de tu navegador.');
      } else if (err.name === 'NotFoundError') {
        setErrorMessage('No se encontró ninguna cámara disponible en tu dispositivo.');
      } else {
        setErrorMessage('No se pudo iniciar la cámara: ' + (err.message || 'error desconocido'));
      }
    }
  }, [facingMode, scanLoop, stopCamera]);

  // Alternar estado de la linterna
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (err) {
      console.warn('Error toggling flashlight:', err);
    }
  };

  // Alternar entre cámara frontal y trasera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Gestionar inicio y parada según el estado activo
  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, facingMode, startCamera, stopCamera]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-[4/3] sm:aspect-video flex items-center justify-center shadow-lg border border-slate-800">
      {/* Elemento de visualización de video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Visor de enfoque y animación del rayo láser */}
      {hasPermission && !errorMessage && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Bordes oscurecidos superpuestos */}
          <div className="absolute inset-0 bg-black/35" />

          {/* Ventana central de escaneo */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl border-2 border-indigo-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] z-10 overflow-hidden">
            {/* Esquinas del visor */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-xl" />

            {/* Rayo láser animado de escaneo */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_#6366f1] animate-[scan_2s_ease-in-out_infinite]" />
          </div>

          <p className="absolute bottom-6 z-20 text-xs font-medium text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            Apunta la cámara hacia un código QR
          </p>
        </div>
      )}

      {/* Barra de herramientas superpuesta de la cámara */}
      {hasPermission && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          {torchSupported && (
            <button
              onClick={toggleTorch}
              className={`p-2.5 rounded-xl backdrop-blur-md transition cursor-pointer ${
                torchOn ? 'bg-amber-400 text-slate-900 shadow-lg' : 'bg-black/50 text-white hover:bg-black/70'
              }`}
              title="Linterna"
            >
              <Zap className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={flipCamera}
            className="p-2.5 rounded-xl bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition cursor-pointer"
            title="Cambiar de cámara"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pantalla de error o aviso de permisos */}
      {errorMessage && (
        <div className="absolute inset-0 bg-slate-900/95 p-6 flex flex-col items-center justify-center text-center text-white z-30">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold mb-1">Acceso a Cámara</h4>
          <p className="text-xs text-slate-300 max-w-xs mb-4">{errorMessage}</p>
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Reintentar Permiso
          </button>
        </div>
      )}

      {/* Estilos CSS personalizados para la animación del láser */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 96%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
