import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Sparkles, 
  Plus, 
  Music, 
  Film, 
  X,
  SlidersHorizontal
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    setIsUploadModalOpen,
    toggleAiDrawer,
    isAiDrawerOpen,
    selectedCategory,
    setSelectedCategory
  } = useAppStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-spotify-base/90 backdrop-blur-md border-b border-white/5 gap-3">
      {/* Left: Navigation Buttons (Desktop) or Brand Icon (Mobile) */}
      <div className="flex items-center gap-2">
        {/* Mobile Brand */}
        <div className="flex md:hidden items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-spotify-green flex items-center justify-center shadow-md shadow-spotify-green/20">
            <Music className="h-4 w-4 text-black" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">MySpoti</span>
        </div>

        {/* Desktop History Controls */}
        <div className="hidden md:flex items-center gap-2">
          <button 
            disabled 
            className="h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-spotify-muted cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            disabled 
            className="h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-spotify-muted cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Active Category Tag Indicator */}
        {selectedCategory && (
          <div className="hidden sm:flex items-center gap-2 ml-2 px-2.5 py-1 rounded-full bg-spotify-elevated text-xs font-medium text-white border border-white/10">
            <span>Filtered by category</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-spotify-muted hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Center: Search Input */}
      <div className="flex-1 max-w-md mx-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-spotify-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracks, categories, or artists..."
            className="w-full h-10 pl-10 pr-9 rounded-full bg-spotify-highlight hover:bg-spotify-elevated focus:bg-spotify-elevated text-sm text-white placeholder-spotify-muted outline-none border border-transparent focus:border-white/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-spotify-muted hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Upload Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white hover:bg-white/90 text-black text-xs sm:text-sm font-bold tracking-tight transition-transform active:scale-95 shadow-md shadow-white/5"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {/* AI DJ Button */}
        <button
          onClick={toggleAiDrawer}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
            isAiDrawerOpen
              ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
              : 'bg-spotify-highlight hover:bg-spotify-elevated border-white/10 text-white'
          }`}
        >
          <Sparkles className="h-4 w-4 text-purple-400 fill-purple-400/20" />
          <span className="hidden xs:inline">AI DJ</span>
        </button>
      </div>
    </header>
  );
};
