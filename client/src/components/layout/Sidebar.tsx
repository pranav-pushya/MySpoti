import React from 'react';
import { Home, Search, Library, Plus, Sparkles, Music, Film, FolderHeart, Heart } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface SidebarProps {
  categories?: { id: string; name: string; color: string }[];
  likedCount?: number;
  isFavoritesOnly?: boolean;
  onToggleFavorites?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  categories = [], 
  likedCount = 0,
  isFavoritesOnly = false,
  onToggleFavorites
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsUploadModalOpen, 
    toggleAiDrawer, 
    isAiDrawerOpen,
    selectedCategory,
    setSelectedCategory
  } = useAppStore();

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 h-full bg-black p-2 gap-2 select-none shrink-0">
      {/* Top Navigation Card */}
      <div className="bg-spotify-base rounded-lg p-4 flex flex-col gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="h-9 w-9 rounded-full bg-spotify-green flex items-center justify-center shadow-lg shadow-spotify-green/20">
            <Music className="h-5 w-5 text-black" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              MySpoti <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-spotify-green/20 text-spotify-green border border-spotify-green/30">Cloud</span>
            </span>
          </div>
        </div>

        {/* Primary Links */}
        <nav className="flex flex-col gap-1 mt-2">
          <button
            onClick={() => { setActiveTab('home'); setSelectedCategory(null); if (isFavoritesOnly && onToggleFavorites) onToggleFavorites(); }}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 ${
              activeTab === 'home' && !selectedCategory && !isFavoritesOnly
                ? 'text-white bg-spotify-highlight'
                : 'text-spotify-muted hover:text-white hover:bg-spotify-highlight/60'
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 ${
              activeTab === 'search'
                ? 'text-white bg-spotify-highlight'
                : 'text-spotify-muted hover:text-white hover:bg-spotify-highlight/60'
            }`}
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </button>

          <button
            onClick={() => { setActiveTab('library'); setSelectedCategory(null); }}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 ${
              activeTab === 'library'
                ? 'text-white bg-spotify-highlight'
                : 'text-spotify-muted hover:text-white hover:bg-spotify-highlight/60'
            }`}
          >
            <Library className="h-5 w-5" />
            <span>Your Library</span>
          </button>
        </nav>
      </div>

      {/* Library & Categories Card */}
      <div className="bg-spotify-base rounded-lg p-3 flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
        {/* Library Header with Actions */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2 text-spotify-muted font-semibold text-xs tracking-wider uppercase">
            <FolderHeart className="h-4 w-4" />
            <span>Your Collection</span>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            title="Upload Song or Video"
            className="flex items-center justify-center h-7 w-7 rounded-full bg-spotify-highlight hover:bg-spotify-elevated text-spotify-muted hover:text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Liked Songs Permanent Card */}
        <button
          onClick={() => {
            setSelectedCategory(null);
            if (onToggleFavorites && !isFavoritesOnly) onToggleFavorites();
          }}
          className={`flex items-center gap-3 w-full p-2.5 rounded-lg border transition-all text-left ${
            isFavoritesOnly
              ? 'bg-gradient-to-r from-purple-900/60 to-pink-900/40 border-pink-500/50 text-white shadow-lg shadow-purple-950/40'
              : 'bg-spotify-highlight/30 hover:bg-spotify-highlight/60 border-white/5 text-spotify-subtext hover:text-white'
          }`}
        >
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Heart className="h-4 w-4 fill-white text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white">Liked Songs</p>
            <p className="text-[11px] text-spotify-muted">{likedCount} songs</p>
          </div>
        </button>

        {/* Upload Action Callout */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-3 w-full p-2.5 rounded-lg bg-gradient-to-r from-spotify-card to-spotify-elevated border border-white/5 hover:border-spotify-green/40 transition-all text-left group"
        >
          <div className="h-8 w-8 rounded-md bg-spotify-green/20 group-hover:bg-spotify-green text-spotify-green group-hover:text-black flex items-center justify-center transition-all">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Upload Media</p>
            <p className="text-[11px] text-spotify-muted">MP4 video, MP3, WAV</p>
          </div>
        </button>

        {/* AI DJ Button */}
        <button
          onClick={toggleAiDrawer}
          className={`flex items-center gap-3 w-full p-2.5 rounded-lg border transition-all text-left ${
            isAiDrawerOpen
              ? 'bg-gradient-to-r from-purple-900/40 to-spotify-green/20 border-spotify-green text-white shadow-lg shadow-purple-950/30'
              : 'bg-spotify-highlight/40 hover:bg-spotify-highlight border-white/5 text-spotify-subtext hover:text-white'
          }`}
        >
          <div className="h-8 w-8 rounded-md bg-gradient-to-tr from-purple-500 to-spotify-green flex items-center justify-center text-black">
            <Sparkles className="h-4 w-4 fill-black" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white">AI Mood DJ</p>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">AI</span>
            </div>
            <p className="text-[11px] text-spotify-muted truncate">Smart recommendations</p>
          </div>
        </button>

        {/* Dynamic Category List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          <p className="text-[10px] font-semibold text-spotify-muted uppercase px-2 pt-1 tracking-wider">Categories</p>
          {categories.length === 0 ? (
            <div className="px-2 py-2 text-center">
              <p className="text-xs text-spotify-muted">No categories yet.</p>
            </div>
          ) : (
            categories.map((cat) => {
              const isSelected = selectedCategory === cat.id && !isFavoritesOnly;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (isFavoritesOnly && onToggleFavorites) onToggleFavorites();
                    setSelectedCategory(isSelected ? null : cat.id);
                    setActiveTab('home');
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all text-left truncate ${
                    isSelected
                      ? 'bg-spotify-elevated text-white border-l-2 border-spotify-green'
                      : 'text-spotify-muted hover:text-white hover:bg-spotify-highlight/50'
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color || '#1db954' }}
                  />
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
