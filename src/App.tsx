import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { PhotoGrid } from './components/photos/PhotoGrid';
import { UploadButton } from './components/photos/UploadButton';
import { usePhotos } from './hooks/usePhotos';
import { Search, SlidersHorizontal } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { photos, isLoading, refetch, deletePhoto } = usePhotos();

  // Filter photos based on search query
  const filteredPhotos = photos.filter(photo => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      photo.file_name.toLowerCase().includes(query) ||
      photo.metadata?.category?.toLowerCase().includes(query) ||
      photo.metadata?.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      photo.metadata?.description?.toLowerCase().includes(query)
    );
  });

  const handleUploadComplete = () => {
    refetch();
  };

  return (
    <MainLayout currentView={currentView} onViewChange={setCurrentView}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {currentView === 'all' && 'Todas as Fotos'}
              {currentView === 'albums' && 'Álbuns'}
              {currentView === 'favorites' && 'Favoritos'}
              {currentView === 'trash' && 'Lixeira'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'foto' : 'fotos'}
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por tags, categorias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 border-0 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
              />
            </div>
            <button className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Photo Grid */}
      <PhotoGrid
        photos={filteredPhotos}
        isLoading={isLoading}
        onDeletePhoto={deletePhoto}
      />

      {/* Upload Button */}
      <UploadButton onUploadComplete={handleUploadComplete} />
    </MainLayout>
  );
}

export default App;
