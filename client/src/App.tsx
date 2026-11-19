import React, { useState, useEffect } from 'react';
import { Shell } from './components/layout/Shell';
import { UploadModal } from './components/upload/UploadModal';
import { PlayerBar } from './components/player/PlayerBar';
import { MediaController } from './components/player/MediaController';
import { VideoTheater } from './components/player/VideoTheater';
import { useAppStore } from './store/useAppStore';
import { usePlayerStore } from './store/usePlayerStore';
import { Category, Track } from './types';
import { 
  Music, 
  Upload, 
  Sparkles, 
  Play, 
  Pause, 
  Film, 
  Clock, 
  Plus,
  Trash2,
  ListMusic
} from 'lucide-react';

export default function App() {
  const { 
    activeTab, 
    searchQuery, 
    selectedCategory, 
    setSelectedCategory,
    setIsUploadModalOpen, 
    toggleAiDrawer, 
    isAiDrawerOpen 
  } = useAppStore();

  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    setQueue
  } = usePlayerStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial categories and tracks
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [catRes, trackRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/tracks')
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }

      if (trackRes.ok) {
        const trackData = await trackRes.json();
        setTracks(trackData.tracks || []);
      }
    } catch (err) {
      console.error('Failed to fetch library data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadSuccess = (newTrack: Track) => {
    setTracks(prev => [newTrack, ...prev]);
    // Refresh categories to update track counts
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => d.categories && setCategories(d.categories))
      .catch(console.error);

    // Auto-play the newly uploaded track
    playTrack(newTrack, [newTrack, ...tracks]);
  };

  const handleCategoryCreated = (newCat: Category) => {
    setCategories(prev => {
      if (prev.some(c => c.id === newCat.id)) return prev;
      return [...prev, newCat];
    });
  };

  const handleDeleteTrack = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this track?')) return;
    try {
      const res = await fetch(`/api/tracks/${trackId}`, { method: 'DELETE' });
      if (res.ok) {
        setTracks(prev => prev.filter(t => t.id !== trackId));
        // Refresh categories count
        fetch('/api/categories')
          .then(r => r.json())
          .then(d => d.categories && setCategories(d.categories))
          .catch(console.error);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredTracks = tracks.filter(t => {
    if (selectedCategory && t.categoryId !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchArtist = t.artist.toLowerCase().includes(q);
      const matchCat = t.categoryName?.toLowerCase().includes(q);
      const matchMood = t.moodTags?.some(m => m.toLowerCase().includes(q));
      return matchTitle || matchArtist || matchCat || matchMood;
    }
    return true;
  });

  return (
    <>
      <MediaController />
      <VideoTheater />

      <Shell
        categories={categories}
        uploadModalSlot={
          <UploadModal
            categories={categories}
            onUploadSuccess={handleUploadSuccess}
            onCategoryCreated={handleCategoryCreated}
          />
        }
        playerSlot={<PlayerBar />}
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
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-spotify-green hover:bg-spotify-greenHover text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-spotify-green/20"
                >
                  <Upload className="h-4 w-4 stroke-[2.5]" />
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
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs text-spotify-green hover:underline font-semibold"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map((cat: any) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                    className={`group relative h-28 sm:h-32 rounded-lg p-3 overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-lg flex flex-col justify-between ${
                      isSelected ? 'ring-2 ring-white scale-[1.02]' : ''
                    }`}
                    style={{ backgroundColor: cat.color || '#1db954' }}
                  >
                    <span className="font-bold text-sm sm:text-base text-white drop-shadow-sm">{cat.name}</span>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-white/80 font-medium bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">
                        {cat.trackCount || 0} tracks
                      </span>
                      <div className="h-8 w-8 rounded-full bg-spotify-green text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Play className="h-4 w-4 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Uploaded Tracks Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {selectedCategory 
                  ? `Tracks in ${categories.find(c => c.id === selectedCategory)?.name || 'Category'}`
                  : 'Recently Uploaded Media'}
              </h2>
              <span className="text-xs text-spotify-muted font-medium">{filteredTracks.length} items</span>
            </div>

            {filteredTracks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 p-8 text-center space-y-3 bg-spotify-card/40">
                <div className="mx-auto h-12 w-12 rounded-full bg-spotify-highlight flex items-center justify-center text-spotify-muted">
                  <Music className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">No tracks found</h3>
                <p className="text-xs text-spotify-muted max-w-sm mx-auto">
                  {selectedCategory 
                    ? 'No songs or videos uploaded in this category yet. Upload a track and assign it here!'
                    : 'Drag and drop MP4 music videos, MP3s, or WAV files to start building your personal streaming collection.'}
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 transition-all inline-flex items-center gap-2 shadow-lg"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Media</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
                {filteredTracks.map((t) => {
                  const isVideo = t.format === 'mp4' || t.format === 'webm';
                  const isCurrent = currentTrack?.id === t.id;

                  return (
                    <div
                      key={t.id}
                      onClick={() => playTrack(t, filteredTracks)}
                      className={`group bg-spotify-card hover:bg-spotify-cardHover p-3 rounded-lg border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                        isCurrent ? 'border-spotify-green/60 shadow-lg shadow-spotify-green/10' : 'border-white/5'
                      }`}
                    >
                      <div className="relative aspect-video rounded-md bg-spotify-elevated overflow-hidden mb-2.5 flex items-center justify-center">
                        {t.coverArtUrl ? (
                          <img src={t.coverArtUrl} alt={t.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-spotify-muted gap-1">
                            {isVideo ? <Film className="h-8 w-8 text-purple-400" /> : <Music className="h-8 w-8 text-spotify-green" />}
                          </div>
                        )}
                        
                        {/* Format Badge */}
                        <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md ${
                          isVideo ? 'bg-purple-600/90 text-white' : 'bg-black/60 text-white'
                        }`}>
                          {isVideo ? 'MP4 Video' : t.format.toUpperCase()}
                        </span>

                        {/* Play/Pause Button Overlay */}
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                          isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isCurrent) {
                                togglePlay();
                              } else {
                                playTrack(t, filteredTracks);
                              }
                            }}
                            className="h-10 w-10 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
                          >
                            {isCurrent && isPlaying ? (
                              <Pause className="h-5 w-5 fill-black text-black" />
                            ) : (
                              <Play className="h-5 w-5 fill-black text-black ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-spotify-green' : 'text-white'}`}>
                            {t.title}
                          </h4>
                          <button
                            onClick={(e) => handleDeleteTrack(e, t.id)}
                            title="Delete track"
                            className="text-spotify-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <p className="text-[11px] text-spotify-muted truncate">{t.artist}</p>
                        
                        <div className="flex items-center justify-between pt-1 text-[10px] text-spotify-muted">
                          {t.categoryName && (
                            <span 
                              className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                              style={{ backgroundColor: `${t.categoryColor || '#1db954'}25`, color: t.categoryColor || '#1db954' }}
                            >
                              {t.categoryName}
                            </span>
                          )}
                          {t.duration > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {Math.floor(t.duration / 60)}:{String(Math.floor(t.duration % 60)).padStart(2, '0')}
                            </span>
                          )}
                        </div>

                        {/* Mood Tags */}
                        {t.moodTags && t.moodTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {t.moodTags.slice(0, 3).map((mood, idx) => (
                              <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-spotify-subtext">
                                #{mood}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Shell>
    </>
  );
}
