import { useState } from 'react';
import { Trash2, Download, Share2 } from 'lucide-react';
import type { Photo } from '../types/Photo';

interface PhotoFeedProps {
  photos: Photo[];
  onDelete: (id: string) => void;
}

export default function PhotoFeed({ photos, onDelete }: PhotoFeedProps) {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.imageUrl;
    link.download = `foto-${photo.id}.jpg`;
    link.click();
  };

  const sharePhoto = async (photo: Photo) => {
    try {
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `foto-${photo.id}.jpg`, { type: 'image/jpeg' });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Foto compartida',
          text: photo.title || 'Mira esta foto',
        });
      } else {
        downloadPhoto(photo);
      }
    } catch (err) {
      downloadPhoto(photo);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">No hay fotos aún</p>
          <p className="text-gray-500 text-sm mt-2">Captura tu primera foto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <div className="px-4 pt-4 space-y-6">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-300"
            onMouseEnter={() => setSelectedPhotoId(photo.id)}
            onMouseLeave={() => setSelectedPhotoId(null)}
          >
            <div className="relative group">
              <img
                src={photo.imageUrl}
                alt={photo.title || 'Foto'}
                className="w-full h-auto object-cover max-h-96"
                loading="lazy"
              />

              {selectedPhotoId === photo.id && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end p-4 animate-in fade-in duration-200">
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => sharePhoto(photo)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                    >
                      <Share2 size={18} />
                      <span className="hidden sm:inline">Compartir</span>
                    </button>
                    <button
                      onClick={() => downloadPhoto(photo)}
                      className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                    >
                      <Download size={18} />
                      <span className="hidden sm:inline">Descargar</span>
                    </button>
                    <button
                      onClick={() => onDelete(photo.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                    >
                      <Trash2 size={18} />
                      <span className="hidden sm:inline">Borrar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-900 border-t border-gray-800">
              {photo.title && (
                <h3 className="text-white font-semibold text-lg mb-2 truncate">
                  {photo.title}
                </h3>
              )}
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <span>📅</span>
                {formatDateTime(photo.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
