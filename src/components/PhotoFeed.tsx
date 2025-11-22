import { useState } from 'react';
import { Trash2, Download, Share2, Image as ImageIcon, Package } from 'lucide-react';
import type { Photo } from '../types/Photo';

interface PhotoFeedProps {
  photos: Photo[];
  onDelete: (id: string) => void;
}

// Placeholder SVG para imágenes rotas
const PlaceholderImage = () => (
  <div className="w-full h-96 bg-gray-800 flex items-center justify-center">
    <div className="text-center">
      <ImageIcon className="mx-auto text-gray-600 mb-2" size={48} />
      <p className="text-gray-500 text-sm">Imagen no disponible</p>
    </div>
  </div>
);

export default function PhotoFeed({ photos, onDelete }: PhotoFeedProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const formatDateTime = (date: Date) => {
    const now = new Date();
    const photoDate = new Date(date);
    const diffMs = now.getTime() - photoDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Si es hoy, mostrar hora exacta
    if (diffDays === 0) {
      if (diffMins < 1) return 'Hace unos segundos';
      if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
      if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    }

    // Hora exacta con segundos
    return photoDate.toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: photoDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleImageError = (photoId: string) => {
    setImageErrors((prev) => new Set(prev).add(photoId));
  };

  const downloadPhoto = (photo: Photo) => {
    try {
      const link = document.createElement('a');
      link.href = photo.imageUrl;
      link.download = `foto-${photo.id}-${photo.createdAt.getTime()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading photo:', err);
    }
  };

  const sharePhoto = async (photo: Photo) => {
    try {
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `foto-${photo.id}.jpg`, { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: photo.title || 'Foto compartida',
        });
      } else {
        downloadPhoto(photo);
      }
    } catch (err) {
      downloadPhoto(photo);
    }
  };

  const exportAllPhotos = async () => {
    if (photos.length === 0) return;
    
    setIsExporting(true);
    try {
      // Crear ZIP con todas las fotos
      if (photos.length === 1) {
        downloadPhoto(photos[0]);
        setIsExporting(false);
        return;
      }

      // Para múltiples fotos, descargar una por una con delay
      for (let i = 0; i < photos.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        downloadPhoto(photos[i]);
      }
    } catch (err) {
      console.error('Error exporting photos:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const shareAllPhotos = async () => {
    if (photos.length === 0) return;
    
    setIsExporting(true);
    try {
      const files: File[] = [];
      
      for (const photo of photos.slice(0, 10)) { // Limitar a 10 para compartir
        try {
          const response = await fetch(photo.imageUrl);
          const blob = await response.blob();
          const file = new File([blob], `foto-${photo.id}.jpg`, { type: 'image/jpeg' });
          files.push(file);
        } catch (err) {
          console.error('Error loading photo for share:', err);
        }
      }

      if (navigator.share && navigator.canShare?.({ files })) {
        await navigator.share({
          files,
          title: `Galería de Fotos - ${photos.length} fotos`,
        });
      } else {
        exportAllPhotos();
      }
    } catch (err) {
      console.error('Error sharing photos:', err);
      exportAllPhotos();
    } finally {
      setIsExporting(false);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center px-4">
          <ImageIcon className="mx-auto text-gray-600 mb-4" size={64} />
          <p className="text-gray-400 text-lg font-medium">No hay fotos aún</p>
          <p className="text-gray-500 text-sm mt-2">Captura tu primera foto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Botones de exportar/compartir todas */}
      {photos.length > 0 && (
        <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex gap-2">
          <button
            onClick={shareAllPhotos}
            disabled={isExporting}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
          >
            <Share2 size={18} />
            <span>Compartir Todas</span>
          </button>
          <button
            onClick={exportAllPhotos}
            disabled={isExporting}
            className="flex-1 bg-gray-700 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
          >
            <Package size={18} />
            <span>Exportar Todas</span>
          </button>
        </div>
      )}

      {/* Feed tipo Instagram */}
      <div className="max-w-2xl mx-auto w-full">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="bg-gray-900 border-b border-gray-800 mb-2 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Imagen */}
            <div className="relative w-full bg-black">
              {imageErrors.has(photo.id) ? (
                <PlaceholderImage />
              ) : (
                <img
                  src={photo.imageUrl}
                  alt={photo.title || 'Foto'}
                  className="w-full h-auto object-contain max-h-[85vh]"
                  loading="lazy"
                  onError={() => handleImageError(photo.id)}
                />
              )}
            </div>

            {/* Controles siempre visibles */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs font-medium">
                  {formatDateTime(photo.createdAt)}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => sharePhoto(photo)}
                    className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Compartir"
                    aria-label="Compartir foto"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    onClick={() => downloadPhoto(photo)}
                    className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                    title="Descargar"
                    aria-label="Descargar foto"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(photo.id)}
                    className="p-2 text-red-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                    aria-label="Eliminar foto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              {photo.title && (
                <p className="text-white text-sm font-medium mb-1 break-words">
                  {photo.title}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="h-4" />
    </div>
  );
}
