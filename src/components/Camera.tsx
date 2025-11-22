import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { X, RotateCcw } from 'lucide-react';

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export default function Camera({ onCapture, onClose }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setIsCapturing(true);
      onCapture(imageSrc);
      setTimeout(() => {
        setIsCapturing(false);
      }, 300);
    }
  }, [onCapture]);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200">
      <div className="flex justify-between items-center p-4 bg-black/60 backdrop-blur-sm">
        <h2 className="text-white text-lg font-semibold">Capturar Foto</h2>
        <button
          onClick={onClose}
          className="text-white p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode,
            width: { min: 320, ideal: 1080, max: 1920 },
            height: { min: 240, ideal: 1920, max: 1920 },
          }}
          className="w-full h-full object-cover"
        />

        {isCapturing && (
          <div className="absolute inset-0 bg-white/30 animate-pulse" />
        )}
      </div>

      <div className="p-6 bg-black/60 backdrop-blur-sm flex justify-center gap-4">
        <button
          onClick={toggleCamera}
          className="bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-all duration-200 border border-white/20"
          title="Cambiar cámara"
        >
          <RotateCcw size={24} />
        </button>

        <button
          onClick={capture}
          disabled={isCapturing}
          className="bg-white text-black p-5 rounded-full hover:bg-gray-200 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:scale-100 shadow-xl"
        >
          <div className="w-8 h-8 bg-white rounded-full" />
        </button>

        <div className="w-14" />
      </div>
    </div>
  );
}
