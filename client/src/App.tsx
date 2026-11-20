import React, { useState, useEffect } from 'react';
import { Shell } from './components/layout/Shell';
import { UploadModal } from './components/upload/UploadModal';
import { PlayerBar } from './components/player/PlayerBar';
import { MediaController } from './components/player/MediaController';
import { VideoTheater } from './components/player/VideoTheater';
import { CategoryPills } from './components/library/CategoryPills';
import { TrackTable } from './components/library/TrackTable';
import { AiDjDrawer } from './components/ai/AiDjDrawer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAppStore } from './store/useAppStore';
import { usePlayerStore } from './store/usePlayerStore';
import { Category, Track, Playlist } from './types';
import { PlaylistModal } from './components/library/PlaylistModal';
import { AddToPlaylistMenu } from './components/library/AddToPlaylistMenu';
import { ReelsFeed } from './components/player/ReelsFeed';
import { InstallAppPrompt } from './components/pwa/InstallAppPrompt';
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
  LayoutGrid,
  List,
  Search,
  Heart,
  ListMusic
} from 'lucide-react';

export default function App() {
  const { 
    activeTab, 
    setActiveTab,
    searchQuery, 
    setSearchQuery,
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
    toggleCurrentTrackFavorite
  } = usePlayerStore();

  // Initialize global keyboard shortcuts (Space, Arrow keys, M, Esc)
  useKeyboardShortcuts();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [currentPlaylistDetails, setCurrentPlaylistDetails] = useState<Playlist | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [isFavoritesOnly, setIsFavoritesOnly] = useState(false);
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [reelsInitialTrackId, setReelsInitialTrackId] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial categories, tracks, and playlists
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [catRes, trackRes, playlistRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/tracks'),
        fetch('/api/playlists')
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }

      if (trackRes.ok) {
        const trackData = await trackRes.json();
        setTracks(trackData.tracks || []);
      }

      if (playlistRes.ok) {
        const plData = await playlistRes.json();
        setPlaylists(plData.playlists || []);
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

  // Fetch individual playlist details when a playlist is selected
  const fetchPlaylistDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/playlists/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentPlaylistDetails(data.playlist);
      }
    } catch (err) {
      console.error('Failed to fetch playlist details:', err);
    }
  };

  useEffect(() => {
    if (selectedPlaylistId) {
      fetchPlaylistDetails(selectedPlaylistId);
    } else {
      setCurrentPlaylistDetails(null);
    }
  }, [selectedPlaylistId]);

  const handlePlaylistCreated = (newPlaylist: Playlist) => {
    setPlaylists(prev => [newPlaylist, ...prev]);
    setSelectedPlaylistId(newPlaylist.id);
    setIsFavoritesOnly(false);
    setSelectedCategory(null);
  };

  const handleAddToPlaylist = async (playlistId: string, trackId: string) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId })
      });
      if (res.ok) {
        // Refresh playlists counts
        const plRes = await fetch('/api/playlists');
        if (plRes.ok) {
          const plData = await plRes.json();
          setPlaylists(plData.playlists || []);
        }
        if (selectedPlaylistId === playlistId) {
          fetchPlaylistDetails(playlistId);
        }
      }
    } catch (err) {
      console.error('Add to playlist error:', err);
    }
  };

  const handleRemoveTrackFromPlaylist = async (trackId: string) => {
    if (!selectedPlaylistId) return;
    try {
      const res = await fetch(`/api/playlists/${selectedPlaylistId}/tracks/${trackId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchPlaylistDetails(selectedPlaylistId);
        const plRes = await fetch('/api/playlists');
        if (plRes.ok) {
          const plData = await plRes.json();
          setPlaylists(plData.playlists || []);
        }
      }
    } catch (err) {
      console.error('Remove from playlist error:', err);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedPlaylistId === playlistId) {
          setSelectedPlaylistId(null);
        }
        setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      }
    } catch (err) {
      console.error('Delete playlist error:', err);
    }
  };

  const handleUploadSuccess = (newTrack: Track) => {
    setTracks(prev => [newTrack, ...prev]);
    // Refresh categories
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
        fetch('/api/categories')
          .then(r => r.json())
          .then(d => d.categories && setCategories(d.categories))
          .catch(console.error);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggleLike = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    // Optimistically update tracks list
    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        return { ...t, isFavorite: !t.isFavorite };
      }
      return t;
    }));

    // If current playing track is the one liked/unliked, sync player state
    if (currentTrack?.id === trackId) {
      toggleCurrentTrackFavorite();
    }

    try {
      await fetch(`/api/tracks/${trackId}/like`, { method: 'POST' });
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  const likedCount = tracks.filter(t => t.isFavorite).length;

  const displayedTracks = (selectedPlaylistId && currentPlaylistDetails ? currentPlaylistDetails.tracks || [] : tracks).filter(t => {
    if (!selectedPlaylistId) {
      if (isFavoritesOnly && !t.isFavorite) return false;
      if (selectedCategory && t.categoryId !== selectedCategory) return false;
      if (selectedFormat && t.format !== selectedFormat) return false;
    }
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
        playlists={playlists}
        selectedPlaylistId={selectedPlaylistId}
        onSelectPlaylist={(id) => {
          setSelectedPlaylistId(id);
          if (id) {
            setIsFavoritesOnly(false);
            setSelectedCategory(null);
          }
        }}
        onOpenCreatePlaylist={() => setIsPlaylistModalOpen(true)}
        likedCount={likedCount}
        isFavoritesOnly={isFavoritesOnly}
        onToggleFavorites={() => {
          setIsFavoritesOnly(prev => !prev);
          setSelectedCategory(null);
          setSelectedFormat(null);
          setSelectedPlaylistId(null);
        }}
        uploadModalSlot={
          <UploadModal
            categories={categories}
            onUploadSuccess={handleUploadSuccess}
            onCategoryCreated={handleCategoryCreated}
          />
        }
        playerSlot={<PlayerBar />}
        aiDrawerSlot={<AiDjDrawer tracks={tracks} />}
      >
        <div className="p-4 sm:p-6 space-y-6">
          {/* Top Category Filter Chips Carousel */}
          <CategoryPills
            categories={categories}
            selectedCategoryId={selectedCategory}
            onSelectCategory={(id) => {
              setSelectedCategory(id);
              if (id) {
                setIsFavoritesOnly(false);
                setSelectedPlaylistId(null);
              }
            }}
            selectedFormat={selectedFormat}
            onSelectFormat={(format) => {
              setSelectedFormat(format);
              if (format) {
                setIsFavoritesOnly(false);
                setSelectedPlaylistId(null);
              }
            }}
            isFavoritesOnly={isFavoritesOnly}
            onToggleFavorites={() => {
              setIsFavoritesOnly(prev => !prev);
              if (!isFavoritesOnly) {
                setSelectedCategory(null);
                setSelectedFormat(null);
                setSelectedPlaylistId(null);
              }
            }}
            onOpenReels={() => {
              setReelsInitialTrackId(undefined);
              setIsReelsOpen(true);
            }}
          />

          {/* Playlist Hero Header (When viewing a specific playlist) */}
          {selectedPlaylistId && currentPlaylistDetails && (
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 p-6 rounded-xl bg-gradient-to-b from-indigo-900/60 via-spotify-card to-spotify-base border border-white/10 shadow-2xl">
              <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center text-white shadow-2xl shrink-0">
                <ListMusic className="h-16 w-16" />
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-spotify-muted">Public Playlist</span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white truncate tracking-tight">
                  {currentPlaylistDetails.name}
                </h1>
                {currentPlaylistDetails.description && (
                  <p className="text-xs sm:text-sm text-spotify-subtext line-clamp-2">
                    {currentPlaylistDetails.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-spotify-muted">
                  <span className="font-semibold text-white">MySpoti Cloud</span>
                  <span>•</span>
                  <span>{displayedTracks.length} tracks</span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (displayedTracks.length > 0) {
                        playTrack(displayedTracks[0], displayedTracks);
                      }
                    }}
                    disabled={displayedTracks.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-spotify-green hover:bg-spotify-greenHover disabled:opacity-50 text-black font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <Play className="h-4 w-4 fill-black ml-0.5" />
                    <span>Play All</span>
                  </button>
                  <button
                    onClick={() => handleDeletePlaylist(currentPlaylistDetails.id)}
                    title="Delete Playlist"
                    className="p-2.5 rounded-full text-spotify-muted hover:text-red-400 hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Hero Banner (Only show when not actively searching, not in filter, and not in playlist) */}
          {!searchQuery && !selectedCategory && !selectedFormat && !isFavoritesOnly && !selectedPlaylistId && (
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
          )}

          {/* Category Cards (When no search, no filter, and no playlist) */}
          {!searchQuery && !selectedCategory && !selectedFormat && !isFavoritesOnly && !selectedPlaylistId && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white tracking-tight">Explore Categories</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {categories.map((cat: any) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="group relative h-28 sm:h-32 rounded-lg p-3 overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-lg flex flex-col justify-between"
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
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Tracks View Section */}
          <div className="space-y-4">
            {/* Section Header with View Mode Toggles */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>
                    {searchQuery
                      ? `Search Results for "${searchQuery}"`
                      : selectedPlaylistId
                        ? `Tracks in ${currentPlaylistDetails?.name || 'Playlist'}`
                        : isFavoritesOnly
                          ? 'Liked Songs'
                          : selectedCategory
                            ? `Tracks in ${categories.find(c => c.id === selectedCategory)?.name || 'Category'}`
                            : selectedFormat === 'mp4'
                              ? 'MP4 Music Videos'
                              : 'Your Uploaded Media'}
                  </span>
                  <span className="text-xs font-normal text-spotify-muted">
                    ({displayedTracks.length})
                  </span>
                </h2>
              </div>

              {/* View Mode Controls */}
              <div className="flex items-center gap-1 bg-spotify-highlight p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-spotify-elevated text-white' : 'text-spotify-muted hover:text-white'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-spotify-elevated text-white' : 'text-spotify-muted hover:text-white'}`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Empty state */}
            {displayedTracks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 p-8 text-center space-y-3 bg-spotify-card/40">
                <div className="mx-auto h-12 w-12 rounded-full bg-spotify-highlight flex items-center justify-center text-spotify-muted">
                  {selectedPlaylistId ? (
                    <ListMusic className="h-6 w-6 text-spotify-green" />
                  ) : isFavoritesOnly ? (
                    <Heart className="h-6 w-6 text-pink-400" />
                  ) : (
                    <Music className="h-6 w-6" />
                  )}
                </div>
                <h3 className="text-base font-bold text-white">
                  {selectedPlaylistId 
                    ? 'This playlist is empty' 
                    : isFavoritesOnly 
                      ? 'No liked songs yet' 
                      : 'No tracks found'}
                </h3>
                <p className="text-xs text-spotify-muted max-w-sm mx-auto">
                  {searchQuery
                    ? `No matches found for "${searchQuery}". Try a different keyword.`
                    : selectedPlaylistId
                      ? 'Add songs or music videos to this playlist from your library using the playlist button on any track.'
                      : isFavoritesOnly
                        ? 'Click the heart icon on any song or video card to add it to your Liked Songs collection.'
                        : selectedCategory
                          ? 'No songs or videos uploaded in this category yet. Upload a track and select this category!'
                          : selectedFormat === 'mp4'
                            ? 'No MP4 music videos found. Upload a video file to watch here!'
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
            ) : viewMode === 'list' ? (
              /* List / Table View */
              <div className="bg-spotify-card/40 rounded-xl p-2 border border-white/5">
                <TrackTable 
                  tracks={displayedTracks} 
                  playlists={playlists}
                  onDeleteTrack={handleDeleteTrack}
                  onToggleLike={handleToggleLike}
                  onAddToPlaylist={handleAddToPlaylist}
                  onRemoveFromPlaylist={selectedPlaylistId ? handleRemoveTrackFromPlaylist : undefined}
                  isPlaylistView={!!selectedPlaylistId}
                  onOpenCreatePlaylist={() => setIsPlaylistModalOpen(true)}
                />
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
                {displayedTracks.map((t) => {
                  const isVideo = t.format === 'mp4' || t.format === 'webm';
                  const isCurrent = currentTrack?.id === t.id;

                  return (
                    <div
                      key={t.id}
                      onClick={() => playTrack(t, displayedTracks)}
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
                        
                        {/* Format Badge / Reels Launcher */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md ${
                            isVideo ? 'bg-purple-600/90 text-white' : 'bg-black/60 text-white'
                          }`}>
                            {isVideo ? 'MP4 Video' : t.format.toUpperCase()}
                          </span>
                          {isVideo && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReelsInitialTrackId(t.id);
                                setIsReelsOpen(true);
                              }}
                              title="Watch in Reels Feed"
                              className="px-1.5 py-0.5 rounded bg-black/70 hover:bg-purple-700 text-[9px] font-bold text-white backdrop-blur-md border border-white/10 transition-colors"
                            >
                              🎬 Reel
                            </button>
                          )}
                        </div>

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
                                playTrack(t, displayedTracks);
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
                          <h4 className={`text-xs font-bold truncate flex-1 pr-1 ${isCurrent ? 'text-spotify-green' : 'text-white'}`}>
                            {t.title}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => handleToggleLike(e, t.id)}
                              title={t.isFavorite ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
                              className={`p-1 rounded transition-colors ${
                                t.isFavorite 
                                  ? 'text-spotify-green' 
                                  : 'text-spotify-muted hover:text-white opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Heart className={`h-3.5 w-3.5 ${t.isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            <AddToPlaylistMenu
                              trackId={t.id}
                              playlists={playlists}
                              onAddToPlaylist={handleAddToPlaylist}
                              onOpenCreatePlaylist={() => setIsPlaylistModalOpen(true)}
                            />
                            {selectedPlaylistId ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveTrackFromPlaylist(t.id);
                                }}
                                title="Remove from playlist"
                                className="text-spotify-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleDeleteTrack(e, t.id)}
                                title="Delete track"
                                className="text-spotify-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
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

      {/* Playlist Creation Modal */}
      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />

      {/* Vertical Video Reels Feed */}
      {isReelsOpen && (
        <ReelsFeed
          tracks={tracks}
          playlists={playlists}
          initialTrackId={reelsInitialTrackId}
          onClose={() => setIsReelsOpen(false)}
          onToggleLike={handleToggleLike}
          onAddToPlaylist={handleAddToPlaylist}
          onOpenCreatePlaylist={() => setIsPlaylistModalOpen(true)}
        />
      )}

      {/* PWA Mobile & Tablet Install Prompt (Bottom Left) */}
      <InstallAppPrompt />
    </>
  );
}
