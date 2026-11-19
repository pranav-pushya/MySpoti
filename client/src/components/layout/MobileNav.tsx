import React from 'react';
import { Home, Search, Library, PlusCircle, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const MobileNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsUploadModalOpen, 
    toggleAiDrawer, 
    isAiDrawerOpen,
    setSelectedCategory
  } = useAppStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 flex items-center justify-around select-none">
      <button
        onClick={() => { setActiveTab('home'); setSelectedCategory(null); }}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          activeTab === 'home' ? 'text-white' : 'text-spotify-muted hover:text-white'
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button
        onClick={() => setActiveTab('search')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          activeTab === 'search' ? 'text-white' : 'text-spotify-muted hover:text-white'
        }`}
      >
        <Search className="h-5 w-5" />
        <span className="text-[10px] font-medium">Search</span>
      </button>

      <button
        onClick={() => setIsUploadModalOpen(true)}
        className="flex flex-col items-center gap-1 py-1 px-3 text-spotify-green hover:text-spotify-greenHover transition-transform active:scale-90"
      >
        <PlusCircle className="h-6 w-6" />
        <span className="text-[10px] font-bold text-white">Upload</span>
      </button>

      <button
        onClick={toggleAiDrawer}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          isAiDrawerOpen ? 'text-purple-400 font-bold' : 'text-spotify-muted hover:text-purple-300'
        }`}
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-[10px] font-medium">AI DJ</span>
      </button>

      <button
        onClick={() => { setActiveTab('library'); setSelectedCategory(null); }}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          activeTab === 'library' ? 'text-white' : 'text-spotify-muted hover:text-white'
        }`}
      >
        <Library className="h-5 w-5" />
        <span className="text-[10px] font-medium">Library</span>
      </button>
    </nav>
  );
};
