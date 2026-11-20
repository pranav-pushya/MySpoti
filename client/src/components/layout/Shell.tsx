import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useAppStore } from '../../store/useAppStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { extractDominantColor, ExtractedColor } from '../../utils/colorExtractor';
import { getMediaUrl } from '../../config/api';
import { Playlist } from '../../types';

interface ShellProps {
  children: React.ReactNode;
  categories?: { id: string; name: string; color: string }[];
  playlists?: Playlist[];
  selectedPlaylistId?: string | null;
  onSelectPlaylist?: (id: string | null) => void;
  onOpenCreatePlaylist?: () => void;
  likedCount?: number;
  isFavoritesOnly?: boolean;
  onToggleFavorites?: () => void;
  playerSlot?: React.ReactNode;
  aiDrawerSlot?: React.ReactNode;
  uploadModalSlot?: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  children,
  categories = [],
  playlists = [],
  selectedPlaylistId = null,
  onSelectPlaylist,
  onOpenCreatePlaylist,
  likedCount = 0,
  isFavoritesOnly = false,
  onToggleFavorites,
  playerSlot,
  aiDrawerSlot,
  uploadModalSlot
}) => {
  const { currentTrack } = usePlayerStore();
  const [ambientColor, setAmbientColor] = useState<ExtractedColor | null>(null);

  useEffect(() => {
    if (currentTrack?.coverArtUrl) {
      extractDominantColor(getMediaUrl(currentTrack.coverArtUrl)).then(setAmbientColor);
    } else {
      setAmbientColor(null);
    }
  }, [currentTrack?.coverArtUrl]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white font-sans">
      {/* Left Sidebar (Desktop & Tablet) */}
      <Sidebar 
        categories={categories} 
        playlists={playlists}
        selectedPlaylistId={selectedPlaylistId}
        onSelectPlaylist={onSelectPlaylist}
        onOpenCreatePlaylist={onOpenCreatePlaylist}
        likedCount={likedCount}
        isFavoritesOnly={isFavoritesOnly}
        onToggleFavorites={onToggleFavorites}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full p-2 pl-0 md:pl-0">
        <div 
          className="flex-1 flex flex-col bg-spotify-base rounded-lg overflow-hidden relative border border-white/5 shadow-2xl transition-all duration-700"
          style={{
            background: ambientColor
              ? `radial-gradient(ellipse at 50% -10%, ${ambientColor.rgba(0.25)} 0%, rgba(18, 18, 18, 0.95) 55%, #121212 100%)`
              : undefined
          }}
        >
          {/* Header */}
          <Header />

          {/* Main Scrollable View */}
          <main className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-24">
            {children}
          </main>

          {/* AI Drawer Slot (Slide-over / responsive drawer) */}
          {aiDrawerSlot}
        </div>
      </div>

      {/* Upload Modal Slot */}
      {uploadModalSlot}

      {/* Persistent Bottom Player Bar Slot */}
      <div className="fixed bottom-12 md:bottom-0 left-0 right-0 z-30 pointer-events-auto">
        {playerSlot}
      </div>

      {/* Mobile Bottom Navigation (Only visible on screens < 768px) */}
      <MobileNav />
    </div>
  );
};
