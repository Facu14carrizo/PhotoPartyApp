import { useState, useEffect } from 'react';
import { Camera as CameraIcon, LogOut, Loader } from 'lucide-react';
import Camera from './components/Camera';
import PhotoFeed from './components/PhotoFeed';
import AddTitleModal from './components/AddTitleModal';
// import AuthModal from './components/AuthModal'; // Eliminar el AuthModal
// import { useAuth } from './hooks/useAuth';        // Eliminar useAuth
import { savePhoto, getPhotos, deletePhoto } from './lib/photoService';
import type { Photo } from './types/Photo';

function App() {
  // const { user, loading: authLoading, signUp, signIn, signOut } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      setIsLoadingPhotos(true);
      const fetchedPhotos = await getPhotos();
      setPhotos(fetchedPhotos);
      setIsLoadingPhotos(false);
    };
    loadPhotos();
  }, []);

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
  };

  const handleSaveWithTitle = async (title: string) => {
    if (!capturedImage) return;
    setIsSaving(true);

    const savedPhoto = await savePhoto(capturedImage, title);
    if (savedPhoto) {
      setPhotos([savedPhoto, ...photos]);
    }

    setCapturedImage(null);
    setIsSaving(false);
  };

  const handleSkipTitle = async () => {
    if (!capturedImage) return;
    setIsSaving(true);

    const savedPhoto = await savePhoto(capturedImage);
    if (savedPhoto) {
      setPhotos([savedPhoto, ...photos]);
    }

    setCapturedImage(null);
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deletePhoto(id);
    if (success) {
      setPhotos(photos.filter((photo) => photo.id !== id));
    }
  };

  // Eliminar sign out y user
  // Eliminar condicional !user, AuthModal y condicional de authLoading
  if (isLoadingPhotos) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-400">Cargando fotos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col">
      <header className="bg-gray-800/50 backdrop-blur-md shadow-lg sticky top-0 z-10 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Galería de Fotos
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCamera(true)}
              className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full flex items-center gap-2 hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg font-medium text-sm md:text-base"
            >
              <CameraIcon size={20} />
              <span className="hidden sm:inline">Capturar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-0 flex flex-col overflow-hidden">
        <PhotoFeed photos={photos} onDelete={handleDelete} />
      </main>

      {showCamera && (
        <Camera
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
      {capturedImage && !isSaving && (
        <AddTitleModal
          imageUrl={capturedImage}
          onSave={handleSaveWithTitle}
          onSkip={handleSkipTitle}
        />
      )}
    </div>
  );
}

export default App;
