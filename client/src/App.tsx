import React, { useState, useEffect } from 'react';
import { Shell } from './components/layout/Shell';
import { useAppStore } from './store/useAppStore';
import { Music, Upload, Sparkles, FolderHeart, Play, Film } from 'lucide-react';

export default function App() {
  const { 
    activeTab, 
    searchQuery, 
    selectedCategory, 
    setIsUploadModalOpen, 
    toggleAiDrawer,
    isAiDrawerOpen 
  } = useAppStore();

  const [categories, setCategories] = useState<{ id: string; name: string; color: string }[]>([
    { id: '1', name: 'Chill & Relax', color: '#1db954' },
    { id: '2', name: 'Workout Beats', color: '#e91429' },
    { id: '3', name: 'Lo-Fi Focus', color: '#8c67ac' },
    { id: '4', name: 'Pop Hits', color: '#1e3264' },
    { id: '5', name: 'Rock Classics', color: '#e8115b' }
  ]);

  return (
    <Shell
      categories={categories}
      playerSlot={
        <div className="h-16 md:h-20 bg-spotify-highlight/95 backdrop-blur-md border-t border-white/10 px-4 flex items-center justify-between text-xs text-spotify-muted">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded bg-spotify-card flex items-center justify-center text-spotify-muted border border-white/10">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <p className="text-white font-medium text-xs md:text-sm">No track playing</p>
              <p className="text-[11px] text-spotify-muted">Select or upload a song</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-spotify-green text-black font-semibold text-xs flex items-center gap-1.5 hover:scale-105 transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Track</span>
            </button>
          </div>
        </div>
      }
      aiDrawerSlot={
        isAiDrawerOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-full sm:w-80 md:w-96 bg-spotify-card/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col p-4 shadow-2xl transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">AI Mood DJ</h3>
              </div>
              <button 
                onClick={toggleAiDrawer}
                className="text-xs text-spotify-muted hover:text-white px-2 py-1 rounded bg-spotify-highlight"
              >
                Close
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <Sparkles className="h-8 w-8 text-purple-400 mb-2 animate-pulse" />
              <p className="text-sm font-semibold text-white">Your Personal AI DJ</p>
              <p className="text-xs text-spotify-muted mt-1">Ready to recommend tracks according to your mood once media is uploaded.</p>
            </div>
          </div>
        )
      }
    >
      <div className="p-4 sm:p-6 space-y-6">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-r from-purple-900/60 via-spotify-card to-spotify-base border border-white/10">
          <div className="relative z-10 max-w-xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-spotify-green">Personal Cloud Music</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Welcome to MySpoti</h1>
            <p className="text-xs sm:text-sm text-spotify-subtext leading-relaxed">
              Upload your MP4 video songs, MP3s, and music tracks. Group them by category and let your Gemini AI DJ queue up the perfect mood mix.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-spotify-green hover:bg-spotify-greenHover text-black font-bold text-xs sm:text-sm transition-all"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Media</span>
              </button>
              <button
                onClick={toggleAiDrawer}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-spotify-elevated hover:bg-spotify-highlight text-white font-semibold text-xs sm:text-sm border border-white/10 transition-all"
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Try AI Mood DJ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Explore Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group relative h-28 sm:h-32 rounded-lg p-3 overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-lg flex flex-col justify-between"
                style={{ backgroundColor: cat.color }}
              >
                <span className="font-bold text-sm sm:text-base text-white drop-shadow-sm">{cat.name}</span>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-white/80 font-medium bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">
                    0 tracks
                  </span>
                  <div className="h-8 w-8 rounded-full bg-spotify-green text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play className="h-4 w-4 fill-black ml-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty Library State Preview */}
        <div className="rounded-xl border border-dashed border-white/15 p-8 text-center space-y-3 bg-spotify-card/40">
          <div className="mx-auto h-12 w-12 rounded-full bg-spotify-highlight flex items-center justify-center text-spotify-muted">
            <Music className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">Your uploaded library is empty</h3>
          <p className="text-xs text-spotify-muted max-w-sm mx-auto">
            Drag and drop MP4 music videos, MP3s, or WAV files to start building your personal streaming collection.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 transition-all inline-flex items-center gap-2"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Your First Track</span>
          </button>
        </div>
      </div>
    </Shell>
  );
}
